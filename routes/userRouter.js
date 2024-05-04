const express= require("express")
const userController = require("../controllers/userController")
const authMiddleware = require("../middlewares/authMiddleware")

const userRouter = express.Router()

userRouter.get("/user", authMiddleware, userController.getUserInfo)
userRouter.post("/register", userController.registerUser)
userRouter.post("/auth", userController.authUser)

userRouter.post("/organization",authMiddleware, userController.createOrganizations)

module.exports = userRouter