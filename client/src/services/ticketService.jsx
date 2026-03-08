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





const deleteTicket = async (id) => {
  try {
    const response = await apiInstance.delete(`/tickets/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw error;
  }
};



const getAttachment = async (ticketId) => {
  try {
    const response = await apiInstance.get(`/tickets/${ticketId}/attachment`, {
      responseType: 'arraybuffer'
    });
    return {
      data: response.data,
      mimeType: response.headers['content-type'] || 'application/octet-stream',
      filename: response.headers['content-disposition']?.split('filename="')[1]?.split('"')[0] || 'attachment'
    };
  } catch (error) {
    console.error("Error fetching attachment:", error);
    throw error;
  }
};

const ticketService = {
  listTeams,
  createTicket,
  getUserTickets,
  deleteTicket,
  getAttachment,
};

export default ticketService;