import { get } from "lodash";
import { connect, disconnect } from "./utils/setup";
import {
    seedDatabase,
    users,
    dives,
    clubs,
    gear,
} from "../src/utils/seedDatabase";
import { Dive, User } from "../src";

describe("Dive", () => {
    beforeAll(connect);
    afterAll(disconnect);
    beforeEach(
        seedDatabase({
            dives: true,
            clubs: true,
            gear: true,
        })
    );

    test("Should create a new dive", async (done: any) => {
        const dive = await Dive.create({
            timeIn: new Date("2020-01-01T11:00:00"),
            timeOut: new Date("2020-01-01T11:25:00"),
            bottomTime: 22.0,
            safetyStopTime: 3.0,
            maxDepth: 17.3,
            location: "Sample location",
            description: "Dive description",
            user: get(users[0], "output.id"),
            public: true,
        });
        if (dive) {
            expect(dive.timeIn).toEqual(new Date("2020-01-01T11:00:00"));
            expect(dive.timeOut).toEqual(new Date("2020-01-01T11:25:00"));
            expect(dive.bottomTime).toEqual(22.0);
            expect(dive.safetyStopTime).toEqual(3.0);
            expect(dive.diveTime).toEqual(25);
            expect(dive.maxDepth).toEqual(17.3);
            expect(dive.location).toEqual("Sample location");
            expect(dive.description).toEqual("Dive description");
            expect(dive.user.toString()).toEqual(get(users[0], "output.id"));
            expect(dive.public).toEqual(true);
        } else {
            expect(dive).not.toBeNull();
        }
        done();
    });

    test("Should get a list of clubs", async (done: any) => {
        const retrievedDives = await Dive.find();
        if (retrievedDives) {
            expect(retrievedDives.length).toEqual(5);
            const exampleDive = retrievedDives[0];
            expect(exampleDive.timeIn).toEqual(get(dives[0], "output.timeIn"));
            expect(exampleDive.timeOut).toEqual(
                get(dives[0], "output.timeOut")
            );
            expect(exampleDive.bottomTime).toEqual(dives[0].input.bottomTime);
            expect(exampleDive.safetyStopTime).toEqual(
                dives[0].input.safetyStopTime
            );
            expect(exampleDive.diveTime).toEqual(
                get(dives[0], "output.diveTime")
            );
            expect(exampleDive.maxDepth).toEqual(dives[0].input.maxDepth);
            expect(exampleDive.location).toEqual(dives[0].input.location);
            expect(exampleDive.description).toEqual(dives[0].input.description);
            expect(exampleDive.user.toString()).toEqual(dives[0].input.user);
            expect(exampleDive.public).toEqual(dives[0].input.public);
        } else {
            expect(retrievedDives).not.toBeNull();
        }
        done();
    });

    test("Should get a list of clubs with filter", async (done: any) => {
        const retrievedDives = await Dive.find({
            description: dives[1].input.description,
        });
        if (retrievedDives) {
            expect(retrievedDives.length).toEqual(1);
            const exampleDive = retrievedDives[0];
            expect(exampleDive.timeIn).toEqual(get(dives[1], "output.timeIn"));
            expect(exampleDive.timeOut).toEqual(
                get(dives[1], "output.timeOut")
            );
            expect(exampleDive.bottomTime).toEqual(dives[1].input.bottomTime);
            expect(exampleDive.safetyStopTime).toEqual(
                dives[1].input.safetyStopTime
            );
            expect(exampleDive.diveTime).toEqual(
                get(dives[1], "output.diveTime")
            );
            expect(exampleDive.maxDepth).toEqual(dives[1].input.maxDepth);
            expect(exampleDive.location).toEqual(dives[1].input.location);
            expect(exampleDive.description).toEqual(dives[1].input.description);
            expect(exampleDive.user.toString()).toEqual(dives[1].input.user);
            expect(exampleDive.public).toEqual(dives[1].input.public);
        } else {
            expect(retrievedDives).not.toBeNull();
        }
        done();
    });

    test("Should get a list of clubs and return only specific fields", async (done: any) => {
        const retrievedDives = await Dive.find({}, ["description"]);
        if (retrievedDives) {
            expect(retrievedDives.length).toEqual(5);
            const exampleDive = retrievedDives[0];
            expect(exampleDive.description).toEqual(dives[0].input.description);
        } else {
            expect(retrievedDives).not.toBeNull();
        }
        done();
    });

    test("Should get a dive", async (done: any) => {
        const dive = await Dive.get(get(dives[0], "output.id"));
        if (dive) {
            expect(dive.timeIn).toEqual(get(dives[0], "output.timeIn"));
            expect(dive.timeOut).toEqual(get(dives[0], "output.timeOut"));
            expect(dive.bottomTime).toEqual(dives[0].input.bottomTime);
            expect(dive.safetyStopTime).toEqual(dives[0].input.safetyStopTime);
            expect(dive.diveTime).toEqual(get(dives[0], "output.diveTime"));
            expect(dive.maxDepth).toEqual(dives[0].input.maxDepth);
            expect(dive.location).toEqual(dives[0].input.location);
            expect(dive.description).toEqual(dives[0].input.description);
            expect(dive.user.toString()).toEqual(dives[0].input.user);
            expect(dive.public).toEqual(dives[0].input.public);
        } else {
            expect(dive).not.toBeNull();
        }
        done();
    });

    test("Should update dive", async (done: any) => {
        const dive = await Dive.update(get(dives[0], "output.id"), {
            description: "Updated description",
        });
        if (dive) {
            expect(dive.description).toEqual("Updated description");
        } else {
            expect(dive).not.toBeNull();
        }
        done();
    });

    test("Should add gear", async (done: any) => {
        const dive = await Dive.addGear(
            get(dives[0], "output.id"),
            get(gear[1], "output.id")
        );
        if (dive) {
            expect(get(dive, "gear.length")).toEqual(2);
            expect(get(dive, "gear[1]").toString()).toEqual(
                get(gear[1], "output.id")
            );
        } else {
            expect(dive).not.toBeNull();
        }
        done();
    });

    test("Should remove gear", async (done: any) => {
        const dive = await Dive.removeGear(
            get(dives[0], "output.id"),
            get(dives[0], "output.gear[0]")
        );
        if (dive) {
            expect(get(dive, "gear.length")).toEqual(0);
        } else {
            expect(dive).not.toBeNull();
        }
        done();
    });

    test("Should add buddy", async (done: any) => {
        const dive = await Dive.addBuddy(
            get(dives[0], "output.id"),
            get(users[2], "output.id")
        );
        if (dive) {
            expect(get(dive, "buddies.length")).toEqual(2);
            expect(get(dive, "buddies[1]").toString()).toEqual(
                get(users[2], "output.id")
            );
        } else {
            expect(dive).not.toBeNull();
        }
        done();
    });

    test("Should remove buddy", async (done: any) => {
        const dive = await Dive.removeBuddy(
            get(dives[0], "output.id"),
            get(dives[0], "output.buddies[0]")
        );
        if (dive) {
            expect(get(dive, "buddies.length")).toEqual(0);
        } else {
            expect(dive).not.toBeNull();
        }
        done();
    });

    test("Should delete a club", async (done: any) => {
        const diveId = get(dives[0], "output.id");
        const dive = await Dive.delete(diveId);
        const checkDiveIsDeleted = await Dive.get(diveId);
        const user = await User.get(get(dives[0], "output.user"));
        if (dive) {
            expect(dive.id).toEqual(diveId);
            expect(checkDiveIsDeleted).toBeNull();
        } else {
            expect(dive).not.toBeNull();
        }
        if (user) {
            const diveInList = user.dives.filter((d) => d.id === diveId);
            expect(diveInList.length).toEqual(0);
        } else {
            expect(user).not.toBeNull();
        }
        done();
    });
});
