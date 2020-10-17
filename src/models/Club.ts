import { Document, Schema, model, UpdateQuery } from "mongoose";
import { IResource, User, UserDocument } from ".";
import { resources } from "..";
import resourceFactory from "./utils/resourceFactory";
const { USER, CLUB } = resources;

export interface ClubDocument extends Document {
    name: string;
    location: string;
    managers: UserDocument[] | string[];
    members: UserDocument[] | string[];
    description?: string;
    website?: string;
}

export interface CreateClubInput {
    name: ClubDocument["name"];
    location: ClubDocument["location"];
    managers: ClubDocument["managers"];
    description?: ClubDocument["description"];
    website?: ClubDocument["website"];
}

export interface UpdateClubInput extends UpdateQuery<ClubDocument> {
    name?: ClubDocument["name"];
    location?: ClubDocument["location"];
    description?: ClubDocument["description"];
    website?: ClubDocument["website"];
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
    ...resourceFactory(ClubModel, {
        async create(club: ClubDocument) {
            await User.update(<string>club.managers[0], {
                $push: {
                    "clubs.manager": club.id,
                },
            });
        },
    }),

    async addManager(clubId: string, managerId: string) {
        const club = await this.update(clubId, {
            $push: {
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
        const club = await this.update(clubId, {
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
        const club = await this.update(clubId, {
            $push: {
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
        const club = await this.update(clubId, {
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
                "clubs.manager": {
                    $in: id,
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
                "clubs.member": {
                    $in: id,
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
