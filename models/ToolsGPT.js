const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const toolGPTSchema = new Schema({
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
        default : "gpttools"
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
        enum: ["Free", "Premium", "Freemium", "Contact for Pricing", "Paid", "Free Trial",""],
        required: false,
    },
    servicecost: {
        type: Number,
        default : 0,
        required: function () {
          return this.inWhat === "premium";
        },
    },  
},{ timestamps: true });


const ToolsGPT = mongoose.model("gpttools", toolGPTSchema);

module.exports = ToolsGPT;