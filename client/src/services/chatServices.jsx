import apiInstance from "./apiService";

const getAIResponse = async (prompt, file) => {
    try {
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
        const response = await apiInstance.get("/chat/history");
        return response.data;
    } catch (err) {
        console.error("Error fetching chat history:", err);
        throw err;
    }
};

const clearChatHistory = async () => {
    try {
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
