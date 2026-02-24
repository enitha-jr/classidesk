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

const getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await ticketServices.getTicketByIdService(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    res.json(ticket);
  } catch (err) {
    console.error("getTicketById error:", err);
    res.status(500).json({ message: "Failed to fetch ticket" });
  }
};

const getTicketFlow = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const flow = await ticketServices.getTicketFlowService(ticketId);
    res.json(flow);
  } catch (err) {
    console.error("getTicketFlow error:", err);
    res.status(500).json({ message: "Failed to fetch ticket flow" });
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

const updateTicketStatus = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { action, team, remarks } = req.body;
    const userId = req.user.user_id;

    // Validate input
    if (!action || !remarks) {
      return res.status(400).json({ 
        message: "Action and remarks are required" 
      });
    }

    if (action === "forward" && !team) {
      return res.status(400).json({ 
        message: "Team is required for forwarding" 
      });
    }

    const result = await ticketServices.updateTicketStatusService(
      ticketId,
      action,
      team,
      remarks,
      userId
    );

    res.json(result);
  } catch (err) {
    console.error("updateTicketStatus error:", err);
    res.status(500).json({ 
      message: err.message || "Failed to update ticket status" 
    });
  }
};

module.exports = {
  listTeams,
  createTicket,
  getUserTickets,
  getTicketById,
  getTicketFlow,
  deleteTicket,
  updateTicketStatus,
};