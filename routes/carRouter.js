const express= require("express")
const carController = require("../controllers/carController")

const carRouter = express.Router()

carRouter.post("/speedLimits", carController.getSpeedLimites)
carRouter.post("/confirmed", carController.confirmedCar)
carRouter.get("/cars", carController.getCarsInfo)
carRouter.get("/data", carController.getData)


module.exports = carRouter