import { Document, Schema, Model, model, UpdateQuery } from "mongoose";
import { IResource, DiveDocument, ClubDocument, GearDocument } from ".";
import {
    signJwt,
    hashPassword,
    comparePassword,
    errorCodes,
    resources,
} from "..";
import resourceFactory from "./utils/resourceFactory";
const { USERNAME_EXISTS, EMAIL_EXISTS, INVALID_AUTH } = errorCodes;
const { USER, DIVE, CLUB, GEAR } = resources;

export interface UserDocument extends Document {
    name: string;
    username: string;
    email: string;
    password: string;
    token?: string;
    dives: DiveDocument[];
    clubs: {
        manager: ClubDocument[];
        member: ClubDocument[];
    };
    gear: GearDocument[];
    friends: UserDocument[];
    friendRequests: {
        inbox: UserDocument[];
        sent: UserDocument[];
    };
}

export interface IUserModel extends Model<UserDocument> {
    authenticate(username: string, password: string): Promise<UserDocument>;
    add(myId: string, friendId: string): Promise<UserDocument | null>;
    accept(myId: string, friendId: string): Promise<UserDocument | null>;
    unfriend(myId: string, friendId: string): Promise<UserDocument | null>;
}

export interface CreateUserInput {
    name: string;
    username: string;
    email: string;
    password: string;
}

export interface UpdateUserInput extends UpdateQuery<UserDocument> {
    name?: string;
    username?: string;
    email?: string;
    password?: string;
}

export interface IUser
    extends IResource<UserDocument, CreateUserInput, UpdateUserInput> {
    login(username: string, password: string): Promise<UserDocument | null>;
    updateMany: any;
    add(user: string, friend: string): Promise<UserDocument | null>;
    accept(user: string, friend: string): Promise<UserDocument | null>;
    unfriend(user: string, friend: string): Promise<UserDocument | null>;
}

const UserSchema: Schema = new Schema({
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

UserSchema.pre<UserDocument>("save", async function (next): Promise<void> {
    if (this.isModified("password")) {
        this.password = hashPassword(this.password);
    }
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

UserSchema.pre<UserDocument & { _update: UserDocument }>(
    "findOneAndUpdate",
    async function (next): Promise<void> {
        if (this._update.password) {
            this._update.password = hashPassword(this._update.password);
        }
        if (this._update.username) {
            const user = await UserModel.findOne({
                username: this._update.username,
            });
            if (user) throw new Error(USERNAME_EXISTS);
        }
        next();
    }
);

const UserModel = model<UserDocument, IUserModel>(USER, UserSchema);

const User: IUser = {
    ...resourceFactory(UserModel),

    async login(username: string, password: string) {
        const user = await UserModel.findOne({
            username: username,
        });
        if (!user) {
            throw new Error(INVALID_AUTH);
        }
        if (!comparePassword(password, user.password)) {
            throw new Error(INVALID_AUTH);
        }
        user.token = signJwt(user._id);
        user.save();
        return user;
    },

    updateMany: UserModel.updateMany,

    async add(user: string, friend: string) {
        const updatedUser = await this.update(user, {
            $push: {
                "friendRequests.sent": friend,
            },
        });
        await this.update(friend, {
            $push: {
                "friendRequests.inbox": user,
            },
        });
        return updatedUser;
    },

    async accept(user: string, friend: string) {
        const updatedUser = await this.update(user, {
            $push: {
                //@ts-ignore
                friends: friend,
            },
            $pull: {
                "friendRequests.inbox": friend,
            },
        });
        await this.update(friend, {
            $push: {
                //@ts-ignore
                friends: user,
            },
            $pull: {
                "friendRequests.sent": user,
            },
        });
        return updatedUser;
    },

    async unfriend(user: string, friend: string) {
        const updatedUser = await this.update(user, {
            $pull: {
                friends: friend,
            },
        });
        await this.update(friend, {
            $pull: {
                friends: user,
            },
        });
        return updatedUser;
    },
};

export default User;
