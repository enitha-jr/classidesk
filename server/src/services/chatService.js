const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const readFileContent = (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();

    // For text files, read content directly
    if ([".txt", ".csv", ".json"].includes(ext)) {
      return fs.readFileSync(filePath, "utf8");
    }

    // For other files, just note that a file was attached
    const fileName = path.basename(filePath);
    return `[File attached: ${fileName}]`;
  } catch (err) {
    console.warn("Error reading file:", err.message);
    return "[File was attached but could not be read]";
  }
};

const getAIResponseService = async (prompt, filePath, history = []) => {
  try {

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    let fileContext = "";
    if (filePath) {
      const fileContent = readFileContent(filePath);
      fileContext = `\n\nFile attachment content/info:\n${fileContent}`;
    }

    const recentHistory = Array.isArray(history)
      ? history.slice(-10).map((msg) => `${msg.sender === "ai" ? "Assistant" : "User"}: ${msg.text}`).join("\n")
      : "";

    const historyContext = recentHistory
      ? `\n\nConversation history (recent):\n${recentHistory}`
      : "";

    const response = await axios.post(url, {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are Simba — a friendly AI assistant for a banking support system.

Rules:
- ONLY answer banking related questions.
- Topics allowed:
  • bank accounts
  • debit/credit cards
  • loans & EMI
  • payments & transfers
  • ATM issues
  • online banking
  • login problems
  • fraud or suspicious transactions
  • KYC verification
  • account statements or document review

If the question is unrelated (coding, politics, movies, etc), respond with:
"Sorry, I can only help with banking related questions."

Guidelines:
- Speak politely like a bank support agent.
- Use simple explanations.
- Provide step-by-step help if possible.
- Never ask for passwords, OTPs, or confidential information.
- If the issue requires investigation, suggest creating a support ticket.
- If user attached a file like statement or document, review and answer based on its content.

User question:
${prompt}${fileContext}${historyContext}
              `
            }
          ]
        }
      ]
    });

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    return reply;

  } catch (error) {

    console.error(
      "Gemini API Error:",
      error.response?.data || error.message
    );

    throw new Error("AI response failed");

  }
};

module.exports = {
  getAIResponseService
};