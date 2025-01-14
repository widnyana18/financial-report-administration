const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const opdSchema = new Schema(
  {
    opdName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    institutionId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Opd", opdSchema);
