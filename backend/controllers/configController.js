const Config = require("../models/configModel");

// Validating the user details
const isCCSTeam = async (req, result) => {
  try {
    const loginID = req.body.login;
    const group = req.body.group;

    var ldap = require("ldapjs");

    var client = ldap.createClient({
      url: "ldap://ldap.amazon.com:389",
    });
    var opts = {
      filter: "cn=" + group,
      scope: "sub",
      attributes: ["memberuid"],
    };

    client.search("ou=groups,o=amazon.com", opts, function (err, res) {
      res.on("searchEntry", function (entry) {
        groupInfo = entry.object;
        result.send(groupInfo.memberuid.indexOf(loginID) > -1);
      });
      res.on("error", function (err) {
        console.log(
          "Something went wrong with the ldap lookup. Details: " + err.message
        );
      });
    });
  } catch (error) {
    result.send(error);
  }
};

// Getting user name of the logginned user
const getUser = async (req, res) => {
  var username = await req.headers["x-forwarded-user"]; // retrieves the username from Sentry
  var shortUserName = "";
  if (!!username) {
    // sentry provided the identity
    shortUserName = await username.replace("@ANT.AMAZON.COM", "");
  } else {
    shortUserName = (await process.env.USER) || process.env.USERNAME; // both for UNIX and Windows
  }

  req.identity = await shortUserName; // stores inside the request object so that any other routes can access it

  var isApprover = false;
  const CCS = JSON.parse(process.env.CCS);
  CCS.forEach((val) => {
    if (shortUserName === val) isApprover = true;
  });

  res.json({
    username: "shortUserName",
    marketplaces: JSON.parse(process.env.MARKETPLACES),
  }); // whenever the response gets sent back uto the client, the response header will store the username as "x-login"
  // any further handling
  return;
};

// Adding new Configuration
const addConfig = async (req, res) => {
  try {
    const result = await Config.create(req.body);
    res.json({ message: "true" });
  } catch (error) {
    res.send(error);
  }
};

// Getting all the configurations
const getConfig = async (req, res) => {
  try {
    const result = await Config.find();
    res.status(200).send(result);
  } catch (error) {
    res.send(error);
  }
};

// finding a configuration with id
const findConfig = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Config.findById(id);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
};

// Updating exsisting configuration

const updateConfig = async (req, res) => {
  try {
    const id = req.params.id;
    const requestId = req.body.requestId;
    const type = req.body.type;
    const requestDetails = req.body.requestDetails;
    const status = req.body.status;
    const creator = req.body.creator;
    const approver = req.body.approver;
    const remarks = req.body.remarks;
    const date = req.body.date;
    const url = req.body.url;

    const result = await Config.findByIdAndUpdate(id, {
      requestId: requestId,
      type: type,
      requestDetails: requestDetails,
      status: status,
      creator: creator,
      approver: approver,
      remarks: remarks,
      date: date,
      url: url,
    });
    res.json({ message: "true", data: result });
  } catch (error) {
    res.send(error);
  }
};

// Deleting Configuration
const deleteConfig = async (req, res) => {
  try {
    const result = await Config.findByIdAndDelete({ _id: req.params.id });
    res.json({ message: "true" });
  } catch (error) {
    res.send(error);
  }
};

module.exports = {
  addConfig,
  getConfig,
  deleteConfig,
  updateConfig,
  findConfig,
  getUser,
  isCCSTeam,
};
