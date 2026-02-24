import apiInstance from "./apiService";

const getTeamTickets = async (adminId) => {
  try {
    const response = await apiInstance.get('/tickets/team');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const resolveTicket = async (ticketId, data) => {
  try {
    const response = await apiInstance.put(`/tickets/${ticketId}/resolve`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const forwardTicket = async (ticketId, data) => {
  try {
    const response = await apiInstance.put(`/tickets/${ticketId}/forward`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getTeamTickets,
  resolveTicket,
  forwardTicket,
};