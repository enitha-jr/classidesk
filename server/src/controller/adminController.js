const db = require("../utils/connectdb");

const getTeamTickets = async (req, res) => {
  try {
    const adminId = req.user.user_id;

    const teamResult = await db.query(
      `SELECT t.team_name
       FROM admins a
       JOIN teams t ON a.team_id = t.team_id
       WHERE a.user_id = $1`,
      [adminId]
    );

    if (!teamResult.rows.length) {
      return res.status(403).json({ message: "No team assigned" });
    }

    const teamName = teamResult.rows[0].team_name;

    const result = await db.query(
      `SELECT t.*, u.username, u.email
       FROM tickets t
       JOIN users u ON t.user_id = u.user_id
       WHERE t.team = $1
       ORDER BY t.created_at DESC`,
      [teamName]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch team tickets" });
  }
};

const forwardTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { from_team, to_team, action_by, remarks } = req.body;

  await db.query(
    `UPDATE tickets SET team=$1, status='forwarded', updated_at=NOW()
     WHERE ticket_id=$2`,
    [to_team, ticketId]
  );

  await db.query(
    `INSERT INTO ticket_flow
     (ticket_id, action, from_team, to_team, action_by, remarks)
     VALUES ($1,'FORWARDED',$2,$3,$4,$5)`,
    [ticketId, from_team, to_team, action_by, remarks || ""]
  );

  res.json({ message: "Ticket forwarded" });
};

const resolveTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { action_by } = req.body;

  await db.query(
    `UPDATE tickets SET status='resolved', updated_at=NOW()
     WHERE ticket_id=$1`,
    [ticketId]
  );

  await db.query(
    `INSERT INTO ticket_flow
     (ticket_id, action, action_by)
     VALUES ($1,'RESOLVED',$2)`,
    [ticketId, action_by]
  );

  res.json({ message: "Ticket resolved" });
};

module.exports = {
  getTeamTickets,
  forwardTicket,
  resolveTicket,
};
