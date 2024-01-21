const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const toolSchema = new Schema({
    name : {
        type : String,
        required : false
    },
    category : {
        type : String,
        required : false
    },
    tooltype : {
        type : String,
        default : "aitools"
    },
    image : {
        type : String,
        required : false
    },
    imageUrl : {
        type : String,
        required : false
    },
    description : {
        type : String,
        required : false
    },
    savedcount : {
        type : Number,
        default : 0,
    },
    weburl : {
        type : String,
        default : "",
    },
    service: {
        type: String,
        enum: ["Free", "Premium", "Freemium", "Contact for Pricing", "Paid", "Free Trial"],
        required: false,
    },
    servicecost: {
        type: String,
        default : 0,
        required: function () {
          return this.inWhat === "premium";
        },
    },
    tags: [{ date: { type: Date, default: Date.now }, tag: String }],
    featured : [{ date: { type: Date, default: Date.now }, tag: String }]
},{ timestamps: true });


const Tools = mongoose.model("tools", toolSchema);

module.exports = Tools;