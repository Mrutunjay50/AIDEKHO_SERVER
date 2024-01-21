const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  aiTool: [{
    type: Schema.Types.ObjectId,
    ref: 'tools', // Reference the 'Tool' model for the 'tools' array
  }],
  gptTool: [{
    type: Schema.Types.ObjectId,
    ref: 'gpttools', // Reference the 'Toolsgpt' model for another array, if needed
  }],
  pluginTool: [{
    type: Schema.Types.ObjectId,
    ref: 'plugintools', // Reference the 'Toolsplugin' model for another array, if needed
  }],
}, { timestamps: true });


const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;