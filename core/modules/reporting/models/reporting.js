const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reportingSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
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
    fileExcelUrl: {
      type: String      
    },    
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Reporting", reportingSchema);
