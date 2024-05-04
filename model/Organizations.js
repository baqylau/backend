const { default: mongoose, Mongoose } = require("mongoose");


const Organization = new mongoose.Schema({
    title: {type: String},
    email: {type: String},
    owner: {type: mongoose.Types.ObjectId, ref:"User"},
    cars: [{type: mongoose.Types.ObjectId, ref:"Car", default: []}],
    type: {
        type: String,
        enum: ["free", "standart", "premium"],
        default: "free"
    }
})

module.exports = mongoose.model("Organization",Organization)