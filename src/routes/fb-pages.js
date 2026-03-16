const express = require("express");
const router = express.Router();

const authController = require("../hooks/facebook_integration/fb-save-pages");

router.get("/auth/facebook/callback", authController.facebookCallback);

module.exports = router;