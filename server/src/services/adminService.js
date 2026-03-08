const db = require("../utils/connectdb");
const { sendTicketResolvedEmail } = require("./emailService");

const getTeamTicketsService = async (adminId) => {
  try {
    const teamResult = await db.query(
      `SELECT t.team_id
       FROM admins a
       JOIN teams t ON a.team_id = t.team_id
       WHERE a.user_id = $1`,
      [adminId]
    );

    if (!teamResult.rows.length) {
      const err = new Error("No team assigned");
      err.statusCode = 403;
      throw err;
    }

    const teamId = teamResult.rows[0].team_id;

    const baseTicketSelect = `
      SELECT
        t.*,
        u.username AS user_name,
        u.email,
        tm.team_name
      FROM tickets t
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN teams tm ON t.team_id = tm.team_id
    `;

    const activeResult = await db.query(
      `${baseTicketSelect}
       WHERE t.team_id = $1
         AND LOWER(COALESCE(t.status, '')) <> 'resolved'
       ORDER BY t.created_at DESC`,
      [teamId]
    );

    const forwardedResult = await db.query(
      `${baseTicketSelect}
       JOIN (
         SELECT DISTINCT ON (ticket_id)
           ticket_id,
           created_at
         FROM ticket_flow
         WHERE action = 'FORWARDED'
           AND from_team_id = $1
         ORDER BY ticket_id, created_at DESC
       ) tf ON tf.ticket_id = t.ticket_id
       ORDER BY tf.created_at DESC`,
      [teamId]
    );

    const resolvedResult = await db.query(
      `${baseTicketSelect}
       JOIN (
         SELECT DISTINCT ON (ticket_id)
           ticket_id,
           created_at
         FROM ticket_flow
         WHERE action = 'RESOLVED'
           AND from_team_id = $1
         ORDER BY ticket_id, created_at DESC
       ) tf ON tf.ticket_id = t.ticket_id
       ORDER BY tf.created_at DESC`,
      [teamId]
    );

    return {
      active: activeResult.rows,
      forwarded: forwardedResult.rows,
      resolved: resolvedResult.rows,
      adminTeamId: teamId
    };
  } catch (err) {
    console.error("getTeamTicketsService error:", {
      error: err.message,
      stack: err.stack
    });
    throw err;
  }
};

const getTicketByIdService = async (ticketId) => {
  try {

    const sql = `
      SELECT 
        t.*,
        u.username AS user_name,
        u.email,
        tm.team_name
      FROM tickets t
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN teams tm ON t.team_id = tm.team_id
      WHERE t.ticket_id = $1
    `;

    const result = await db.query(sql, [ticketId]);

    return result.rows[0] || null;

  } catch (err) {

    console.error("getTicketByIdService error:", err);

    throw new Error("Failed to fetch ticket");

  }
};

const getTicketFlowService = async (ticketId) => {
  try {

    const sql = `
      SELECT 
        f.flow_id,
        f.ticket_id,
        f.action,
        f.from_team_id,
        ft.team_name AS from_team_name,
        f.to_team_id,
        tt.team_name AS to_team_name,
        f.user_id,
        f.remarks,
        f.created_at
      FROM ticket_flow f
      LEFT JOIN teams ft ON f.from_team_id = ft.team_id
      LEFT JOIN teams tt ON f.to_team_id = tt.team_id
      WHERE f.ticket_id = $1
      ORDER BY f.created_at ASC
    `;

    const result = await db.query(sql, [ticketId]);

    return result.rows;

  } catch (err) {
    console.error("getTicketFlowService error:", err);
    throw new Error("Failed to fetch ticket flow");
  }
};

const resolveTicketService = async (ticketId, remarks, userId) => {
  try {

    // Get current ticket
    const ticketResult = await db.query(
      `SELECT t.*, u.email, u.username AS user_name
       FROM tickets t
       JOIN users u ON t.user_id = u.user_id
       WHERE t.ticket_id = $1`,
      [ticketId]
    );

    if (!ticketResult.rows.length) {
      const err = new Error("Ticket not found");
      err.statusCode = 404;
      throw err;
    }

    const currentTicket = ticketResult.rows[0];

    if (currentTicket.status === "Resolved") {
      const err = new Error("Cannot update a resolved ticket");
      err.statusCode = 409;
      throw err;
    }

    // Update ticket
    const updateResult = await db.query(
      `UPDATE tickets
       SET status = 'Resolved', resolved_at = NOW()
       WHERE ticket_id = $1
       RETURNING *`,
      [ticketId]
    );

    // Add flow record
    const flowResult = await db.query(
      `INSERT INTO ticket_flow (
        ticket_id,
        action,
        from_team_id,
        to_team_id,
        user_id,
        remarks
      )
      VALUES ($1, 'RESOLVED', $2, $2, $3, $4)
      RETURNING *`,
      [ticketId, currentTicket.team_id, userId, remarks]
    );

    try {
      await sendTicketResolvedEmail({
        to: currentTicket.email,
        userName: currentTicket.user_name,
        ticketId,
        ticketTitle: currentTicket.ticket_title,
        remarks,
      });
    } catch (emailErr) {
      // Resolution should succeed even if email delivery fails.
      console.error("resolveTicketService email error:", emailErr.message);
    }

    return {
      success: true,
      ticket: updateResult.rows[0],
      flow: flowResult.rows[0],
      message: "Ticket resolved successfully"
    };
  } catch (err) {
    console.error("resolveTicketService error:", {
      error: err.message,
      ticketId,
      statusCode: err.statusCode || 500
    });
    throw err;
  }
};

const forwardTicketService = async (ticketId, toTeamId, remarks, userId) => {
  try {

    if (!toTeamId) {
      const err = new Error("Team ID is required for forwarding");
      err.statusCode = 400;
      throw err;
    }

    // Get current ticket
    const ticketResult = await db.query(
      "SELECT * FROM tickets WHERE ticket_id = $1",
      [ticketId]
    );

    if (!ticketResult.rows.length) {
      const err = new Error("Ticket not found");
      err.statusCode = 404;
      throw err;
    }

    const currentTicket = ticketResult.rows[0];

    if (currentTicket.status === "Resolved") {
      const err = new Error("Cannot update a resolved ticket");
      err.statusCode = 409;
      throw err;
    }

    // Update ticket
    const updateResult = await db.query(
      `UPDATE tickets
       SET status = 'Forwarded', team_id = $1
       WHERE ticket_id = $2
       RETURNING *`,
      [toTeamId, ticketId]
    );

    // Add flow record
    const flowResult = await db.query(
      `INSERT INTO ticket_flow (
        ticket_id,
        action,
        from_team_id,
        to_team_id,
        user_id,
        remarks
      )
      VALUES ($1, 'FORWARDED', $2, $3, $4, $5)
      RETURNING *`,
      [ticketId, currentTicket.team_id, toTeamId, userId, remarks]
    );

    return {
      success: true,
      ticket: updateResult.rows[0],
      flow: flowResult.rows[0],
      message: "Ticket forwarded successfully"
    };
  } catch (err) {
    console.error("forwardTicketService error:", {
      error: err.message,
      ticketId,
      statusCode: err.statusCode || 500
    });
    throw err;
  }
};






module.exports = {
  getTeamTicketsService,
  getTicketByIdService,
  getTicketFlowService,
  resolveTicketService,
  forwardTicketService,
};