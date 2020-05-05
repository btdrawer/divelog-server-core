import { Schema, Query, model } from "mongoose";
import bcrypt from "bcrypt";
import {
    USERNAME_EXISTS,
    EMAIL_EXISTS,
    INVALID_AUTH,
} from "../constants/errorCodes";
import { USER, DIVE, CLUB, GEAR } from "../constants/resources";
import { signJwt } from "../authUtils";
import { IUser } from "../types/modelTypes";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        max: 40,
    },
    username: {
        type: String,
        required: true,
        max: 15,
    },
    email: {
        type: String,
        required: true,
        max: 30,
    },
    password: {
        type: String,
        required: true,
    },
    token: String,
    dives: [
        {
            type: Schema.Types.ObjectId,
            ref: DIVE,
        },
    ],
    clubs: {
        manager: [
            {
                type: Schema.Types.ObjectId,
                ref: CLUB,
            },
        ],
        member: [
            {
                type: Schema.Types.ObjectId,
                ref: CLUB,
            },
        ],
    },
    gear: [
        {
            type: Schema.Types.ObjectId,
            ref: GEAR,
        },
    ],
    friends: [
        {
            type: Schema.Types.ObjectId,
            ref: USER,
        },
    ],
    friendRequests: {
        inbox: [
            {
                type: Schema.Types.ObjectId,
                ref: USER,
            },
        ],
        sent: [
            {
                type: Schema.Types.ObjectId,
                ref: USER,
            },
        ],
    },
});

UserSchema.pre<IUser>("save", async function (next) {
    if (this.isModified("password"))
        this.password = bcrypt.hashSync(this.password, 10);

    if (this.isModified("username")) {
        const user = await UserModel.findOne({
            username: this.username,
        });

        if (user) throw new Error(USERNAME_EXISTS);
    }

    if (this.isModified("email")) {
        const user = await UserModel.findOne({
            email: this.email,
        });

        if (user) throw new Error(EMAIL_EXISTS);
    }

    this.token = signJwt(this._id);

    next();
});

UserSchema.pre<IUser & { _update: IUser }>("findOneAndUpdate", async function (
    next
) {
    if (this._update.password) {
        this._update.password = bcrypt.hashSync(this._update.password, 10);
    }

    if (this._update.username) {
        const user = await UserModel.findOne({
            username: this._update.username,
        });

        if (user) throw new Error(USERNAME_EXISTS);
    }

    next();
});

UserSchema.statics.authenticate = async (
    username: string,
    password: string
) => {
    const user = await UserModel.findOne({
        username: username,
    });

    const errorMessage = INVALID_AUTH;

    if (!user) throw new Error(errorMessage);
    else if (!bcrypt.compareSync(password, user.password))
        throw new Error(errorMessage);

    user.token = signJwt(user._id);
    user.save();

    return user;
};

UserSchema.statics.add = async (myId: string, friendId: string) => {
    const user = await UserModel.findOneAndUpdate(
        {
            _id: myId,
        },
        {
            $push: {
                "friendRequests.sent": friendId,
            },
        },
        { new: true }
    );

    await UserModel.findOneAndUpdate(
        {
            _id: friendId,
        },
        {
            $push: {
                "friendRequests.inbox": myId,
            },
        }
    );

    return user;
};

UserSchema.statics.accept = async (myId: string, friendId: string) => {
    const user = await UserModel.findOneAndUpdate(
        {
            _id: myId,
        },
        {
            $push: {
                friends: friendId,
            },
            $pull: {
                "friendRequests.inbox": friendId,
            },
        },
        { new: true }
    );

    await UserModel.findOneAndUpdate(
        {
            _id: friendId,
        },
        {
            $push: {
                friends: myId,
            },
            $pull: {
                "friendRequests.sent": myId,
            },
        }
    );

    return user;
};

UserSchema.statics.unfriend = async (myId: string, friendId: string) => {
    const user = await UserModel.findOneAndUpdate(
        {
            _id: myId,
        },
        {
            $pull: {
                friends: friendId,
            },
        },
        { new: true }
    );

    await UserModel.findOneAndUpdate(
        {
            _id: friendId,
        },
        {
            $pull: {
                friends: myId,
            },
        }
    );

    return user;
};

const UserModel = model<IUser>(USER, UserSchema);

export default UserModel;
