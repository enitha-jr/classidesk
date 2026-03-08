const { GoogleGenerativeAI } = require("@google/generative-ai");

/* =====================================================
   GEMINI SETUP
===================================================== */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const AI_MODEL = process.env.AI_MODEL || "gemini-1.5-flash";

/* =====================================================
   BANKING TEAMS
===================================================== */

const TEAMS = [
  "Digital Banking",
  "Cards & Payments",
  "Loans & EMI",
  "Accounts & KYC",
  "Fraud & Security",
  "General Support"
];

/* =====================================================
   RULE BASED CLASSIFICATION
===================================================== */

const ruleBasedClassification = (title, description) => {

  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("fraud") || text.includes("hack") || text.includes("unauthorized")) {
    return { team: "Fraud & Security" };
  }

  if (text.includes("card") || text.includes("payment") || text.includes("transaction") || text.includes("upi")) {
    return { team: "Cards & Payments" };
  }

  if (text.includes("loan") || text.includes("emi") || text.includes("repayment")) {
    return { team: "Loans & EMI" };
  }

  if (text.includes("kyc") || text.includes("aadhaar") || text.includes("pan")) {
    return { team: "Accounts & KYC" };
  }

  if (text.includes("login") || text.includes("otp") || text.includes("internet banking") || text.includes("app")) {
    return { team: "Digital Banking" };
  }

  return { team: "General Support" };
};

/* =====================================================
   GEMINI CLASSIFIER
===================================================== */

const geminiClassifier = async (title, description) => {

  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured in environment variables");
    throw new Error("GEMINI_API_KEY not configured");
  }

  const prompt = `
You are a banking support ticket classifier.

Your task is to classify the ticket into ONE team.

Teams:
- Digital Banking
- Cards & Payments
- Loans & EMI
- Accounts & KYC
- Fraud & Security
- General Support

Examples:

Title: Debit card payment failed
Description: Money deducted but transaction not completed
Output: {"team":"Cards & Payments"}

Title: Unable to login to internet banking
Description: OTP not received during login
Output: {"team":"Digital Banking"}

Title: EMI amount incorrect
Description: My loan EMI amount increased unexpectedly
Output: {"team":"Loans & EMI"}

Title: Suspicious transaction on my account
Description: I did not make this payment
Output: {"team":"Fraud & Security"}

Now classify this ticket.

Title: ${title}
Description: ${description}

Return ONLY JSON.

{"team":"TEAM_NAME"}
`;

  try {

    console.log("Calling Gemini model:", {
      model: AI_MODEL
    });

    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      generationConfig: { temperature: 0.1 }
    });

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    /* Clean markdown if Gemini returns it */

    const cleaned = text.replace(/```json|```/g, "").trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("Invalid Gemini response format:", {
        rawText: text,
        cleanedText: cleaned
      });
      throw new Error("Invalid Gemini response - no JSON found");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("JSON Parse Error:", {
        jsonString: jsonMatch[0],
        error: parseErr.message
      });
      throw new Error("Failed to parse Gemini response JSON");
    }

    if (!TEAMS.includes(parsed.team)) {
      console.error("Invalid team returned by Gemini:", {
        returnedTeam: parsed.team,
        validTeams: TEAMS
      });
      throw new Error("Invalid team returned by Gemini");
    }

    return parsed;

  } catch (err) {

    console.error("Gemini Classifier Error:", {
      message: err.message,
      stack: err.stack,
      title: title,
      description: description?.substring(0, 100) + "..."
    });

    // Specific error handling
    if (err.message.includes("429")) {
      console.warn("Gemini quota exceeded - Rate limit hit");
    } else if (err.message.includes("API key")) {
      console.error("API Key problem - Check your GEMINI_API_KEY");
    } else if (err.message.includes("fetch") || err.message.includes("network")) {
      console.error("Network error - Check internet connection");
    } else if (err.message.includes("401") || err.message.includes("403")) {
      console.error("Authentication error - Invalid API key");
    }

    throw err;

  }
};

/* =====================================================
   MAIN ANALYZER (with fallback logic)
===================================================== */

const analyzeTicket = async (title, description) => {


  try {


    const result = await geminiClassifier(title, description);

    return { ...result, source: "gemini" };

  } catch (err) {

    console.error("Gemini failed:", {
      error: err.message,
      stack: err.stack,
      ticketTitle: title,
      timestamp: new Date().toISOString()
    });

    console.log("Fallback → Rule Based Classification");

    try {

      const fallback = ruleBasedClassification(title, description);

      return { ...fallback, source: "rule-based" };

    } catch (fallbackErr) {

      console.error("Rule-based classification failed:", {
        error: fallbackErr.message,
        stack: fallbackErr.stack,
        timestamp: new Date().toISOString()
      });

      console.warn("All classifiers failed - Using default team");
      return {
        team: "General Support",
        source: "default"
      };
    }

  }
};

/* =====================================================
   HTTP CONTROLLER (for direct API endpoint)
===================================================== */

const classifyTicket = async (req, res) => {

  try {

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Title required"
      });
    }

    const result = await analyzeTicket(title, description);

    return res.json(result);

  } catch (err) {

    console.error("Classification API error:", err);

    return res.status(500).json({
      error: err.message
    });

  }

};

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  classifyTicket,
  analyzeTicket,
  ruleBasedClassification
};