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
import { resources, errorCodes } from "..";
import resourceFactory from "./utils/resourceFactory";
const { USER, DIVE, CLUB, GEAR } = resources;
const {
    INVALID_ARGUMENT_TIME_IN_LATER_THAN_OUT,
    INVALID_ARGUMENT_DIVE_TIME_EXCEEDED,
} = errorCodes;

export interface DiveDocument extends Document {
    user: UserDocument;
    public: boolean;
    timeIn?: Date;
    timeOut?: Date;
    bottomTime?: number;
    safetyStopTime?: number;
    diveTime?: number;
    maxDepth?: number;
    location?: string;
    description?: string;
    club?: ClubDocument;
    buddies?: UserDocument[];
    gear?: GearDocument[];
}

export interface CreateDiveInput {
    user?: UserDocument;
    public?: boolean;
    timeIn?: Date;
    timeOut?: Date;
    bottomTime?: number;
    safetyStopTime?: number;
    diveTime?: number;
    maxDepth?: number;
    location?: string;
    description?: string;
    club?: ClubDocument;
    buddies?: UserDocument[];
    gear?: GearDocument[];
}

export interface UpdateDiveInput extends UpdateQuery<DiveDocument> {
    user?: UserDocument;
    public?: boolean;
    timeIn?: Date;
    timeOut?: Date;
    bottomTime?: number;
    safetyStopTime?: number;
    diveTime?: number;
    maxDepth?: number;
    location?: string;
    description?: string;
    club?: ClubDocument;
    buddies?: UserDocument[];
    gear?: GearDocument[];
}

export interface IDive
    extends IResource<DiveDocument, DiveDocument, UpdateUserInput> {
    addGear(diveId: string, gearId: string): Promise<DiveDocument | null>;
    removeGear(diveId: string, gearId: string): Promise<DiveDocument | null>;
    addBuddy(diveId: string, buddyId: string): Promise<DiveDocument | null>;
    removeBuddy(diveId: string, buddyId: string): Promise<DiveDocument | null>;
}

const DiveSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
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
        ref: CLUB,
    },
    buddies: [
        {
            type: Schema.Types.ObjectId,
            ref: USER,
        },
    ],
    gear: [
        {
            type: Schema.Types.ObjectId,
            ref: GEAR,
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

const DiveModel = model<DiveDocument>(DIVE, DiveSchema);

const Dive: IDive = {
    ...resourceFactory(DiveModel, {
        create: async (dive: DiveDocument) => {
            await User.update(dive.user.id, {
                $push: {
                    dives: dive.id,
                },
            });
        },

        delete: async (dive: DiveDocument) => {
            await User.update(dive.user.id, {
                $pull: {
                    dives: dive ? dive.id : null,
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
