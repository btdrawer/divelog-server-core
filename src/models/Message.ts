import { Document, Schema, model } from "mongoose";
import { UserDocument } from ".";
import { resources } from "..";

export interface MessageDocument extends Document {
    text: string;
    sender: UserDocument | string;
}

export interface CreateMessageInput {
    text: MessageDocument["text"];
    sender: MessageDocument["sender"];
}

export const MessageSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: resources.USER,
    },
});

export const MessageModel = model<MessageDocument>(
    resources.MESSAGE,
    MessageSchema
);
