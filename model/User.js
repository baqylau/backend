const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: ["admin"],
        default: 'admin'
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
