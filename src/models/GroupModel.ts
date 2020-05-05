import { Schema, model } from "mongoose";
import { IGroup } from "../types/modelTypes";
import { USER_ALREADY_IN_GROUP, NOT_FOUND } from "../constants/errorCodes";
import { USER, GROUP } from "../constants/resources";

const GroupSchema = new Schema({
    name: {
        type: String,
        max: 30,
    },
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: USER,
        },
    ],
    messages: [
        {
            text: {
                type: String,
                required: true,
            },
            sender: {
                type: Schema.Types.ObjectId,
                ref: USER,
            },
        },
    ],
});

GroupSchema.methods.addUser = async function (user_id: string) {
    if (!this.participants.includes(user_id)) {
        this.participants.push(user_id);
        await this.save();
    } else {
        throw new Error(USER_ALREADY_IN_GROUP);
    }
};

GroupSchema.methods.leave = async function (user_id: string) {
    let index;

    for (let i = 0; i < this.participants.length; i++) {
        if (this.participants[i].toString() === user_id) index = i;
    }

    if (!index) {
        throw new Error(NOT_FOUND);
    }

    this.participants[index] = undefined;
    await this.save();
};

const GroupModel = model<IGroup>(GROUP, GroupSchema);

export default GroupModel;
