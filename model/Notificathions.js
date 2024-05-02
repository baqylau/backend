const { Schema, model } = require("mongoose");

const NotificationSchema = new Schema({
    text: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    carNumber: {
        type: Schema.Types.ObjectId,
        ref: "Car"
    },
    type: {
        type: String,
        enum: ["speed", "accelerometer"],
        default: "speed"
    }
});

module.exports = model("Notification", NotificationSchema);
