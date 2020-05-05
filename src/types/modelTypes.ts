import { Document } from "mongoose";

export interface IUser extends Document {
    id: string;
    _id: string;
    name: string;
    username: string;
    email: string;
    password: string;
    token?: string;
    dives?: IDive[];
    clubs?: {
        manager?: IClub[];
        member?: IClub[];
    };
    gear?: IGear[];
    friendRequests?: {
        inbox?: IUser[];
        sent?: IUser[];
    };
}

export interface IDive extends Document {
    id: string;
    _id: string;
    user: IUser;
    public: boolean;
    timeIn?: Date;
    timeOut?: Date;
    bottomTime?: number;
    safetyStopTime?: number;
    diveTime?: number;
    maxDepth?: number;
    location?: string;
    description?: string;
    club?: IClub;
    buddies?: IUser[];
    gear?: IGear[];
}

export interface IClub extends Document {
    id: string;
    _id: string;
    name: string;
    location: string;
    description?: string;
    managers: IUser[];
    members: IUser[];
    website?: string;
}

export interface IGear extends Document {
    id: string;
    _id: string;
    name?: string;
    _model?: string;
    brand?: string;
    type?: string;
    owner: IUser;
}

export interface IGroup extends Document {
    id: string;
    _id: string;
    name: string;
    participants: IUser[];
    messages: {
        text: string;
        sender: IUser;
    }[];
}
