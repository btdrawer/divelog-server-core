import { get } from "lodash";
import { connect, disconnect } from "./utils/setup";
import { seedDatabase, users, gear } from "../src/utils/seedDatabase";
import { User, comparePassword } from "../src";

describe("User", () => {
    beforeAll(connect);
    afterAll(disconnect);
    beforeEach(
        seedDatabase({
            gear: true,
        })
    );

    test("Should create a new user", async (done: any) => {
        const user = await User.create({
            name: "Ben",
            username: "ben",
            email: "ben@example.com",
            password: "Password222",
        });
        expect(user.name).toEqual("Ben");
        expect(user.username).toEqual("ben");
        expect(user.email).toEqual("ben@example.com");
        expect(comparePassword("Password222", user.password)).toEqual(true);
        done();
    });

    test("Should fail to create a new user if username is taken", async (done: any) => {
        await expect(
            async () =>
                await User.create({
                    name: "Ben",
                    username: users[0].input.username,
                    email: "ben@example.com",
                    password: "Password222",
                })
        ).rejects.toThrow("A user with that username already exists.");
        done();
    });

    test("Should fail to create a new user if email address is taken", async (done: any) => {
        await expect(
            async () =>
                await User.create({
                    name: "Ben",
                    username: "ben",
                    email: users[0].input.email,
                    password: "Password222",
                })
        ).rejects.toThrow("A user with that email address already exists.");
        done();
    });

    test("Should login with correct credentials", async (done: any) => {
        const user = await User.login(
            users[0].input.username,
            users[0].input.password
        );
        if (user) {
            expect(user.name).toEqual(users[0].input.name);
            expect(user.username).toEqual(users[0].input.username);
            expect(user.email).toEqual(users[0].input.email);
            expect(
                comparePassword(users[0].input.password, user.password)
            ).toEqual(true);
        } else {
            expect(user).not.toBeNull();
        }
        done();
    });

    test("Should fail to login if user is not found", async (done: any) => {
        await expect(
            async () =>
                await User.login("fakeusername", users[0].input.password)
        ).rejects.toThrow("Your username and/or password were incorrect.");
        done();
    });

    test("Should fail to login if password is incorrect", async (done: any) => {
        await expect(
            async () =>
                await User.login(users[0].input.username, "fakepassword")
        ).rejects.toThrow("Your username and/or password were incorrect.");
        done();
    });

    test("Should get a list of users", async (done: any) => {
        const retrievedUsers = await User.find();
        if (retrievedUsers) {
            expect(retrievedUsers.length).toEqual(4);
            const exampleUser = retrievedUsers[0];
            expect(exampleUser.name).toEqual(users[0].input.name);
            expect(exampleUser.username).toEqual(users[0].input.username);
            expect(exampleUser.email).toEqual(users[0].input.email);
        } else {
            expect(retrievedUsers).not.toBeNull();
        }
        done();
    });

    test("Should get a list of users with filter", async (done: any) => {
        const retrievedUsers = await User.find({
            name: users[1].input.name,
        });
        if (retrievedUsers) {
            expect(retrievedUsers.length).toEqual(1);
            const exampleUser = retrievedUsers[0];
            expect(exampleUser.name).toEqual(users[1].input.name);
            expect(exampleUser.username).toEqual(users[1].input.username);
            expect(exampleUser.email).toEqual(users[1].input.email);
        } else {
            expect(retrievedUsers).not.toBeNull();
        }
        done();
    });

    test("Should get a list of users and return only specific fields", async (done: any) => {
        const retrievedUsers = await User.find({}, ["name"]);
        if (retrievedUsers) {
            expect(retrievedUsers.length).toEqual(4);
            const exampleUser = retrievedUsers[0];
            expect(exampleUser.name).toEqual(users[0].input.name);
            expect(exampleUser.username).toBeUndefined();
        } else {
            expect(retrievedUsers).not.toBeNull();
        }
        done();
    });

    test("Should get user by their ID", async (done: any) => {
        const user = await User.get(get(users[0], "output.id"));
        if (user) {
            expect(user.name).toEqual(users[0].input.name);
            expect(user.username).toEqual(users[0].input.username);
            expect(user.email).toEqual(users[0].input.email);
        } else {
            expect(user).not.toBeNull();
        }
        done();
    });

    test("Should populate specified fields", async (done: any) => {
        const user = await User.get(get(users[0], "output.id"), undefined, [
            "gear",
        ]);
        if (user) {
            expect(user.gear.length).toEqual(2);
            const exampleGear = user.gear[0];
            expect(exampleGear).toHaveProperty("name");
            expect(exampleGear).toHaveProperty("model");
            expect(exampleGear).toHaveProperty("brand");
        } else {
            expect(user).not.toBeNull();
        }
        done();
    });

    test("Should update user", async (done: any) => {
        const user = await User.update(get(users[0], "output.id"), {
            name: "New name",
            username: "newusername",
            email: "updated@example.com",
            password: "Updated222",
        });
        if (user) {
            expect(user.name).toEqual("New name");
            expect(user.username).toEqual("newusername");
            expect(user.email).toEqual("updated@example.com");
            expect(comparePassword("Updated222", user.password)).toEqual(true);
        } else {
            expect(user).not.toBeNull();
        }
        done();
    });

    test("Should fail to update user if new username is taken", async (done: any) => {
        await expect(
            async () =>
                await User.update(get(users[0], "output.id"), {
                    name: "New name",
                    username: users[1].input.username,
                    email: "updated@example.com",
                    password: "Updated222",
                })
        ).rejects.toThrow("A user with that username already exists.");
        done();
    });

    test("Should fail to update user if new email address is taken", async (done: any) => {
        await expect(
            async () =>
                await User.update(get(users[0], "output.id"), {
                    name: "New name",
                    username: "new username",
                    email: users[1].input.email,
                    password: "Updated222",
                })
        ).rejects.toThrow("A user with that email address already exists.");
        done();
    });

    test("Should add another user as a friend", async (done: any) => {
        const sender = await User.add(
            get(users[0], "output.id"),
            get(users[1], "output.id")
        );
        const recipient = await User.get(get(users[1], "output.id"));
        if (sender && recipient) {
            expect(sender.id).toEqual(get(users[0], "output.id"));
            expect(sender.friendRequests.sent[0].toString()).toEqual(
                get(users[1], "output.id")
            );
            expect(recipient.friendRequests.inbox[0].toString()).toEqual(
                get(users[0], "output.id")
            );
        } else {
            expect(sender).not.toBeNull();
            expect(recipient).not.toBeNull();
        }
        done();
    });

    test("Should accept another user as a friend", async (done: any) => {
        await User.add(get(users[0], "output.id"), get(users[1], "output.id"));
        const user = await User.accept(
            get(users[1], "output.id"),
            get(users[0], "output.id")
        );
        if (user) {
            expect(user.id).toEqual(get(users[1], "output.id"));
            expect(user.friends[0].toString()).toEqual(
                get(users[0], "output.id")
            );
        } else {
            expect(user).not.toBeNull();
        }
        done();
    });

    test("Should unfriend another user", async (done: any) => {
        await User.add(get(users[0], "output.id"), get(users[1], "output.id"));
        await User.accept(
            get(users[1], "output.id"),
            get(users[0], "output.id")
        );
        const user = await User.unfriend(
            get(users[1], "output.id"),
            get(users[0], "output.id")
        );
        if (user) {
            expect(user.id).toEqual(get(users[1], "output.id"));
            expect(user.friends.length).toEqual(0);
        } else {
            expect(user).not.toBeNull();
        }
        done();
    });

    test("Should delete a user", async (done: any) => {
        const user = await User.delete(get(users[0], "output.id"));
        const checkUserIsDeleted = await User.get(get(users[0], "output.id"));
        if (user) {
            // Delete method should return details of the deleted account
            expect(user.name).toEqual(users[0].input.name);
            expect(user.username).toEqual(users[0].input.username);
            expect(user.email).toEqual(users[0].input.email);
            expect(
                comparePassword(users[0].input.password, user.password)
            ).toEqual(true);
            // But then when retrieved again, it should be null
            expect(checkUserIsDeleted).toBeNull();
        } else {
            expect(user).not.toBeNull();
        }
        done();
    });
});
