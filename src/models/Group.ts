import { Document, Schema, model, UpdateQuery } from "mongoose";
import {
    IResource,
    UserDocument,
    MessageDocument,
    CreateMessageInput,
} from ".";
import { MessageSchema, MessageModel } from "./Message";
import { resources, errorCodes } from "..";
import resourceFactory from "./utils/resourceFactory";
import { getResourceId } from "../utils";
const { USER_NOT_IN_GROUP, USER_ALREADY_IN_GROUP, NOT_FOUND } = errorCodes;

export interface GroupDocument extends Document {
    name: string;
    participants: UserDocument[] | string[];
    messages: MessageDocument[];
}

export interface CreateGroupInput {
    name: GroupDocument["name"];
    participants: GroupDocument["participants"];
    messages: CreateMessageInput[];
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
        message: CreateMessageInput
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
            ref: resources.USER,
        },
    ],
    messages: [MessageSchema],
});

const GroupModel = model<GroupDocument>(resources.GROUP, GroupSchema);

const Group: IGroup = {
    ...resourceFactory(GroupModel),

    async addUser(group: string, user: string) {
        const doc = await this.get(group);
        if (!doc) {
            throw new Error(NOT_FOUND);
        }
        const isMember = doc.participants.some(
            (p: UserDocument | string) =>
                getResourceId(p).toString() === user.toString()
        );
        if (isMember) {
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
        const isMember = doc.participants.some(
            (p: UserDocument | string) =>
                getResourceId(p).toString() === user.toString()
        );
        if (!isMember) {
            throw new Error(USER_NOT_IN_GROUP);
        }
        return this.update(group, {
            $pull: {
                participants: user,
            },
        });
    },

    async sendMessage(groupId: string, message: CreateMessageInput) {
        return this.update(groupId, {
            $push: {
                messages: new MessageModel(message),
            },
        });
    },
};

export default Group;
