var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: { type: String, required: true, max: 100 },
  description: { type: String }
});

// Virtual for category's URL
CategorySchema.virtual("url").get(function() {
  return "/inventory/category/" + this._id;
});

//Export model
module.exports = mongoose.model("Category", CategorySchema);
