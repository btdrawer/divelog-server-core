import redis, { RedisClient } from "redis";
import CacheUtils from "./CacheUtils";

class CacheService {
    redisClient: RedisClient;
    cacheUtils: CacheUtils;

    constructor() {
        this.redisClient = this.createClient();
        this.cacheUtils = new CacheUtils(this.redisClient);
    }

    private createClient(): RedisClient {
        return redis.createClient(
            `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
        );
    }
}

export default CacheService;
