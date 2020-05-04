const resources = require("./constants/resources");
const errorCodes = require("./constants/errorCodes");

const UserModel = require("./models/UserModel");
const DiveModel = require("./models/DiveModel");
const GearModel = require("./models/GearModel");
const ClubModel = require("./models/ClubModel");
const GroupModel = require("./models/GroupModel");

module.exports = {
    resources,
    errorCodes,
    models: {
        UserModel,
        DiveModel,
        GearModel,
        ClubModel,
        GroupModel,
    },
};
