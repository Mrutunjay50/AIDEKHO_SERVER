const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const toolPluginSchema = new Schema({
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
        default : "plugintools"
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
        enum: ["Free", "Premium", "Freemium", "Contact for Pricing", "Paid", "Free Trial",""],
        required: false,
    },
    servicecost: {
        type: Number,
        default : 0,
        required: function () {
          return this.service === "Premium";
        },
    },  
},{ timestamps: true });


const ToolsPlugins = mongoose.model("plugintools", toolPluginSchema);

module.exports = ToolsPlugins;