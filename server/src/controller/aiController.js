const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const AI_MODEL = process.env.AI_MODEL || "gemini-2.5-flash";

/* =====================================================
   STATIC TEAMS (ONLY 6)
===================================================== */
const TEAMS = [
  "Backend",
  "Frontend",
  "Database",
  "DevOps",
  "Testing",
  "General"
];

/* =====================================================
   RULE-BASED CLASSIFICATION (Strong Fallback)
===================================================== */
const ruleBasedClassification = (title, description) => {

  const text = `${title} ${description}`.toLowerCase();

  /* =========================
     DATABASE
  ========================= */
  if (
    text.includes("database") ||
    text.includes("sql") ||
    text.includes("query") ||
    text.includes("connection timeout") ||
    text.includes("constraint") ||
    text.includes("primary key") ||
    text.includes("foreign key")
  ) {
    return { team: "Database", priority: "High" };
  }

  /* =========================
     BACKEND
  ========================= */
  if (
    text.includes("api") ||
    text.includes("server") ||
    text.includes("backend") ||
    text.includes("authentication") ||
    text.includes("token") ||
    text.includes("500") ||
    text.includes("crash")
  ) {
    return { team: "Backend", priority: "High" };
  }

  /* =========================
     FRONTEND
  ========================= */
  if (
    text.includes("ui") ||
    text.includes("button") ||
    text.includes("form") ||
    text.includes("layout") ||
    text.includes("css") ||
    text.includes("frontend") ||
    text.includes("alignment") ||
    text.includes("responsive")
  ) {
    return { team: "Frontend", priority: "Medium" };
  }

  /* =========================
     DEVOPS
  ========================= */
  if (
    text.includes("deploy") ||
    text.includes("deployment") ||
    text.includes("docker") ||
    text.includes("build failed") ||
    text.includes("pipeline") ||
    text.includes("ci") ||
    text.includes("kubernetes") ||
    text.includes("server down")
  ) {
    return { team: "DevOps", priority: "High" };
  }

  /* =========================
     TESTING
  ========================= */
  if (
    text.includes("bug") ||
    text.includes("test case") ||
    text.includes("failing") ||
    text.includes("not working") ||
    text.includes("unexpected") ||
    text.includes("issue in testing") ||
    text.includes("regression")
  ) {
    return { team: "Testing", priority: "Medium" };
  }

  /* =========================
     DEFAULT
  ========================= */
  return { team: "General", priority: "Low" };
};

/* =====================================================
   AI ANALYSIS (Gemini)
===================================================== */
const analyzeTicket = async (title, description) => {

  try {

    const prompt = `
You are a helpdesk ticket classifier.

Return STRICT JSON only.

Title: ${title}
Description: ${description}

Available Teams:
Backend
Frontend
Database
DevOps
Testing
General

Rules:
- Choose the most appropriate team.
- If unclear, choose "General".
- Priority must be Low, Medium, or High.

Return format:
{
  "team": "",
  "priority": "Low | Medium | High"
}
`;

    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      generationConfig: {
        temperature: 0.1,
        topP: 0.7
      }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonText = text.match(/\{[\s\S]*\}/)?.[0];

    if (!jsonText) {
      throw new Error("Invalid AI JSON");
    }

    const parsed = JSON.parse(jsonText);

    // Validate team
    if (!TEAMS.includes(parsed.team)) {
      throw new Error("Invalid team from AI");
    }

    // Validate priority
    if (!["Low", "Medium", "High"].includes(parsed.priority)) {
      parsed.priority = "Medium";
    }

    console.log("Gemini AI classification used");

    return parsed;

  } catch (err) {

    console.log("Gemini failed → Using Rule-Based Classification");

    return ruleBasedClassification(title, description);
  }
};

module.exports = {
  analyzeTicket
};