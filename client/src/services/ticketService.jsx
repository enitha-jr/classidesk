import apiInstance from "./apiService";

const listTeams = async () => {
  try {
    const response = await apiInstance.get("/teams");
    return response.data;
  } catch (err) {
    console.error("Error fetching teams:", err);
    throw err;
  }
};

const createTicket = async (data) => {
  try {
    const response = await apiInstance.post("/create-ticket", data);
    return response.data;
  } catch (err) {
    console.error("Error creating ticket:", err);
    throw err;
  }
};

const getUserTickets = async () => {
  try {
    const response = await apiInstance.get("/tickets/user");
    return response.data;
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    throw error;
  }
};

const getTicketById = async (id) => {
  try {
    const response = await apiInstance.get(`/tickets/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket:", error);
    throw error;
  }
};

const getTicketFlow = async (ticketId) => {
  try {
    const response = await apiInstance.get(`/tickets/${ticketId}/flow`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket flow:", error);
    throw error;
  }
};

const deleteTicket = async (id) => {
  try {
    const response = await apiInstance.delete(`/tickets/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw error;
  }
};

const updateTicketStatus = async (id, payload) => {
  try {
    const response = await apiInstance.put(`/tickets/${id}/status`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating ticket status:", error);
    throw error;
  }
};

const ticketService = {
  listTeams,
  createTicket,
  getUserTickets,
  getTicketById,
  getTicketFlow,
  deleteTicket,
  updateTicketStatus,
};

export default ticketService;