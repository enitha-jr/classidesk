const ticketServices = require("../services/ticketServices");

const listTeams = async (req, res) => {
  try {
    const teams = await ticketServices.getTeams();
    res.json(teams);
  } catch (err) {
    console.error("listTeams error:", err);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};

const createTicket = async (req, res) => {
  try {
    const ticket = await ticketServices.createTicketService(req);
    res.status(201).json(ticket);
  } catch (err) {
    console.error("createTicket error:", err);
    res.status(500).json({ message: "Failed to create ticket" });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const tickets = await ticketServices.getUserTicketService(req);
    res.json(tickets);
  } catch (err) {
    console.error("getUserTickets error:", err);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    await ticketServices.deleteTicketService(ticketId);
    res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    console.error("deleteTicket error:", err);
    res.status(500).json({ 
      message: err.message || "Failed to delete ticket" 
    });
  }
};

const getAttachment = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.user_id;

    const fileData = await ticketServices.getAttachmentService(ticketId, userId);

    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
    res.setHeader('Content-Length', fileData.buffer.length);
    res.send(fileData.buffer);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || "Failed to fetch attachment" });
  }
};

module.exports = {
  listTeams,
  createTicket,
  getUserTickets,
  getAttachment,
  deleteTicket,
};