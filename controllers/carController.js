require("dotenv").config()
const nodemailer = require("nodemailer");
const Cars = require("../model/Cars");
const Notificathions = require("../model/Notificathions");
const OpenAI = require("openai");
const Organizations = require("../model/Organizations");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const handleSendMail = async (email, carId, text) => {
  await transporter.sendMail({
    from: `"Baqylau" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Уведомление: ${carId}`,
    html: text,
  });
}

const handleSendAlert = async (notificationToken, title, body) => {
  const message = {
    to: notificationToken,
    sound: 'default',
    title: title,
    body: body,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

const allInfoData = []


class CarController {
  async getCarsInfo(req, res, next) {
    try {
      const cars = await Cars.find().lean()
      return res.status(200).json({
        success: true,
        cars: cars
      })
    } catch (e) {
      console.log(e)
      next({ status: 500, message: "Sever error" })
    }
  }

  async getSpeedLimites(req, res, next) {
    try {
      const { id, lat, lng, speed, accelerometerData, notificationToken, orgId } = req.body;


      console.log(req.body)


      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID is required"
        });
      }



      if (!allInfoData[id]) {
        allInfoData[id] = {
          speeds: [],
          accelerometerData: [],
          timer: null
        };

        allInfoData[id].timer = setTimeout(async () => {
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                "role": "system",
                "content": 'you are the determinant of "daredevilry". you are given accelerometer data and an array of speeds. determine if there is daredevilry  answer like this { "daredevil": "true/false", "reason": "" } if speed not too much or movement not so big - return false'
              },
              {
                "role": "user",
                "content": JSON.stringify({ speeds: allInfoData[id].speeds, accelerometerData: allInfoData[id].accelerometerData }),
              }
            ],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          });

          const content = JSON.parse(response.choices[0].message.content)
          if (content.daredevil == "true") {
            const car = await Cars.findOne({ id })
            const notification = await Notificathions.create({ text: "Опасные движения", carNumber: car._id, type: "accelerometer" })
            car.notifications.push(notification.id)
            await car.save()
            const organization = await Organizations.findById(car.organization)
            if (organization) {
              await handleSendMail(organization.email, car.id, `Опасные движения<br /><br />Вы совершаете опасные маневры. Будьте осторожны!`)
            }
            await handleSendAlert(car.notificationToken, "Опасные движения", "Вы совершаете опасные маневры. Будьте осторожны!")
          }
          delete allInfoData[id];
        }, 60000);
      }

      allInfoData[id].speeds.push(speed);
      allInfoData[id].accelerometerData.push(...accelerometerData);

      if (!lat || !lng) return res.status(200).json({
        success: false,
        message: "Не указаны нужные данные"
      })


      const optionCar = await Cars.findOne({ id: id })
      if (!optionCar) {
        await Cars.create({ id, lng, lat, notificationToken })
      } else {
        if (!optionCar.notificationToken) {
          optionCar.notificationToken = notificationToken
        }
        if (orgId) {
          const organization = await Organizations.findById(orgId)
          if (!organization.cars.includes(optionCar._id)) {
            organization.cars.push(optionCar._id)
          }
          optionCar.organization = organization._id
          await organization.save()
        }
        optionCar.lat = lat
        optionCar.lng = lng
        optionCar.lastUpdated = Date.now()
        await optionCar.save()
      }

      if (Number(speed) > 2) {
        const car = await Cars.findOne({ id })
        if ((Date.now() / 1000) - (car.cooldown / 1000) >= 10) {
          const notification = await Notificathions.create({ text: "Превышене скорости (2км)", carNumber: car._id, type: "speed" })
          car.notifications.push(notification.id)
          car.cooldown = Date.now()
          await car.save()
          const organization = await Organizations.findById(car.organization)
          if (organization) {
            await handleSendMail(organization.email, car.id, `Превышение скорости (2км)<br /><br /><img src=${`https://static.maps.2gis.com/1.0?s=880x300&pt=52.2833,76.9667~k:p~c:rd~s:s&pt=${car.lat + "," + car.lng}~k:c~c:gn~s:l`} />`)
          }
          await handleSendAlert(car.notificationToken, "Превышение скорости", "Вы превысили допустимую скорость. Будьте внимательны!")
          return res.status(200).json({
            success: true,
            message: "Email has been sent"
          })
        } else {
          return res.status(200).json({
            success: false,
            message: "Cooldown"
          })
        }
      }

      return res.status(200).json({
        success: true,
        message: "Speed okay"
      })
    } catch (e) {
      console.log(e)
      next({ status: 500, message: "Sever error" })
    }
  }


  async getData(req, res, next) {
    const info = Object.keys(allInfoData).map((key) => ({
      speeds: allInfoData[key].speeds,
      accelerometerData: allInfoData[key].accelerometerData
    }));

    return res.status(200).json({
      data: info
    });
  }



  async confirmedCar(req, res, next) {
    try {
      const { id, fullname } = req.body
      if (!id || !fullname) return next({ status: 400, message: "Введите все данные" })
      const optionCar = await Cars.findOneAndUpdate({ id: id }, { active: true, fullname: fullname }, { new: true })
      if (!optionCar) return next({ status: 400, message: "Данная машина не найдена" })
      return res.status(200).json({
        success: true,
        car: optionCar
      })
    } catch (e) {
      console.log(e)
      next({ status: 500, message: "Sever error" })
    }
  }

}

module.exports = new CarController()