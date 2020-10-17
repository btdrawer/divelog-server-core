import _ from "lodash";
import mongoose from "mongoose";
import {
    documentTypes,
    User,
    Dive,
    Club,
    Gear,
    Group,
    resources as resourceConstants,
} from "..";

type TestData<TInput, TOutput> = {
    input: TInput;
    output?: TOutput;
    unhashedPassword?: string;
    token?: string;
}[];

export const users: TestData<any, documentTypes.UserDocument> = [
    {
        input: {
            name: "User 1",
            username: "user1",
            email: "user1@example.com",
            password: "aafghd7675",
        },
        output: undefined,
        token: undefined,
    },
    {
        input: {
            name: "User 2",
            username: "user2",
            email: "user2@example.com",
            password: "jhhd6625",
        },
        output: undefined,
        token: undefined,
    },
    {
        input: {
            name: "User 3",
            username: "user3",
            email: "user3@example.com",
            password: "hd8y78rw4y",
        },
        output: undefined,
    },
    {
        input: {
            name: "User 4",
            username: "user4",
            email: "user4@example.com",
            password: "hjkfdshds787",
        },
        output: undefined,
    },
];

export const dives: TestData<any, documentTypes.DiveDocument> = [
    {
        input: {
            timeIn: "2020-01-01T11:00:00",
            timeOut: "2020-01-01T11:25:00",
            bottomTime: 22.0,
            safetyStopTime: 3.0,
            maxDepth: 17.3,
            location: "Sample location",
            description: "Dive description",
            public: true,
        },
        output: undefined,
    },
    {
        input: {
            timeIn: "2020-01-02T11:00:00",
            timeOut: "2020-01-02T11:22:00",
            bottomTime: 19.0,
            safetyStopTime: 3.0,
            maxDepth: 15.5,
            location: "Sample location",
            description: "Dive description",
            public: true,
        },
        output: undefined,
    },
    {
        input: {
            timeIn: "2020-01-03T11:00:00",
            timeOut: "2020-01-03T11:22:00",
            bottomTime: 19.0,
            safetyStopTime: 3.0,
            maxDepth: 15.9,
            location: "Sample location 2",
            description: "Dive description 2",
            public: true,
        },
        output: undefined,
    },
    {
        input: {
            timeIn: "2020-01-03T11:00:00",
            timeOut: "2020-01-03T11:22:00",
            bottomTime: 19.0,
            safetyStopTime: 3.0,
            maxDepth: 15.9,
            location: "Sample location 2",
            description: "Dive description 2",
            public: false,
        },
        output: undefined,
    },
    {
        input: {
            timeIn: "2020-01-03T11:00:00",
            timeOut: "2020-01-03T11:22:00",
            bottomTime: 19.0,
            safetyStopTime: 3.0,
            maxDepth: 15.9,
            location: "Sample location 2",
            description: "Dive description 2",
            public: true,
        },
        output: undefined,
    },
];

export const clubs: TestData<any, documentTypes.ClubDocument> = [
    {
        input: {
            name: "A",
            location: "B",
            description: "C",
            website: "example.com",
        },
        output: undefined,
    },
    {
        input: {
            name: "X",
            location: "Y",
            description: "Z",
            website: "example.co.uk",
        },
        output: undefined,
    },
];

export const gear: TestData<any, documentTypes.GearDocument> = [
    {
        input: {
            name: "A",
            brand: "A",
            model: "B",
            type: "C",
        },
        output: undefined,
    },
    {
        input: {
            name: "X",
            brand: "Y",
            model: "Z",
            type: "W",
        },
        output: undefined,
    },
    {
        input: {
            name: "X",
            brand: "Y",
            model: "Z",
            type: "W",
        },
        output: undefined,
    },
];

