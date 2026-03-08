import apiInstance from "./apiService";

const getTeamTickets = async () => {
  try {
    const response = await apiInstance.get('/tickets/team');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch team tickets:", {
      error: error.message,
      status: error.response?.status
    });
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

const updateTicketStatus = async (id, payload) => {
  try {
    const response = await apiInstance.put(`/tickets/${id}/status`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating ticket status:", error);
    throw error;
  }
};

const resolveTicket = async (ticketId, data) => {
  try {
    const response = await apiInstance.put(`/tickets/${ticketId}/resolve`, data);
    console.log("Ticket resolved successfully");
    return response.data;
  } catch (error) {
    console.error("Failed to resolve ticket:", error.message);
    throw error;
  }
};

const forwardTicket = async (ticketId, data) => {
  try {
    const response = await apiInstance.put(`/tickets/${ticketId}/forward`, data);
    console.log("Ticket forwarded successfully");
    return response.data;
  } catch (error) {
    console.error("Failed to forward ticket:", error.message);
    throw error;
  }
};

export default {
  getTeamTickets,
  getTicketById,
  getTicketFlow,
  updateTicketStatus,
  resolveTicket,
  forwardTicket,
};