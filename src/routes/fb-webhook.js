const express = require("express");
const router = express.Router();

const webhookController = require("../hooks/facebook_integration/fb-webhook");

router.get("/webhook", webhookController.verifyWebhook);

router.post("/webhook", webhookController.receiveLead);

module.exports = router;