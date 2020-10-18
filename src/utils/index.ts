import { Document } from "mongoose";

export const getResourceId = <T extends Document>(doc: T | string): string =>
    doc instanceof Document ? doc.id.toString() : doc.toString();

export { resources, errorCodes, subscriptionKeys } from "./constants";
export { signJwt, hashPassword, comparePassword } from "./authUtils";
export * as seeder from "./seedDatabase";
