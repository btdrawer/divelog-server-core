import { Document, Model } from "mongoose";

export interface IResource<T extends Document, U, V> {
    construct(doc: T): T;
    create(data: U): Promise<T>;
    find(filter?: any, fields?: any, options?: any): Promise<T[]>;
    get(id: string, fields?: string[], populate?: string[]): Promise<T | null>;
    update(id: string, data: V): Promise<T | null>;
    delete(id: string): Promise<T | null>;
}

const resourceFactory = <T extends Document, U, V>(
    model: Model<T, any>,
    additionalRequests?: {
        create?(resource: T): Promise<void>;
        delete?(id: string): Promise<void>;
    }
): IResource<T, U, V> => ({
    construct(doc: T) {
        return new model(doc);
    },

    async create(data: U) {
        const resource = await new model(data).save();
        if (additionalRequests?.create) {
            await additionalRequests.create(resource);
        }
        return resource;
    },

    async find(filter?: any, fields?: string[], options?: any) {
        return model.find(filter, fields, options);
    },

    async get(id: string, fields?: string[], populate?: string[]) {
        const result = await model.findById(id, fields);
        if (populate) {
            await populate.reduce(
                (p: Promise<any>, field: string) =>
                    p.then(() => result.populate(field).execPopulate()),
                Promise.resolve()
            );
        }
        return result;
    },

    async update(id: string, data: V) {
        return model.findByIdAndUpdate(id, data, { new: true });
    },

    async delete(id: string) {
        if (additionalRequests?.delete) {
            await additionalRequests.delete(id);
        }
        return model.findByIdAndDelete(id);
    },
});

export default resourceFactory;
