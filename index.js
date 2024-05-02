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

app.use((err, req, res, next) => {
  if (!err) return next();
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error"
  });
});

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
}, 10000);

io.on("connection", socket);


server.listen(2000, () => {
    console.log("Everything okay!")
})
