const express = require('express');
const router = express.Router();


// ----------------- DECLARE ROUTES -----------------//
const userRouter = require("./user-route")
// ----------------- DECLARE ROUTES -----------------//



// ----------------- ROUTES -----------------//
router.use("/user" , userRouter)
// ----------------- ROUTES -----------------//





module.exports = router;