import moment from "moment";
import { Schema, Query, model } from "mongoose";
import { IDive } from "../types/modelTypes";
import {
    INVALID_ARGUMENT_TIME_IN_LATER_THAN_OUT,
    INVALID_ARGUMENT_DIVE_TIME_EXCEEDED,
} from "../constants/errorCodes";
import { USER, DIVE, CLUB, GEAR } from "../constants/resources";

const DiveSchema = new Schema({
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

const processTime = (data: IDive): void => {
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

DiveSchema.pre<IDive>("save", function (next) {
    processTime(this);
    next();
});

DiveSchema.pre<IDive & { _update: IDive }>("findOneAndUpdate", function (next) {
    if (this._update) {
        processTime(this._update);
    }
    next();
});

const DiveModel = model<IDive>(DIVE, DiveSchema);

export default DiveModel;
