const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const subActivitySchema = new Schema({
  budgetId: {
    type: Schema.Types.ObjectId,
    ref: "Budget",
    required: true,
  },
  activityId: {
    type: Schema.Types.ObjectId,
    ref: "Activity",
    required: true,
  },
  subActivity: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("SubActivity", subActivitySchema);
