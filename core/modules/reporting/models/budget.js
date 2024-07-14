const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const budgetSchema = new Schema(
  {
    id: {
      type: String,
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
    paguInduk: {
      type: Number,
      default: 0,
    },
    paguPerubahan: {
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
