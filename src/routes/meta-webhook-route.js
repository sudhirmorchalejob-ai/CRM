const express = require("express");
const { metaWebhookController } = require("../controllers/meta-webhook-controller");

const router = express.Router();

router.post("/meta-leads", metaWebhookController);

module.exports = router;