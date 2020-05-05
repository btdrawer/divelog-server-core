import * as resources from "./constants/resources";
import * as errorCodes from "./constants/errorCodes";
import * as subscriptionKeys from "./constants/subscriptionKeys";

import * as authUtils from "./authUtils";

import db from "./services/db";
import cache from "./services/cache";
import redisClient from "./services/redisClient";

import UserModel from "./models/UserModel";
import DiveModel from "./models/DiveModel";
import GearModel from "./models/GearModel";
import ClubModel from "./models/ClubModel";
import GroupModel from "./models/GroupModel";

module.exports = {
    resources,
    errorCodes,
    subscriptionKeys,
    db,
    cache,
    redisClient,
    auth: authUtils,
    models: {
        UserModel,
        DiveModel,
        GearModel,
        ClubModel,
        GroupModel,
    },
};
