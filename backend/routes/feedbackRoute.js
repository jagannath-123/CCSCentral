const express = require("express");
const {
  addFeedback,
  getFeedback,
} = require("../controllers/feedbackController");

const router = express.Router();

router.route("/").post(addFeedback).get(getFeedback);

module.exports = router;
