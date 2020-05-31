import { Schema, Model, model } from "mongoose";
import { IGroup } from "../types/modelTypes";
import { USER_ALREADY_IN_GROUP, NOT_FOUND } from "../constants/errorCodes";
import { USER, GROUP } from "../constants/resources";

const GroupSchema: Schema = new Schema({
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

GroupSchema.methods.addUser = async function (user_id: string): Promise<void> {
    if (this.participants.includes(user_id)) {
        throw new Error(USER_ALREADY_IN_GROUP);
    }
    this.participants.push(user_id);
    await this.save();
};

GroupSchema.methods.leave = async function (user_id: string): Promise<void> {
    const participantIndex = this.participants.findIndex(
        (participant: string) => participant.toString() === user_id
    );
    if (participantIndex < 0) {
        throw new Error(NOT_FOUND);
    }
    this.participants[participantIndex] = undefined;
    await this.save();
};

const GroupModel: Model<IGroup> = model<IGroup>(GROUP, GroupSchema);

export default GroupModel;
