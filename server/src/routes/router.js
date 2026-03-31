const express = require("express");
const router = express.Router();

const authController = require("../controller/authController");
const ticketController = require("../controller/ticketController");
const adminController = require("../controller/adminController");
const chatController = require("../controller/chatController");
const aiController = require("../services/aiService"); 

const { authMiddleware } = require('../middleware/authMiddleware');
const { chatRateLimiter } = require("../middleware/chatRateLimiter");
const upload = require("../middleware/uploadMiddleware");

//---------------login----------------
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/ai/classify", aiController.classifyTicket);

router.use(authMiddleware);

//---------------ticket----------------
router.get("/teams",ticketController.listTeams);

router.post(
  "/create-ticket",
  upload.single("attachment"),   
  ticketController.createTicket
);

router.get(
  "/tickets/user",
  ticketController.getUserTickets
)
router.get("/tickets/:id/attachment", ticketController.getAttachment);
router.delete("/tickets/:id", ticketController.deleteTicket);

//---------------admin----------------
router.get("/tickets/team", adminController.getTeamTickets);
router.get("/tickets/:id", adminController.getTicketById);
router.get("/tickets/:id/flow", adminController.getTicketFlow);
router.put("/tickets/:ticketId/resolve", adminController.resolveTicket);
router.put("/tickets/:ticketId/forward", adminController.forwardTicket);

//---------------gemini----------------
router.post("/chat", chatRateLimiter, upload.single("file"), chatController.getAIResponse);
router.get("/chat/history", chatController.getChatHistoryByUser);
router.delete("/chat/history", chatController.clearHistory);


module.exports = router;