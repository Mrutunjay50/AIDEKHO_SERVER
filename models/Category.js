const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    names: [
        {
          type: String,
          required: true,
          unique: true,
        },
      ], 
    sponsoredBy: [
      {
        name: {
          type: String,
          unique: true,
        },
        link: {
          type: String,
        },
        show: {
          type: Boolean,
          default: false,
        },
      },
    ],
});

const metadataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: String },
});

const subscribedSchema = new Schema({
  emails: [
      {
        type:String,
        required: true,
      },
    ], 
});

const Subscribers = mongoose.model("subscribed", subscribedSchema);

const Metadata = mongoose.model('Metadata', metadataSchema);

const Categories = mongoose.model("categories", categorySchema);

module.exports = {Categories, Metadata, Subscribers};