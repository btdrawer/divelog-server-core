import redis, { RedisClient } from "redis";
import getCacheUtils, { CacheUtils } from "../utils/cacheUtils";

export interface CacheService {
    redisClient: RedisClient;
    cacheUtils: CacheUtils;
}

const createClient = (): RedisClient =>
    redis.createClient(
        `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    );

const getCacheService = (): CacheService => {
    const redisClient = createClient();
    return {
        redisClient,
        cacheUtils: getCacheUtils(redisClient),
    };
};

export default getCacheService;
