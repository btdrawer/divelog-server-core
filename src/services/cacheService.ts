import Redis, { Redis as RedisClient } from "ioredis";
import { IResource } from "../models";

class CacheService {
    redisClient: RedisClient;

    constructor() {
        this.redisClient = new Redis(
            `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
        );
    }

    queryWithCache = async (
        hashKey: string,
        queryProps: {
            model: IResource<any, any, any>;
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
            this.redisClient.hget(
                hashKey,
                key,
                (err: Error | null, res: string | null) => resolve(<string>res)
            )
        );
        if (cachedData) {
            const parsedCachedData = JSON.parse(cachedData);
            return Array.isArray(parsedCachedData)
                ? parsedCachedData.map((elem) => model.construct(elem))
                : model.construct(parsedCachedData);
        }
        const result = await model.find(filter, fields, options);
        this.redisClient.hset(hashKey, key, JSON.stringify(result));
        return result;
    };

    clearCache = (hashKey: string): void => {
        this.redisClient.del(hashKey);
    };
}

export default CacheService;
