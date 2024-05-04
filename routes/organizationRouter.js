const express= require("express")
const organizationController = require("../controllers/organizationController")

const organizationRouter = express.Router()


organizationRouter.get("/organization/:orgId", organizationController.getOrganization)
organizationRouter.post("/buy/standart", organizationController.buyStandart)
organizationRouter.post("/buy/premium", organizationController.buyPremium)

organizationRouter.get("/success/premium", organizationController.successPremium)
organizationRouter.get("/success/standart", organizationController.successStandart)
organizationRouter.get("/cancel", organizationController.cancelPayment)

module.exports = organizationRouter