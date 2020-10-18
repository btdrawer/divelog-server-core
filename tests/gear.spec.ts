import { get } from "lodash";
import { connect, disconnect } from "./utils/setup";
import { seedDatabase, users, gear } from "../src/utils/seedDatabase";
import { Gear, User } from "../src";

describe("Gear", () => {
    beforeAll(connect);
    afterAll(disconnect);
    beforeEach(
        seedDatabase({
            gear: true,
        })
    );

    test("Should create new gear", async (done: any) => {
        const gear = await Gear.create({
            name: "A",
            model: "B",
            brand: "C",
            type: "D",
            owner: get(users[0], "output.id"),
        });
        const owner = await User.get(get(users[0], "output.id"));
        expect(gear.name).toEqual("A");
        expect(gear.model).toEqual("B");
        expect(gear.brand).toEqual("C");
        expect(gear.type).toEqual("D");
        expect(gear.owner.toString()).toEqual(get(users[0], "output.id"));
        if (owner) {
            expect(owner.gear.length).toEqual(3);
            expect(owner.gear[2].toString()).toEqual(gear.id);
        } else {
            expect(owner).not.toBeNull();
        }
        done();
    });

    test("Should get a list of gear", async (done: any) => {
        const retrievedGear = await Gear.find();
        if (retrievedGear) {
            expect(retrievedGear.length).toEqual(3);
            const exampleGear = retrievedGear[0];
            expect(exampleGear.name).toEqual(gear[0].input.name);
            expect(exampleGear.model).toEqual(gear[0].input.model);
            expect(exampleGear.brand).toEqual(gear[0].input.brand);
            expect(exampleGear.type).toEqual(gear[0].input.type);
        } else {
            expect(retrievedGear).not.toBeNull();
        }
        done();
    });

    test("Should get a list of clubs with filter", async (done: any) => {
        const retrievedGear = await Gear.find({
            name: gear[1].input.name,
        });
        if (retrievedGear) {
            expect(retrievedGear.length).toEqual(1);
            const exampleGear = retrievedGear[0];
            expect(exampleGear.name).toEqual(gear[1].input.name);
            expect(exampleGear.model).toEqual(gear[1].input.model);
            expect(exampleGear.brand).toEqual(gear[1].input.brand);
            expect(exampleGear.type).toEqual(gear[1].input.type);
        } else {
            expect(retrievedGear).not.toBeNull();
        }
        done();
    });

    test("Should get a list of clubs and return only specific fields", async (done: any) => {
        const retrievedGear = await Gear.find({}, ["name"]);
        if (retrievedGear) {
            expect(retrievedGear.length).toEqual(3);
            const exampleGear = retrievedGear[0];
            expect(exampleGear.name).toEqual(gear[0].input.name);
            expect(exampleGear.model).toBeUndefined();
        } else {
            expect(retrievedGear).not.toBeNull();
        }
        done();
    });

    test("Should get a single item of gear", async (done: any) => {
        const retrievedGear = await Gear.get(get(gear[0], "output.id"));
        if (retrievedGear) {
            expect(retrievedGear.name).toEqual(gear[0].input.name);
            expect(retrievedGear.model).toEqual(gear[0].input.model);
            expect(retrievedGear.brand).toEqual(gear[0].input.brand);
            expect(retrievedGear.type).toEqual(gear[0].input.type);
        } else {
            expect(retrievedGear).not.toBeNull();
        }
        done();
    });

    test("Should populate specified fields", async (done: any) => {
        const retrievedGear = await Gear.get(get(gear[0], "output.id"), [
            "owner",
        ]);
        if (retrievedGear) {
            const { owner } = retrievedGear;
            expect(owner).toHaveProperty("name");
            expect(owner).toHaveProperty("username");
            expect(owner).toHaveProperty("email");
        } else {
            expect(retrievedGear).not.toBeNull();
        }
        done();
    });

    test("Should update gear", async (done: any) => {
        const updatedGear = await Gear.update(get(gear[0], "output.id"), {
            name: "Updated name",
        });
        if (updatedGear) {
            expect(updatedGear.name).toEqual("Updated name");
        } else {
            expect(updatedGear).not.toBeNull();
        }
        done();
    });

    test("Should delete gear", async (done: any) => {
        const gearId = get(gear[0], "output.id");
        const deletedGear = await Gear.delete(gearId);
        const checkGearIsDeleted = await Gear.get(gearId);
        const owner = await User.get(get(gear[0], "output.owner"));
        if (deletedGear && owner) {
            expect(deletedGear.name).toEqual(get(gear[0], "input.name"));
            expect(checkGearIsDeleted).toBeNull();
            expect(owner.gear.length).toEqual(1);
        } else {
            expect(deletedGear).not.toBeNull();
            expect(owner).not.toBeNull();
        }
        done();
    });
});
