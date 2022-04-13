const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
      required: true,
    },
    review: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
