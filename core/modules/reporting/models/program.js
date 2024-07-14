const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const programSchema = new Schema({
  budgetId: {
    type: Schema.Types.ObjectId,
    ref: "Budget",
    required: true,
  },
  institutionId: {
    type: Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  },
  program: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Program", programSchema);
