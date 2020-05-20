import { Model } from "mongoose";
import redis, { RedisClient } from "redis";

export const createClient = (): RedisClient => {
    const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
    const client = redis.createClient(redisUrl);
    return client;
};

export const getQueryWithCache = (redisClient: RedisClient) => async (
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
    const cachedData: string = await new Promise((resolve) =>
        redisClient.hget(hashKey, key, (err: any, res: string) => resolve(res))
    );
    if (cachedData) {
        return JSON.parse(cachedData);
    }
    const result = await model.find(filter, fields, options);
    redisClient.hset(hashKey, key, JSON.stringify(result));
    return result;
};

export const getClearCache = (redisClient: RedisClient) => (hashKey: string) =>
    redisClient.del(hashKey);
