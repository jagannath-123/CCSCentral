const express = require("express");
const {
  getConfig,
  addConfig,
  updateConfig,
  deleteConfig,
  findConfig,
  getUser,
  isCCSTeam,
} = require("../controllers/configController");

const router = express.Router();




// getting user name
router.route("/getusr").get(getUser);

// Checking the team member
router.route("/isresolver").post(isCCSTeam);

// adding new row
router.route("/").post(addConfig).get(getConfig);

// updating existing row
router.route("/:id").put(updateConfig).delete(deleteConfig).get(findConfig);



module.exports = router;
