import { Model } from "mongoose";
import { RedisClient } from "redis";

export interface CacheUtils {
    queryWithCache: Function;
    clearCache: Function;
}

const getQueryWithCache = (redisClient: RedisClient) => async (
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
        const parsedCachedData = JSON.parse(cachedData);
        return Array.isArray(parsedCachedData)
            ? parsedCachedData.map((elem) => new model(elem))
            : new model(parsedCachedData);
    }
    const result = await model.find(filter, fields, options);
    redisClient.hset(hashKey, key, JSON.stringify(result));
    return result;
};

const getClearCache = (redisClient: RedisClient) => (hashKey: string) =>
    redisClient.del(hashKey);

const getCacheUtils = (redisClient: RedisClient): CacheUtils => ({
    queryWithCache: getQueryWithCache(redisClient),
    clearCache: getClearCache(redisClient),
});

export default getCacheUtils;
