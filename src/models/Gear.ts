import { Document, Schema, model, UpdateQuery } from "mongoose";
import { IResource, User, UserDocument } from ".";
import { resources, errorCodes } from "..";
import { getResourceId } from "../utils";
import resourceFactory from "./utils/resourceFactory";
const { NOT_FOUND } = errorCodes;

export interface GearDocument extends Document {
    name?: string;
    _model?: string;
    brand?: string;
    type?: string;
    owner: UserDocument | string;
}

export interface CreateGearInput {
    name?: GearDocument["name"];
    model?: GearDocument["_model"];
    brand?: GearDocument["brand"];
    type?: GearDocument["type"];
    owner: GearDocument["owner"];
}

export interface UpdateGearInput extends UpdateQuery<GearDocument> {
    name?: GearDocument["name"];
    model?: GearDocument["_model"];
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
        ref: resources.USER,
    },
});

const GearModel = model<GearDocument>(resources.GEAR, GearSchema);

const Gear: IResource<
    GearDocument,
    CreateGearInput,
    UpdateGearInput
> = resourceFactory(GearModel, {
    async create(gear: GearDocument) {
        await User.update(getResourceId(gear.owner), {
            $push: {
                gear: gear.id,
            },
        });
    },

    async delete(id: string) {
        const gear = await Gear.get(id);
        if (!gear) {
            throw new Error(NOT_FOUND);
        }
        await User.update(getResourceId(gear.owner), {
            $pull: {
                gear: id,
            },
        });
    },
});

export default Gear;
