const express = require("express")

const {userController} = require("../../controllers/index")
const router = express.Router()

router.post("/" , userController.createUserController)


module.exports = router