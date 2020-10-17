import { Document, Schema, model, UpdateQuery } from "mongoose";
import { IResource, User, UserDocument } from ".";
import { resources } from "..";
import resourceFactory from "./utils/resourceFactory";
const { USER, GEAR } = resources;

export interface GearDocument extends Document {
    name?: string;
    _model?: string;
    brand?: string;
    type?: string;
    owner: UserDocument;
}

export interface CreateGearInput {
    name?: GearDocument["name"];
    _model?: GearDocument["_model"];
    brand?: GearDocument["brand"];
    type?: GearDocument["type"];
}

export interface UpdateGearInput extends UpdateQuery<GearDocument> {
    name?: GearDocument["name"];
    _model?: GearDocument["_model"];
    brand?: GearDocument["brand"];
    type?: GearDocument["type"];
}

const GearSchema: Schema = new Schema({
    name: {
        type: String,
        max: 30,
    },
    model: {
        type: String,
        max: 30,
    },
    brand: {
        type: String,
        max: 30,
    },
    type: {
        type: String,
        max: 30,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: USER,
    },
});

const GearModel = model<GearDocument>(GEAR, GearSchema);

const Gear: IResource<
    GearDocument,
    CreateGearInput,
    UpdateGearInput
> = resourceFactory(GearModel, {
    async create(gear: GearDocument) {
        await User.update(gear.owner.id, {
            $push: {
                gear: gear.id,
            },
        });
    },

    async delete(gear: GearDocument) {
        await User.update(gear.owner.id, {
            $pull: {
                gear: gear.id,
            },
        });
    },
});

export default Gear;
