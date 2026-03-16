const express = require('express');

const v1Routes = require('./v1');

const router = express.Router();

const metaWebhookRoutes = require("./meta-webhook-route");

router.use("/webhook", metaWebhookRoutes);

router.use('/v1', v1Routes);
module.exports = router;