const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const dbhBudgetSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
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
    noRek: {
      type: String,
      required: true,
    },
    parameter: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    pagu: {
      type: Number,
      default: 0,
    },
    dbh: {
      pkb: [Number],
      bbnkb: [Number],
      pbbkb: [Number],
      pap: [Number],
      pajakRokok: [Number],
    },
    description: {
      type: String,
    },
  },
  {
    _id: false,
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("DbhBudget", dbhBudgetSchema);
