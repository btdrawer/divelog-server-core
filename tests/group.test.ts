import { get } from "lodash";
import { connect, disconnect } from "./utils/setup";
import { seedDatabase, users, groups } from "../src/utils/seedDatabase";
import { Group } from "../src";

describe("Group", () => {
    beforeAll(connect);
    afterAll(disconnect);
    beforeEach(
        seedDatabase({
            groups: true,
        })
    );

    test("Should create a new group", async () => {
        const group = await Group.create({
            name: "New group",
            participants: [
                get(users[0], "output.id"),
                get(users[1], "output.id"),
            ],
            messages: [
                {
                    text: "First message",
                    sender: get(users[1], "output.id"),
                },
            ],
        });
        expect(group.name).toEqual("New group");
        expect(group.participants[0].toString()).toEqual(
            get(users[0], "output.id")
        );
        expect(group.participants[1].toString()).toEqual(
            get(users[1], "output.id")
        );
        expect(group.messages[0].text).toEqual("First message");
        expect(group.messages[0].sender.toString()).toEqual(
            get(users[1], "output.id")
        );
    });

    test("Should get a list of groups", async (done: any) => {
        const retrievedGroups = await Group.find();
        if (retrievedGroups) {
            expect(retrievedGroups.length).toEqual(3);
            const exampleGroup = retrievedGroups[0];
            expect(exampleGroup.name).toEqual(groups[0].input.name);
            expect(exampleGroup.participants[0]).toEqual(
                get(groups[0], "output.participants[0]")
            );
            expect(exampleGroup.messages[0].text).toEqual(
                groups[0].input.messages[0].text
            );
        } else {
            expect(retrievedGroups).not.toBeNull();
        }
        done();
    });

    test("Should get a list of users with filter", async (done: any) => {
        const retrievedGroups = await Group.find({
            name: groups[1].input.name,
        });
        if (retrievedGroups) {
            expect(retrievedGroups.length).toEqual(1);
            const exampleGroup = retrievedGroups[0];
            expect(exampleGroup.name).toEqual(groups[1].input.name);
            expect(exampleGroup.participants[0]).toEqual(
                get(groups[1], "output.participants[0]")
            );
            expect(exampleGroup.messages[0].text).toEqual(
                groups[1].input.messages[0].text
            );
        } else {
            expect(retrievedGroups).not.toBeNull();
        }
        done();
    });

    test("Should get a list of users and return only specific fields", async (done: any) => {
        const retrievedGroups = await Group.find({}, ["name"]);
        if (retrievedGroups) {
            expect(retrievedGroups.length).toEqual(3);
            const exampleGroup = retrievedGroups[0];
            expect(exampleGroup.name).toEqual(groups[0].input.name);
            expect(exampleGroup.participants).toBeUndefined();
        } else {
            expect(retrievedGroups).not.toBeNull();
        }
        done();
    });

    test("Should get a group by ID", async (done: any) => {
        const group = await Group.get(get(groups[0], "output.id"));
        if (group) {
            expect(group.name).toEqual(groups[0].input.name);
            expect(group.participants[0]).toEqual(
                get(groups[0], "output.participants[0]")
            );
            expect(group.messages[0].text).toEqual(
                groups[0].input.messages[0].text
            );
        } else {
            expect(group).not.toBeNull();
        }
        done();
    });

    test("Should update a group", async (done: any) => {
        const group = await Group.update(get(groups[0], "output.id"), {
            name: "Updated group",
        });
        if (group) {
            expect(group.name).toEqual("Updated group");
        } else {
            expect(group).not.toBeNull();
        }
        done();
    });

    test("Should add a user", async (done: any) => {
        const group = await Group.addUser(
            get(groups[0], "output.id"),
            get(users[3], "output.id")
        );
        if (group) {
            expect(group.name).toEqual(groups[0].input.name);
            expect(group.participants.length).toEqual(3);
            expect(group.participants[2].toString()).toEqual(
                get(users[3], "output.id")
            );
        } else {
            expect(group).not.toBeNull();
        }
        done();
    });

    test("Should not add a user if they are already a member", async (done: any) => {
        await expect(
            async () =>
                await Group.addUser(
                    get(groups[0], "output.id"),
                    get(groups[0], "output.participants[0]")
                )
        ).rejects.toThrow("That user is already present in the group.");
        done();
    });

    test("Should remove a user", async (done: any) => {
        const group = await Group.removeUser(
            get(groups[0], "output.id"),
            get(groups[0], "output.participants[0]")
        );
        if (group) {
            expect(group.name).toEqual(groups[0].input.name);
            expect(group.participants.length).toEqual(1);
        } else {
            expect(group).not.toBeNull();
        }
        done();
    });

    test("Should not remove a user if they are not a member", async (done: any) => {
        await expect(
            async () =>
                await Group.removeUser(
                    get(groups[0], "output.id"),
                    get(users[3], "output.id")
                )
        ).rejects.toThrow("That user is not a member.");
        done();
    });

    test("Should send a message", async (done: any) => {
        const group = await Group.sendMessage(get(groups[0], "output.id"), {
            text: "New message",
            sender: get(groups[0], "output.participants[0]"),
        });
        if (group) {
            expect(group.messages.length).toEqual(2);
            expect(group.messages[1].text).toEqual("New message");
            expect(group.messages[1].sender).toEqual(
                get(groups[0], "output.participants[0]")
            );
        } else {
            expect(group).not.toBeNull();
        }
        done();
    });

    test("Should delete a group", async (done: any) => {
        const groupId = get(groups[0], "output.id");
        const group = await Group.delete(groupId);
        const checkGroupIsDeleted = await Group.get(groupId);
        if (group) {
            expect(group.id).toEqual(get(groups[0], "output.id"));
            expect(checkGroupIsDeleted).toBeNull();
        } else {
            expect(group).not.toBeNull();
        }
        done();
    });
});
