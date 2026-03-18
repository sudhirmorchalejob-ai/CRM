const express = require("express");
const router = express.Router();

const messengerController = require("../controllers/messenger-webhook-controller");

// ✅ IMPORTANT PATH
router.get("/messenger/webhook", messengerController.verifyWebhook);
router.post("/messenger/webhook", messengerController.receiveMessages);

module.exports = router;