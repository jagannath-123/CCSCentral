const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    requestDetails: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    creator: {
      type: String,
      required: true,
      default: "",
    },
    approver: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      default: "/",
    },
  },
  {
    timestamps: true,
  }
);

const Config = mongoose.model("Config", configSchema);

module.exports = Config;
