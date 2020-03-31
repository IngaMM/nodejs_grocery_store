const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, max: 100 },
  description: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, required: true },
  numberInStock: { type: Number, required: true },
  image: { type: String }
});

// Virtual for item's URL
ItemSchema.virtual("url").get(function() {
  return "/inventory/item/" + this._id;
});

//Export model
module.exports = mongoose.model("Item", ItemSchema);
