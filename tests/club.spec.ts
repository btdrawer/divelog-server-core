import { get } from "lodash";
import { connect, disconnect } from "./utils/setup";
import { seedDatabase, users, clubs } from "../src/utils/seedDatabase";
import { Club, User } from "../src";

describe("Club", () => {
    beforeAll(connect);
    afterAll(disconnect);
    beforeEach(
        seedDatabase({
            clubs: true,
        })
    );

    test("Should create a new club", async (done: any) => {
        const club = await Club.create({
            name: "A",
            location: "B",
            managers: [get(users[0], "output.id")],
            description: "C",
            website: "example.com",
        });
        if (club) {
            expect(club.name).toEqual("A");
            expect(club.location).toEqual("B");
            expect(club.managers[0].toString()).toEqual(
                get(users[0], "output.id")
            );
            expect(club.description).toEqual("C");
            expect(club.website).toEqual("example.com");
        } else {
            expect(club).not.toBeNull();
        }
        done();
    });

    test("Should get a list of clubs", async (done: any) => {
        const retrievedClubs = await Club.find();
        if (retrievedClubs) {
            expect(retrievedClubs.length).toEqual(2);
            const exampleClub = retrievedClubs[0];
            expect(exampleClub.name).toEqual(clubs[0].input.name);
            expect(exampleClub.location).toEqual(clubs[0].input.location);
        } else {
            expect(retrievedClubs).not.toBeNull();
        }
        done();
    });

    test("Should get a list of clubs with filter", async (done: any) => {
        const retrievedClubs = await Club.find({
            name: clubs[1].input.name,
        });
        if (retrievedClubs) {
            expect(retrievedClubs.length).toEqual(1);
            const exampleClub = retrievedClubs[0];
            expect(exampleClub.name).toEqual(clubs[1].input.name);
            expect(exampleClub.location).toEqual(clubs[1].input.location);
        } else {
            expect(retrievedClubs).not.toBeNull();
        }
        done();
    });

    test("Should get a list of clubs and return only specific fields", async (done: any) => {
        const retrievedClubs = await Club.find({}, ["description"]);
        if (retrievedClubs) {
            expect(retrievedClubs.length).toEqual(2);
            const exampleClub = retrievedClubs[0];
            expect(exampleClub.name).toBeUndefined();
            expect(exampleClub.location).toBeUndefined();
            expect(exampleClub.description).toEqual(clubs[0].input.description);
        } else {
            expect(retrievedClubs).not.toBeNull();
        }
        done();
    });

    test("Should get a single club", async (done: any) => {
        const club = await Club.get(get(clubs[0], "output.id"));
        if (club) {
            expect(club.name).toEqual(clubs[0].input.name);
            expect(club.location).toEqual(clubs[0].input.location);
        } else {
            expect(club).not.toBeNull();
        }
        done();
    });

    test("Should update a club", async (done: any) => {
        const club = await Club.update(get(clubs[0], "output.id"), {
            name: "Updated name",
        });
        if (club) {
            expect(club.name).toEqual("Updated name");
            expect(club.location).toEqual(clubs[0].input.location);
        } else {
            expect(club).not.toBeNull();
        }
        done();
    });

    test("Should add a new manager", async (done: any) => {
        const club = await Club.addManager(
            get(clubs[0], "output.id"),
            get(users[3], "output.id")
        );
        if (club) {
            expect(club.managers[2].toString()).toEqual(
                get(users[3], "output.id")
            );
        } else {
            expect(club).not.toBeNull();
        }
        done();
    });

    test("Should remove a manager", async (done: any) => {
        const club = await Club.removeManager(
            get(clubs[0], "output.id"),
            get(users[0], "output.id")
        );
        if (club) {
            expect(club.managers.length).toEqual(1);
            expect(club.managers[0].toString()).toEqual(
                get(users[2], "output.id")
            );
        } else {
            expect(club).not.toBeNull();
        }
        done();
    });

    test("Should add a new member", async (done: any) => {
        const club = await Club.addMember(
            get(clubs[0], "output.id"),
            get(users[3], "output.id")
        );
        if (club) {
            expect(club.members[1].toString()).toEqual(
                get(users[3], "output.id")
            );
        } else {
            expect(club).not.toBeNull();
        }
        done();
    });

    test("Should remove a member", async (done: any) => {
        const club = await Club.removeMember(
            get(clubs[1], "output.id"),
            get(users[0], "output.id")
        );
        if (club) {
            expect(club.members.length).toEqual(0);
        } else {
            expect(club).not.toBeNull();
        }
        done();
    });

    test("Should delete a club", async (done: any) => {
        const clubId = get(clubs[0], "output.id");
        const club = await Club.delete(clubId);
        const checkClubIsDeleted = await Club.get(clubId);
        const exampleManager = await User.get(get(users[0], "output.id"));
        const exampleMember = await User.get(get(users[1], "output.id"));
        if (club) {
            expect(club.id).toEqual(clubId);
            expect(checkClubIsDeleted).toBeNull();
        } else {
            expect(club).not.toBeNull();
        }
        if (exampleManager) {
            const clubInManagerList = exampleManager.clubs.manager.filter(
                (c) => c.id === clubId
            );
            expect(clubInManagerList.length).toEqual(0);
        } else {
            expect(exampleManager).not.toBeNull();
        }
        if (exampleMember) {
            const clubInMemberList = exampleMember.clubs.member.filter(
                (c) => c.id === clubId
            );
            expect(clubInMemberList.length).toEqual(0);
        } else {
            expect(exampleManager).not.toBeNull();
        }
        done();
    });
});