export const groups: TestData<any, documentTypes.GroupDocument> = [
    {
        input: {
            name: "New Group",
            messages: [
                {
                    text: "Hi",
                },
            ],
        },
        output: undefined,
    },
    {
        input: {
            name: "New Group 2",
            messages: [
                {
                    text: "Hi",
                },
            ],
        },
        output: undefined,
    },
    {
        input: {
            name: "New Group 3",
            messages: [
                {
                    text: "Hi",
                },
            ],
        },
        output: undefined,
    },
];

const saveUser = async (index: number) => {
    const user = await User.create(users[index].input);
    users[index].output = user;
    users[index].token = user.token;
    return user;
};

const saveClub = async (
    index: number,
    managerIds: string[] | null,
    memberIds: string[] | null
) => {
    clubs[index].input.managers = managerIds;
    clubs[index].input.members = memberIds;
    const club = await Club.create(clubs[index].input);
    clubs[index].output = club;
    return club;
};

const saveGear = async (index: number, ownerId: string | null) => {
    gear[index].input.owner = ownerId;
    const savedGear = await Gear.create(gear[index].input);
    gear[index].output = savedGear;
    return savedGear;
};

const saveDive = async (
    index: number,
    userId: string | null,
    clubId: string | null,
    buddyIds: string[] | null,
    gearIds: string[] | null
) => {
    dives[index].input.user = userId;
    dives[index].input.club = clubId;
    dives[index].input.buddies = buddyIds;
    dives[index].input.gear = gearIds;
    const dive = await Dive.create(dives[index].input);
    dives[index].output = dive;
    return dive;
};

const saveGroup = async (
    index: number,
    myId: string | null,
    userIds: string[] | null
) => {
    groups[index].input.participants = userIds;
    groups[index].input.messages[0].sender = myId;
    const group = await Group.create(groups[index].input);
    groups[index].output = group;
    return group;
};

export const seedDatabase = (resources: {
    dives?: true;
    clubs?: true;
    gear?: true;
    groups?: true;
}) => async (done: any) => {
    await mongoose.connection.db.dropDatabase();

    // Example users
    await saveUser(0);
    await saveUser(1);
    await saveUser(2);
    await saveUser(3);

    // Example clubs
    if (resources.clubs) {
        await saveClub(
            0,
            [_.get(users[0], "output.id"), _.get(users[2], "output.id")],
            [_.get(users[1], "output.id")]
        );
        await saveClub(
            1,
            [_.get(users[2], "output.id")],
            [_.get(users[0], "output.id")]
        );
    }

    // Example gear
    if (resources.gear) {
        await saveGear(0, _.get(users[0], "output.id"));
        await saveGear(1, _.get(users[0], "output.id"));
        await saveGear(2, _.get(users[1], "output.id"));
    }

    // Example dives
    if (resources.dives) {
        await saveDive(
            0,
            _.get(users[0], "output.id"),
            _.get(clubs[0], "output.id"),
            [_.get(users[1], "output.id")],
            [_.get(gear[0], "output.id")]
        );
        await saveDive(
            1,
            _.get(users[1], "output.id"),
            null,
            [_.get(users[0], "output.id")],
            [_.get(gear[0], "output.id"), _.get(gear[1], "output.id")]
        );
        await saveDive(2, _.get(users[0], "output.id"), null, [], []);
        await saveDive(3, _.get(users[1], "output.id"), null, [], []);
        await saveDive(4, _.get(users[1], "output.id"), null, [], []);
    }

    // Example groups
    if (resources.groups) {
        await saveGroup(0, _.get(users[0], "output.id"), [
            _.get(users[0], "output.id"),
            _.get(users[1], "output.id"),
        ]);
        await saveGroup(1, _.get(users[1], "output.id"), [
            _.get(users[1], "output.id"),
            _.get(users[2], "output.id"),
        ]);
        await saveGroup(2, _.get(users[0], "output.id"), [
            _.get(users[0], "output.id"),
            _.get(users[1], "output.id"),
        ]);
    }

    done();
};
