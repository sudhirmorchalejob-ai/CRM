const express = require("express");
const router = express.Router();

const { whatsappWebhook } = require("../controllers/whatsapp-controller");

router.post("/webhook/whatsapp", whatsappWebhook);

module.exports = router;