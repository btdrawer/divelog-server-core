import { Schema, Model, model } from "mongoose";
import { IGear } from "../types/modelTypes";
import { USER, GEAR } from "../constants/resources";

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

const GearModel: Model<IGear> = model<IGear>(GEAR, GearSchema);

export default GearModel;
