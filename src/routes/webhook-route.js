const express = require("express");
const router = express.Router();

const { verifyWebhook, receiveLead } = require("../hooks/facebook_integration/fb-webhook");

router.get("/meta-leads", verifyWebhook);
router.post("/meta-leads", receiveLead);

module.exports = router;