const adminService = require("../services/adminService");

const getTeamTickets = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const tickets = await adminService.getTeamTicketsService(adminId);
    res.json(tickets);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || "Failed to fetch team tickets" });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await adminService.getTicketByIdService(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    res.json(ticket);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || "Failed to fetch ticket" });
  }
};

const getTicketFlow = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const flow = await adminService.getTicketFlowService(ticketId);
    res.json(flow);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || "Failed to fetch ticket flow" });
  }
};

const resolveTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { remarks } = req.body;
    const userId = req.user.user_id;

    if (!remarks || remarks.trim() === "") {
      return res.status(400).json({ message: "Remarks are required" });
    }

    const result = await adminService.resolveTicketService(
      ticketId,
      remarks,
      userId
    );

    res.json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || "Failed to resolve ticket" });
  }
};

const forwardTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { to_team_id, remarks } = req.body;
    const userId = req.user.user_id;

    if (!remarks || remarks.trim() === "") {
      return res.status(400).json({ message: "Remarks are required" });
    }

    const result = await adminService.forwardTicketService(
      ticketId,
      to_team_id,
      remarks,
      userId
    );

    res.json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || "Failed to forward ticket" });
  }
};

module.exports = {
  getTeamTickets,
  getTicketById,
  getTicketFlow,
  resolveTicket,
  forwardTicket,
};
