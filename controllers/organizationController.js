require("dotenv").config()
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const Organizations = require("../model/Organizations");
const nodemailer = require("nodemailer")


const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});


const handleSendMail = async (email, text) => {
  await transporter.sendMail({
    from: `"Baqylau" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Уведомление о покупке подписки`,
    html: text,
  });
}

class OrganizationController {
  async getOrganization(req,res,next) {
    try {
      const {orgId} = req.params
      if(!orgId) return next({status:400, message: "Введите все данные"})
      const organization = await Organizations.findById(orgId).populate(
        "cars"
      )
      if(!organization) return next({status:400, message: "Данная организация не найдена"})
      return res.status(200).json({
        success:true,
        organization: organization
      })
    } catch (e) {
      console.log(e)
      next({status:500, message: "Sever error"})
    }
  }

 
async buyStandart(req, res, next) {
  try {
      const {orgId} = req.body
      if(!orgId) return next({status:400, message: "Введите все данные"})
      const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
              price_data: {
                  currency: 'usd',
                  product_data: {
                      name: 'Standard Subscription',
                      description: 'Standard subscription for your service',
                  },
                  unit_amount: 450,
              },
              quantity: 1,
          }],
          mode: 'payment',
          success_url: `https://baqylau-backend.undefined.ink/api/success/standart?orgId=${orgId}`,
          cancel_url: `https://baqylau-backend.undefined.ink/api/cancel?orgId=${orgId}`,
      });

      return res.status(200).json({
          success: true,
          url: session.url
      });
  } catch (e) {
      console.error(e);
      next({ status: 500, message: `Server error: ${e.message}` });
  }
}

  async buyPremium(req,res,next) {
    try {
      const {orgId} = req.body
      if(!orgId) return next({status:400, message: "Введите все данные"})
      const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
              price_data: {
                  currency: 'usd',
                  product_data: {
                      name: 'Premium Subscription',
                      description: 'Premium subscription for your service',
                  },
                  unit_amount: 1125,
              },
              quantity: 1,
          }],
          mode: 'payment',
          success_url: `https://baqylau-backend.undefined.ink/api/success/premium?orgId=${orgId}`,
          cancel_url: `https://baqylau-backend.undefined.ink/api/cancel?orgId=${orgId}`,
      });

      return res.status(200).json({
          success: true,
          url: session.url
      });
  } catch (e) {
      console.error(e);
      next({ status: 500, message: `Server error: ${e.message}` });
  }
  }

  async cancelPayment(req,res,next) {
    try {
      const {orgId} = req.query
      if(!orgId) return next({status:400, message: "Ошибка организации"}) 
      return res.redirect("https://baqylau-frontend.undefined.ink/map/"+orgId)
    } catch (e) {
      console.error(e);
      next({ status: 500, message: `Server error: ${e.message}` });
    }
  }


  async successPremium(req,res,next) {
    try {
      const {orgId} = req.query
      if(!orgId) return next({status:400, message: "Ошибка организации"}) 
      const org = await Organizations.findById(orgId)
      if(!org) return next({status:400, message: "Данная организация не найдена"})
      org.type = "premium"
      await org.save()
      await handleSendMail(org.email, "Спасибо, что приобрели статус Premium для своей организации!")
      return res.redirect("https://baqylau-frontend.undefined.ink/map/"+orgId)
    } catch (e) {
      console.error(e);
      next({ status: 500, message: `Server error: ${e.message}` });
    }
  }

  async successStandart(req,res,next) {
    try {
      const {orgId} = req.query
      console.log(orgId)
      if(!orgId) return next({status:400, message: "Ошибка организации"}) 
      const org = await Organizations.findById(orgId)
      if(!org) return next({status:400, message: "Данная организация не найдена"})
      org.type = "standart"
      await org.save()
      await handleSendMail(org.email, "Спасибо, что приобрели статус Standard для своей организации!")
      return res.redirect("https://baqylau-frontend.undefined.ink/map/"+orgId)
    } catch (e) {
      console.error(e);
      next({ status: 500, message: `Server error: ${e.message}` });
    }
  }
}

module.exports = new OrganizationController()