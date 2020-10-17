import { Document, Schema, model, UpdateQuery } from "mongoose";
import { IResource, UserDocument } from ".";
import { resources, errorCodes } from "..";
import resourceFactory from "./utils/resourceFactory";
const { USER, GROUP } = resources;
const { USER_ALREADY_IN_GROUP, NOT_FOUND } = errorCodes;

export interface MessageDocument extends Document {
    text: string;
    sender: UserDocument;
}

export interface GroupDocument extends Document {
    name: string;
    participants: UserDocument[];
    messages: MessageDocument[];
}

export interface CreateGroupInput {
    name: GroupDocument["name"];
    participants: GroupDocument["participants"];
    messages: GroupDocument["messages"];
}

export interface UpdateGroupInput extends UpdateQuery<GroupDocument> {
    name?: GroupDocument["name"];
    participants?: GroupDocument["participants"];
    messages?: GroupDocument["messages"];
}

export interface IGroup
    extends IResource<GroupDocument, CreateGroupInput, UpdateGroupInput> {
    addUser(group: string, user: string): Promise<GroupDocument | null>;
    removeUser(group: string, user: string): Promise<GroupDocument | null>;
    sendMessage(
        group: string,
        message: MessageDocument
    ): Promise<GroupDocument | null>;
}

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

const GroupModel = model<GroupDocument>(GROUP, GroupSchema);

const Group: IGroup = {
    ...resourceFactory(GroupModel),

    async addUser(group: string, user: string) {
        const doc = await this.get(group);
        if (!doc) {
            throw new Error(NOT_FOUND);
        }
        const alreadyAMember = doc.participants.some((p) => p.id === user);
        if (alreadyAMember) {
            throw new Error(USER_ALREADY_IN_GROUP);
        }
        return this.update(group, {
            $push: {
                //@ts-ignore
                participants: user,
            },
        });
    },

    async removeUser(group: string, user: string) {
        const doc = await this.get(group);
        if (!doc) {
            throw new Error(NOT_FOUND);
        }
        const participantIndex = doc.participants.findIndex(
            (p) => p.id === user
        );
        if (participantIndex < 0) {
            throw new Error(NOT_FOUND);
        }
        return this.update(group, {
            $pull: {
                participants: user,
            },
        });
    },

    async sendMessage(group: string, message: MessageDocument) {
        return this.update(group, message);
    },
};

export default Group;
