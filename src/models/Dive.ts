import moment from "moment";
import { Document, Schema, model, UpdateQuery } from "mongoose";
import {
    IResource,
    User,
    UserDocument,
    ClubDocument,
    GearDocument,
    UpdateUserInput,
} from ".";
import { getResourceId, resources, errorCodes } from "..";
import resourceFactory from "./utils/resourceFactory";
const {
    INVALID_ARGUMENT_TIME_IN_LATER_THAN_OUT,
    INVALID_ARGUMENT_DIVE_TIME_EXCEEDED,
    NOT_FOUND,
} = errorCodes;

export interface DiveDocument extends Document {
    user: UserDocument | string;
    public: boolean;
    timeIn?: Date;
    timeOut?: Date;
    bottomTime?: number;
    safetyStopTime?: number;
    diveTime?: number;
    maxDepth?: number;
    location?: string;
    description?: string;
    club?: ClubDocument | string;
    buddies?: UserDocument[] | string[];
    gear?: GearDocument[] | string[];
}

export interface CreateDiveInput {
    user: DiveDocument["user"];
    public: DiveDocument["public"];
    timeIn?: DiveDocument["timeIn"];
    timeOut?: DiveDocument["timeOut"];
    bottomTime?: DiveDocument["bottomTime"];
    safetyStopTime?: DiveDocument["safetyStopTime"];
    diveTime?: DiveDocument["diveTime"];
    maxDepth?: DiveDocument["maxDepth"];
    location?: DiveDocument["location"];
    description?: DiveDocument["description"];
    club?: DiveDocument["club"];
    buddies?: DiveDocument["buddies"];
    gear?: DiveDocument["gear"];
}

export interface UpdateDiveInput extends UpdateQuery<DiveDocument> {
    public?: DiveDocument["public"];
    timeIn?: DiveDocument["timeIn"];
    timeOut?: DiveDocument["timeOut"];
    bottomTime?: DiveDocument["bottomTime"];
    safetyStopTime?: DiveDocument["safetyStopTime"];
    diveTime?: DiveDocument["diveTime"];
    maxDepth?: DiveDocument["maxDepth"];
    location?: DiveDocument["location"];
    description?: DiveDocument["description"];
    club?: DiveDocument["club"];
    buddies?: DiveDocument["buddies"];
    gear?: DiveDocument["gear"];
}

export interface IDive
    extends IResource<DiveDocument, CreateDiveInput, UpdateDiveInput> {
    addGear(diveId: string, gearId: string): Promise<DiveDocument | null>;
    removeGear(diveId: string, gearId: string): Promise<DiveDocument | null>;
    addBuddy(diveId: string, buddyId: string): Promise<DiveDocument | null>;
    removeBuddy(diveId: string, buddyId: string): Promise<DiveDocument | null>;
}

const DiveSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: resources.USER,
        required: true,
    },
    public: {
        type: Boolean,
        default: false,
    },
    timeIn: Date,
    timeOut: Date,
    bottomTime: Number,
    safetyStopTime: Number,
    diveTime: Number,
    maxDepth: Number,
    location: String,
    description: String,
    club: {
        type: Schema.Types.ObjectId,
        ref: resources.CLUB,
    },
    buddies: [
        {
            type: Schema.Types.ObjectId,
            ref: resources.USER,
        },
    ],
    gear: [
        {
            type: Schema.Types.ObjectId,
            ref: resources.GEAR,
        },
    ],
});

const processTime = (data: DiveDocument): void => {
    let { timeIn, timeOut } = data;
    let timeInUnix, timeOutUnix;
    if (timeIn) {
        timeInUnix = parseInt(moment(timeIn).format("x"));
    }
    if (timeOut) {
        timeOutUnix = parseInt(moment(timeOut).format("x"));
    }
    if (timeInUnix && timeOutUnix) {
        data.diveTime = (timeOutUnix - timeInUnix) / 60000;
    }
    const { diveTime, bottomTime, safetyStopTime } = data;
    if (diveTime) {
        if (diveTime < 0) {
            throw new Error(INVALID_ARGUMENT_TIME_IN_LATER_THAN_OUT);
        }
        if (
            bottomTime &&
            safetyStopTime &&
            diveTime < bottomTime + safetyStopTime
        ) {
            throw new Error(INVALID_ARGUMENT_DIVE_TIME_EXCEEDED);
        }
    }
};

DiveSchema.pre<DiveDocument>("save", function (next): void {
    processTime(this);
    next();
});

DiveSchema.pre<DiveDocument & { _update: DiveDocument }>(
    "findOneAndUpdate",
    function (next): void {
        if (this._update) {
            processTime(this._update);
        }
        next();
    }
);

const DiveModel = model<DiveDocument>(resources.DIVE, DiveSchema);

const Dive: IDive = {
    ...resourceFactory(DiveModel, {
        async create(dive: DiveDocument) {
            await User.update(getResourceId(dive.user), {
                $push: {
                    dives: dive.id,
                },
            });
        },

        async delete(id: string) {
            const dive = await Dive.get(id);
            if (!dive) {
                throw new Error(NOT_FOUND);
            }
            await User.update(getResourceId(dive.user), {
                $pull: {
                    dives: id,
                },
            });
        },
    }),

    async addGear(diveId: string, gearId: string) {
        return this.update(diveId, {
            $push: {
                //@ts-ignore
                gear: gearId,
            },
        });
    },

    async removeGear(diveId: string, gearId: string) {
        return this.update(diveId, {
            $pull: {
                gear: gearId,
            },
        });
    },

    async addBuddy(diveId: string, buddyId: string) {
        return this.update(diveId, {
            $push: {
                buddies: buddyId,
            },
        });
    },

    async removeBuddy(diveId: string, buddyId: string) {
        return this.update(diveId, {
            $pull: {
                buddies: buddyId,
            },
        });
    },
};

export default Dive;
