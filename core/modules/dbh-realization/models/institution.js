const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const institutionSchema = new Schema({
  reportingId: {
    type: Schema.Types.ObjectId,
    ref: "Reporting",
    required: true,
  },
  dbhBudget: {
    pkb: { type: Number },
    bbnkb: { type: Number },
    pbbkb: { type: Number },
    pap: { type: Number },
    pajakRokok: { type: Number },
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Institution", institutionSchema);
