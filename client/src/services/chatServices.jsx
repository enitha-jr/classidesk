import apiInstance from "./apiService";
import { store } from "../store/store";
import {
    addDemoChatMessage,
    clearDemoChatHistory,
    getDemoAIResponse,
    getDemoChatHistory,
    isDemoToken,
} from "./demoData";

const getAIResponse = async (prompt, file) => {
    try {
        const auth = store.getState().auth;
        if (isDemoToken(auth?.token)) {
            const response = getDemoAIResponse(prompt, file);
            addDemoChatMessage(auth?.email, { sender: "user", text: prompt });
            addDemoChatMessage(auth?.email, { sender: "ai", text: response.reply });
            return response;
        }

        if (file) {
            const formData = new FormData();
            formData.append("prompt", prompt);
            formData.append("file", file);

            const response = await apiInstance.post("/chat", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } else {
            const response = await apiInstance.post("/chat", { prompt: prompt });
            return response.data;
        }
    } catch (err) {
        console.error("Error fetching AI response:", err);
        throw err;
    }
};

const getChatHistory = async () => {
    try {
        const auth = store.getState().auth;
        if (isDemoToken(auth?.token)) {
            return getDemoChatHistory(auth?.email);
        }

        const response = await apiInstance.get("/chat/history");
        return response.data;
    } catch (err) {
        console.error("Error fetching chat history:", err);
        throw err;
    }
};

const clearChatHistory = async () => {
    try {
        const auth = store.getState().auth;
        if (isDemoToken(auth?.token)) {
            return clearDemoChatHistory(auth?.email);
        }

        const response = await apiInstance.delete("/chat/history");
        return response.data;
    } catch (err) {
        console.error("Error clearing chat history:", err);
        throw err;
    }
};

export default {
    getAIResponse,
    getChatHistory,
    clearChatHistory,
};
