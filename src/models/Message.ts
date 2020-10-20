import { Document, Schema, model } from "mongoose";
import { UserDocument } from ".";
import { resources } from "..";

export interface MessageDocument extends Document {
    text: string;
    sender: UserDocument | string;
    sent: Date;
}

export interface CreateMessageInput {
    text: MessageDocument["text"];
    sender: MessageDocument["sender"];
    sent: MessageDocument["sent"];
}

export const MessageSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: resources.USER,
        required: true,
    },
    sent: {
        type: Date,
        required: true,
        default: new Date(),
    },
});

export const MessageModel = model<MessageDocument>(
    resources.MESSAGE,
    MessageSchema
);
