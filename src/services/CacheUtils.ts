import { Model } from "mongoose";
import { RedisClient } from "redis";

class CacheUtils {
    redisClient: RedisClient;

    constructor(redisClient: RedisClient) {
        this.redisClient = redisClient;
    }

    queryWithCache = async (
        hashKey: string,
        queryProps: {
            model: Model<any>;
            filter: any;
            fields: any;
            options: any;
        }
    ): Promise<any> => {
        const { model, filter, fields, options } = queryProps;
        if (!hashKey) {
            return model.find(filter, fields, options);
        }
        const key = JSON.stringify({
            filter,
            fields,
            options,
        });
        const cachedData: string = await new Promise((resolve) =>
            this.redisClient.hget(hashKey, key, (err: any, res: string) =>
                resolve(res)
            )
        );
        if (cachedData) {
            const parsedCachedData = JSON.parse(cachedData);
            return Array.isArray(parsedCachedData)
                ? parsedCachedData.map((elem) => new model(elem))
                : new model(parsedCachedData);
        }
        const result = await model.find(filter, fields, options);
        this.redisClient.hset(hashKey, key, JSON.stringify(result));
        return result;
    };

    clearCache = (hashKey: string): void => {
        this.redisClient.del(hashKey);
    };
}

export default CacheUtils;
