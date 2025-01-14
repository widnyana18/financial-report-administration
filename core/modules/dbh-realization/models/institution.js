const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const institutionSchema = new Schema(
  {
    reportingId: {
      type: Schema.Types.ObjectId,
      ref: "Reporting",
      required: true,
    },
    institutionName: {
      type: String,
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Institution", institutionSchema);
