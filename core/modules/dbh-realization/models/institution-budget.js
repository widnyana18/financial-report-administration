const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InstitutionBudgetSchema = new Schema(
  {
    opdId: {
      type: Schema.Types.ObjectId,
      ref: "Opd",
      required: true,
    },
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("InstitutionBudget", InstitutionBudgetSchema);
