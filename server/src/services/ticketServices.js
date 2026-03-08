const db = require("../utils/connectdb");
const fs = require("fs");
const path = require("path");
const { analyzeTicket, ruleBasedClassification } = require("./aiService");

const getTeams = async () => {
  try {
    const result = await db.query(
      "SELECT team_id, team_name FROM teams ORDER BY team_name"
    );
    return result.rows;
  } catch (err) {
    console.error("getTeams error:", err);
  }
};

const getTeamIdByName = async (teamName) => {
  try {
    const result = await db.query(
      "SELECT team_id FROM teams WHERE team_name = $1",
      [teamName]
    );
    return result.rows[0]?.team_id || null;
  } catch (err) {
    console.error("getTeamIdByName error:", err);
    return null;
  }
};

const createTicketService = async (req) => {

  const client = await db.connect();

  try {

    /* =====================================================
       STEP 1 → Extract Data
    ===================================================== */

    const userId = req.user?.user_id;

    const {
      ticket_title,
      ticket_desc,
      team_id
    } = req.body;

    const filePath = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    let predictedTeam = null;
    let aiTeamId = null;
    let finalTeamId = team_id;

    /* =====================================================
       STEP 2 → AI Classification (ONLY IF TEAM NOT SELECTED)
    ===================================================== */

    if (!team_id) {

      predictedTeam = "General Support";

      try {

        const aiResult = await analyzeTicket(
          ticket_title,
          ticket_desc
        );

        predictedTeam = aiResult?.team || "General Support";

        console.log("AI Predicted Team:", predictedTeam);

      } catch (err) {

        console.warn("Gemini failed → using rule classifier");

        const fallback = ruleBasedClassification(
          ticket_title,
          ticket_desc
        );

        predictedTeam = fallback?.team || "General Support";

        console.log("Rule predicted team:", predictedTeam);
      }

      aiTeamId = await getTeamIdByName(predictedTeam);

      finalTeamId = aiTeamId;

      if (!finalTeamId) {
        finalTeamId = await getTeamIdByName("General Support");
      }

    } else {

      finalTeamId = team_id;
      aiTeamId = null;

    }

    /* =====================================================
       STEP 3 → START TRANSACTION
    ===================================================== */

    await client.query("BEGIN");

    const insertTicketQuery = `
      INSERT INTO tickets (
        ticket_title,
        ticket_desc,
        team_id,
        ai_team_id,
        status,
        user_id,
        attachment
      )
      VALUES ($1,$2,$3,$4,'Initiated',$5,$6)
      RETURNING *
    `;

    const ticketValues = [
      ticket_title,
      ticket_desc,
      finalTeamId,
      aiTeamId,
      userId,
      filePath
    ];

    const ticketResult = await client.query(
      insertTicketQuery,
      ticketValues
    );

    const createdTicket = ticketResult.rows[0];

    /* =====================================================
       STEP 4 → Ticket Flow Log
    ===================================================== */

    await client.query(
      `
      INSERT INTO ticket_flow (
        ticket_id,
        action,
        from_team_id,
        to_team_id,
        user_id,
        remarks
      )
      VALUES ($1,'CREATED',NULL,$2,$3,'Ticket created')
      `,
      [
        createdTicket.ticket_id,
        finalTeamId,
        userId
      ]
    );

    /* =====================================================
       STEP 5 → COMMIT
    ===================================================== */

    await client.query("COMMIT");

    console.log("Ticket created successfully:", {
      ticketId: createdTicket.ticket_id,
      assignedTeam: finalTeamId,
      aiTeam: aiTeamId
    });

    return createdTicket;

  } catch (err) {

    console.error("createTicketService Error:", err);

    await client.query("ROLLBACK");

    throw err;

  } finally {

    client.release();

  }

};

const getUserTicketService = async (req) => {
  try {
    const userId = req.user.user_id;
    const result = await db.query(
      `SELECT t.*, tm.team_name, tam.team_name as ai_team_name
       FROM tickets t
       LEFT JOIN teams tm ON t.team_id = tm.team_id
       LEFT JOIN teams tam ON t.ai_team_id = tam.team_id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (err) {
    console.error("getUserTicketService error:", err);
    throw new Error("Failed to fetch user tickets");
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

const getAttachmentService = async (ticketId, userId) => {

  const result = await db.query(
    "SELECT attachment, user_id FROM tickets WHERE ticket_id = $1",
    [ticketId]
  );

  if (!result.rows.length) {
    const err = new Error("Ticket not found");
    err.statusCode = 404;
    throw err;
  }

  const ticket = result.rows[0];

  // check if requester is admin
  const adminCheck = await db.query(
    "SELECT user_id FROM admins WHERE user_id = $1",
    [userId]
  );

  const isAdmin = adminCheck.rows.length > 0;

  if (ticket.user_id !== userId && !isAdmin) {
    const err = new Error("Unauthorized");
    err.statusCode = 403;
    throw err;
  }

  const filePath = path.join(__dirname, "../../public", ticket.attachment);
  const buffer = fs.readFileSync(filePath);

  return {
    buffer,
    filename: path.basename(filePath),
    mimeType: getMimeType(filePath)
  };
};

const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();

  const mimeTypes = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".txt": "text/plain",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".zip": "application/zip",
  };

  return mimeTypes[ext] || "application/octet-stream";
};

module.exports = {
  getTeams,
  getTeamIdByName,
  createTicketService,
  getUserTicketService,
  deleteTicketService,
  getAttachmentService,
};