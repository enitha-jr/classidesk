const chatService = require("../services/chatService");
const path = require("path");
const {
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
} = require("../services/chatCacheService");

const getRemainingTokenTtlSeconds = (exp) => {
  const current = Math.floor(Date.now() / 1000);
  return Math.max(0, Number(exp || 0) - current);
};

const getChatHistoryByUser = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const messages = await getChatHistory(userId);
    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load chat history" });
  }
};

const getAIResponse = async (req, res) => {
  try {

    const { prompt } = req.body;
    const filePath = req.file?.path;
    const userId = req.user?.user_id;
    const ttlSeconds = getRemainingTokenTtlSeconds(req.user?.exp);

    const existingMessages = await getChatHistory(userId);

    const fileText = filePath ? ` [📎 ${path.basename(filePath)}]` : "";
    const updatedHistory = [
      ...existingMessages,
      { sender: "user", text: `${prompt}${fileText}` },
    ];

    const reply = await chatService.getAIResponseService(prompt, filePath, updatedHistory);

    updatedHistory.push({ sender: "ai", text: reply });
    await saveChatHistory(userId, updatedHistory, ttlSeconds);

    res.json({ reply });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};

const clearHistory = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    await clearChatHistory(userId);
    return res.json({ message: "Chat history cleared" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to clear chat history" });
  }
};

module.exports = {
  getAIResponse,
  getChatHistoryByUser,
  clearHistory,
};