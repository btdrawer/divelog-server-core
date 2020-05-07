import * as resources from "./constants/resources";
import * as errorCodes from "./constants/errorCodes";
import * as subscriptionKeys from "./constants/subscriptionKeys";

import connect from "./services/connect";

import { signJwt, hashPassword, comparePassword } from "./utils/authUtils";

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
    connect,
    models,
    signJwt,
    hashPassword,
    comparePassword,
};
