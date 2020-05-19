import { promisify } from "util";
import { Model } from "mongoose";
const redis = require("redis");

export const createClient = (): any => {
    const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
    const client = redis.createClient(redisUrl);
    client.hget = promisify(client.hget);
    return client;
};

export const getQueryWithCache = (redisClient: any) => async (
    useCache: boolean,
    hashKey: string,
    queryProps: { model: Model<any>; filter: any; fields: any; options: any }
): Promise<any> => {
    const { model, filter, fields, options } = queryProps;
    if (!useCache) {
        return model.find(filter, fields, options);
    }
    const key = JSON.stringify({
        filter,
        fields,
        options,
    });
    const cachedData = await redisClient.hget(hashKey, key);
    if (cachedData) {
        return JSON.parse(cachedData);
    }
    const result = await model.find(filter, fields, options);
    redisClient.hset(hashKey, key, JSON.stringify(result));
    return result;
};

export const getClearCache = (redisClient: any) => (hashKey: string) =>
    redisClient.del(hashKey);
