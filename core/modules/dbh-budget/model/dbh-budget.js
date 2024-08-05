const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const budgetSchema = new Schema(
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
    dbh: [
      {
        dbhType: {
          type: String,
        },
        dbhAnggaran: {
          type: Number,
        },
        dbhRealisasi: {
          type: Number,
        },
      },
    ],
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

module.exports = mongoose.model("Budget", budgetSchema, "budgets", true);
