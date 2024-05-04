const { default: mongoose, Mongoose } = require("mongoose");


const Car = new mongoose.Schema({
    id: {
        type: String,
        required:true
    },
    fullname: {
        type: String,
        default: ""
    },
    lat: {
        type: String
    },
    lng: {
        type: String
    },
    cooldown: {
        type: Date,
        default: Date.now()
    },
    active: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    lastUpdated: {
        type: Date,
        default: Date.now()
    },
    notificationToken: {
        type: String
    },
    notifications: [
        {type: mongoose.Types.ObjectId, ref:"Notification"}
    ],
    organization: {type: mongoose.Types.ObjectId, ref:"Organization"}
})

module.exports = mongoose.model("Car",Car)