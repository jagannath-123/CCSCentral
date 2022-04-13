const Feedback = require("../models/feedbackModel");

const addFeedback = async (req, res) => {
  try {
    const result = await Feedback.create(req.body);
    res.json({ message: "true" });
  } catch (error) {
    res.json({ message: error });
  }
};

const getFeedback = async (req, res) => {
  try {
    const result = await Feedback.find();
    res.send(result);
  } catch (error) {
    res.json({ message: error });
  }
};

module.exports = {
  addFeedback,
  getFeedback,
};
