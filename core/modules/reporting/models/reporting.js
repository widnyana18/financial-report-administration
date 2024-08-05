const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reportingSchema = new Schema(
  {        
    title: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "menunggu",
    },
    totalDbhBudget: {
      type: Number,
      default: 0,
    },
    totalDbhRealization: {
      type: Number,
      default: 0,
    },
    dbhRecieved: {
      pkb: {
        type: Number,
      },
      bbnkb: {
        type: Number,
      },
      pbbkb: {
        type: Number,
      },
      pap: {
        type: Number,
      },
      pajakRokok: {
        type: Number,
      },
    },
    fileExcelUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Reporting", reportingSchema);
