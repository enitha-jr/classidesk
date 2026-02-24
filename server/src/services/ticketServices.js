const db = require("../utils/connectdb");
const axios = require("axios");
const { analyzeTicket } = require("../controller/aiController");

const getTeams = async () => {
  try {
    const result = await db.query(
      "SELECT team_id, team_name FROM teams ORDER BY team_name"
    );
    return result.rows;
  } catch (err) {
    console.error("getTeams error:", err);
    throw new Error("Failed to fetch teams");
  }
};

  const createTicketService = async (req) => {
    try {
      const userId = req.user.user_id;
      const { ticket_title, ticket_desc, team } = req.body;
      const filePath = req.file ? `/files/${req.file.filename}` : null;

      let aiResult = {};
      try {
        const aiResponse = await axios.post(
          "http://127.0.0.1:5000/analyze",
          { ticket_title, ticket_desc },
          { timeout: 3000 }
        );
        aiResult = aiResponse.data;
        const confidence = aiResult?.team_confidence ?? 0;
        console.log(aiResult);
        if(confidence < 0.3){
          console.log("low confidence");
          aiResult = await analyzeTicket(ticket_title, ticket_desc);
        }
        
      } catch (error) {
        console.error("AI service failed:", error.message);
        aiResult = await analyzeTicket(ticket_title, ticket_desc);
      }

      const finalTeam = team || aiResult.team || "General";
      const aiTeam = team ? null : aiResult.team || null;
      const priority = aiResult.priority || "Medium";
      const aiSummary = aiResult.summary || null;

      const sql = `
        INSERT INTO tickets (
          ticket_title,
          ticket_desc,
          team,
          ai_team,
          priority,
          ai_summary,
          status,
          user_id,
          attachment
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'Initiated', $7, $8)
        RETURNING *
      `;

      const values = [
        ticket_title,
        ticket_desc,
        finalTeam,
        aiTeam,
        priority,
        aiSummary,
        userId,
        filePath,
      ];

      const result = await db.query(sql, values);

      if (result.rows.length) {
        const ticketFlowSql = `
          INSERT INTO ticket_flow (
            ticket_id,
            action,
            from_team,
            to_team,
            action_by,
            remarks
          )
          VALUES ($1, 'CREATED', NULL, $2, $3, 'Ticket created')
        `;

        const flowValues = [
          result.rows[0].ticket_id,
          finalTeam,
          userId,
        ];

        await db.query(ticketFlowSql, flowValues);
      }

      return result.rows[0];
    } catch (err) {
      console.error("createTicket error:", err);
      throw new Error("Failed to create ticket");
    }
};

const getUserTicketService = async (req) => {
  try {
    const userId = req.user.user_id;
    const result = await db.query(
      "SELECT * FROM tickets WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return result.rows;
  } catch (err) {
    console.error("getUserTicketService error:", err);
    throw new Error("Failed to fetch user tickets");
  }
};

const getTicketByIdService = async (ticketId) => {
  try {
    const sql = "SELECT * FROM tickets WHERE ticket_id = $1";
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
        flow_id,
        ticket_id,
        action,
        from_team,
        to_team,
        action_by,
        remarks,
        created_at
      FROM ticket_flow
      WHERE ticket_id = $1
      ORDER BY created_at ASC
    `;
    const result = await db.query(sql, [ticketId]);
    return result.rows;
  } catch (err) {
    console.error("getTicketFlowService error:", err);
    throw new Error("Failed to fetch ticket flow");
  }
};

const deleteTicketService = async (ticketId) => {
  try {
    // Check if ticket exists and is in Initiated status
    const check = await db.query(
      "SELECT status FROM tickets WHERE ticket_id = $1",
      [ticketId]
    );

    if (!check.rows.length) {
      throw new Error("Ticket not found");
    }

    if (check.rows[0].status !== "Initiated") {
      throw new Error("Only Initiated tickets can be deleted");
    }

    // Delete ticket flow first (foreign key constraint)
    await db.query("DELETE FROM ticket_flow WHERE ticket_id = $1", [ticketId]);

    // Delete ticket
    await db.query("DELETE FROM tickets WHERE ticket_id = $1", [ticketId]);

    return { success: true };
  } catch (err) {
    console.error("deleteTicketService error:", err);
    throw new Error(err.message || "Failed to delete ticket");
  }
};

const updateTicketStatusService = async (ticketId, action, team, remarks, userId) => {
  try {
    // Get current ticket
    const ticketResult = await db.query(
      "SELECT * FROM tickets WHERE ticket_id = $1",
      [ticketId]
    );

    if (!ticketResult.rows.length) {
      throw new Error("Ticket not found");
    }

    const currentTicket = ticketResult.rows[0];

    if (currentTicket.status === "Resolved") {
      throw new Error("Cannot update a resolved ticket");
    }

    let newStatus;
    let newTeam = currentTicket.team;
    let flowAction;

    if (action === "resolve") {
      newStatus = "Resolved";
      flowAction = "RESOLVED";
    } else if (action === "forward") {
      newStatus = "Forwarded";
      newTeam = team;
      flowAction = "FORWARDED";
    } else {
      throw new Error("Invalid action");
    }

    // Update ticket
    const updateSql = `
      UPDATE tickets
      SET status = $1, team = $2, updated_at = NOW()
      WHERE ticket_id = $3
      RETURNING *
    `;

    const updateResult = await db.query(updateSql, [
      newStatus,
      newTeam,
      ticketId,
    ]);

    // Add flow record
    const flowSql = `
      INSERT INTO ticket_flow (
        ticket_id,
        action,
        from_team,
        to_team,
        action_by,
        remarks
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const flowValues = [
      ticketId,
      flowAction,
      currentTicket.team,
      newTeam,
      userId,
      remarks,
    ];

    await db.query(flowSql, flowValues);

    return {
      success: true,
      ticket: updateResult.rows[0],
      message: `Ticket ${action === "resolve" ? "resolved" : "forwarded"} successfully`,
    };
  } catch (err) {
    console.error("updateTicketStatusService error:", err);
    throw new Error(err.message || "Failed to update ticket status");
  }
};

module.exports = {
  getTeams,
  createTicketService,
  getUserTicketService,
  getTicketByIdService,
  getTicketFlowService,
  deleteTicketService,
  updateTicketStatusService,
};