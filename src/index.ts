import * as resources from "./constants/resources";
import * as errorCodes from "./constants/errorCodes";
import * as subscriptionKeys from "./constants/subscriptionKeys";

import db from "./services/db";
import cache from "./services/cache";
import redisClient from "./services/redisClient";

import { signJwt, hashPassword } from "./utils/authUtils";

import UserModel from "./models/UserModel";
import DiveModel from "./models/DiveModel";
import GearModel from "./models/GearModel";
import ClubModel from "./models/ClubModel";
import GroupModel from "./models/GroupModel";

const models = {
    UserModel,
    DiveModel,
    GearModel,
    ClubModel,
    GroupModel,
};

export {
    resources,
    errorCodes,
    subscriptionKeys,
    db,
    cache,
    redisClient,
    models,
    signJwt,
    hashPassword,
};
