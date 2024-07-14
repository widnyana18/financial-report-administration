const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const activitySchema = new Schema({
  budgetId: {
    type: Schema.Types.ObjectId,
    ref: "Budget",
    required: true,
  },
  programId: {
    type: Schema.Types.ObjectId,
    ref: "Program",
    required: true,
  },
  activity: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Activity", activitySchema);
