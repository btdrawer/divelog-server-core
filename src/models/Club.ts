import { Document, Schema, model, UpdateQuery } from "mongoose";
import { IResource, User, UserDocument } from ".";
import { resources } from "..";
import resourceFactory from "./utils/resourceFactory";
const { USER, CLUB } = resources;

export interface ClubDocument extends Document {
    name: string;
    location: string;
    description?: string;
    managers: UserDocument[];
    members: UserDocument[];
    website?: string;
}

export interface CreateClubInput {
    name: string;
    location: string;
    managers: string[];
    website?: string;
}

export interface UpdateClubInput extends UpdateQuery<ClubDocument> {
    name?: string;
    location?: string;
    website?: string;
}

export interface IClub
    extends IResource<ClubDocument, CreateClubInput, UpdateClubInput> {
    addManager(clubId: string, managerId: string): Promise<ClubDocument | null>;
    removeManager(
        clubId: string,
        managerId: string
    ): Promise<ClubDocument | null>;
    addMember(clubId: string, memberId: string): Promise<ClubDocument | null>;
    removeMember(
        clubId: string,
        memberId: string
    ): Promise<ClubDocument | null>;
}

const ClubSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        max: 30,
    },
    location: {
        type: String,
        required: true,
        max: 50,
    },
    description: {
        type: String,
    },
    managers: [
        {
            type: Schema.Types.ObjectId,
            ref: USER,
            required: true,
        },
    ],
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: USER,
            required: true,
        },
    ],
    website: {
        type: String,
        max: 40,
    },
});

const ClubModel = model<ClubDocument>(CLUB, ClubSchema);

const Club: IClub = {
    ...resourceFactory(ClubModel),

    async create(data: CreateClubInput) {
        const club = await new ClubModel(data).save();
        await User.update(data.managers[0], {
            $push: {
                "clubs.manager": club.id,
            },
        });
        return club;
    },

    async addManager(clubId: string, managerId: string) {
        const club = this.update(clubId, {
            $push: {
                //@ts-ignore
                managers: managerId,
            },
        });
        await User.update(managerId, {
            $push: {
                "clubs.manager": clubId,
            },
        });
        return club;
    },

    async removeManager(clubId: string, managerId: string) {
        const club = this.update(clubId, {
            $pull: {
                managers: managerId,
            },
        });
        await User.update(managerId, {
            $pull: {
                "clubs.manager": clubId,
            },
        });
        return club;
    },

    async addMember(clubId: string, memberId: string) {
        const club = this.update(clubId, {
            $push: {
                //@ts-ignore
                members: memberId,
            },
        });
        await User.update(memberId, {
            $push: {
                "clubs.member": clubId,
            },
        });
        return club;
    },

    async removeMember(clubId: string, memberId: string) {
        const club = this.update(clubId, {
            $pull: {
                members: memberId,
            },
        });
        await User.update(memberId, {
            $pull: {
                "clubs.member": clubId,
            },
        });
        return club;
    },

    async delete(id: string) {
        await User.updateMany(
            {
                $in: {
                    "clubs.manager": id,
                },
            },
            {
                $pull: {
                    "clubs.manager": id,
                },
            }
        );
        await User.updateMany(
            {
                $in: {
                    "clubs.member": id,
                },
            },
            {
                $pull: {
                    "clubs.member": id,
                },
            }
        );
        return ClubModel.findByIdAndDelete(id);
    },
};

export default Club;
