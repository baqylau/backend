require("dotenv").config()
const express = require("express");
const mongoose = require("mongoose");
const {createServer} = require("node:http")
const { Server } = require("socket.io");
const cors = require("cors")
const Cars = require("./model/Cars");
const carRouter = require("./routes/carRouter");
const userRouter = require("./routes/userRouter");
const socket = require("./socket");
const organizationRouter = require("./routes/organizationRouter");
const { Bot } = require("grammy");

const bot = new Bot("6761973326:AAE6jR71V6j47M38sT8wIuQNGYco4Qm1xj4")

bot.command("start", (ctx) => ctx.reply("Админ панель севриса Baqylau",{
  reply_markup: {
    inline_keyboard: [
      [{text:"Открыть панель", web_app: {url:"https://baqylau-frontend.undefined.ink/"}}]
    ]
  }
}))

mongoose.connect(process.env.DATA_BASE).then(() => console.log("MongoDB connected")).catch((e) => {
  console.log(e)
})

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
      origin: "*", 
  }
});


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
  origin:"*"
}))
app.use("/api", carRouter)
app.use("/api", userRouter)
app.use("/api", organizationRouter)

app.use((err, req, res, next) => {
  if (!err) return next();
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error"
  });
});
/*
setInterval(async () => {
  const cars = await Cars.find().populate({path:"notifications", populate:"carNumber"}).lean()
  let allNotifications = [];

  cars.forEach(car => {
    allNotifications = allNotifications.concat(car.notifications);
  });

  allNotifications.sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  if(cars) {
    io.emit("GET_NOTIFICATIONS", allNotifications);
    return io.emit("GET_CARS", cars)
  }
}, 2000);
*/
io.on("connection", socket);


server.listen(2000, () => {
    bot.start()
    console.log("Everything okay!")
})
