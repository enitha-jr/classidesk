import apiInstance from "./apiService";
import { store } from "../store/store";
import {
    forwardDemoTicket,
    getDemoTeamTickets,
    getDemoTicketById,
    getDemoTicketFlow,
    isDemoToken,
    resolveDemoTicket,
} from "./demoData";

const getTeamTickets = async () => {
  try {
    const auth = store.getState().auth;
    if (isDemoToken(auth?.token)) {
      return getDemoTeamTickets();
    }

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
    const auth = store.getState().auth;
    if (isDemoToken(auth?.token)) {
      return getDemoTicketById(id);
    }

    const response = await apiInstance.get(`/tickets/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket:", error);
    throw error;
  }
};

const getTicketFlow = async (ticketId) => {
  try {
    const auth = store.getState().auth;
    if (isDemoToken(auth?.token)) {
      return getDemoTicketFlow(ticketId);
    }

    const response = await apiInstance.get(`/tickets/${ticketId}/flow`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket flow:", error);
    throw error;
  }
};

const updateTicketStatus = async (id, payload) => {
  try {
    const auth = store.getState().auth;
    if (isDemoToken(auth?.token)) {
      return payload?.status === "Resolved"
        ? resolveDemoTicket(id, payload)
        : forwardDemoTicket(id, payload);
    }

    const response = await apiInstance.put(`/tickets/${id}/status`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating ticket status:", error);
    throw error;
  }
};

const resolveTicket = async (ticketId, data) => {
  try {
    const auth = store.getState().auth;
    if (isDemoToken(auth?.token)) {
      return resolveDemoTicket(ticketId, data);
    }

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
    const auth = store.getState().auth;
    if (isDemoToken(auth?.token)) {
      return forwardDemoTicket(ticketId, data);
    }

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