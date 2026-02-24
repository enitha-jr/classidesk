const express = require("express");
const router = express.Router();

const authController = require("../controller/authController");
const ticketController = require("../controller/ticketController");
const adminController = require("../controller/adminController"); 

const { authMiddleware } = require('../middleware/authMiddleware');
upload = require("../middleware/uploadMiddleware");

//---------------login----------------
router.post("/login", authController.login);


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

//---------------admin----------------
router.get("/tickets/team", adminController.getTeamTickets);
router.put("/tickets/:ticketId/resolve", adminController.resolveTicket);
router.put("/tickets/:ticketId/forward", adminController.forwardTicket);

//---------------ticket details----------------
router.get("/tickets/:id", ticketController.getTicketById);
router.get("/tickets/:id/flow", ticketController.getTicketFlow);
router.delete("/tickets/:id", ticketController.deleteTicket);



module.exports = router;