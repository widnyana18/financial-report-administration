const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const institutionSchema = new Schema({
  budgetId: {
    type: Schema.Types.ObjectId,
    ref: "Budget",
    required: true,
  },
  institution: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Institution", institutionSchema);
