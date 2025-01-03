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
    isDone: {
      type: Boolean,
      default: false,
    },
    totalDbhOpdAdded: {
      type: Number,
      default: 0,
    },
    totalOpd: {
      type: Number,
      required: true,
    },
    totalInstitutionDbh: {
      pagu: {
        type: Number,
        default: 0,
      },
      pkb: [Number],
      bbnkb: [Number], 
      pbbkb: [Number],
      pap: [Number],
      pajakRokok: [Number],
    },
    totalDbhRecieved: {
      type: Number,
      default: 0,
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
        required: true,
      },
      bbnkb: {
        type: Number,
        required: true,
      },
      pbbkb: {
        type: Number,
        required: true,
      },
      pap: {
        type: Number,
        required: true,
      },
      pajakRokok: {
        type: Number,
        required: true,
      },
    },
  },
  {
    strict: true,
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Reporting", reportingSchema);
