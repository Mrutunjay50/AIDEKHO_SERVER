const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: false},
    profilePicture: {type: String, required: false},
    admin : {type:Boolean, required:false, default : false}
},{ timestamps: true });

module.exports = mongoose.model("User", userSchema)