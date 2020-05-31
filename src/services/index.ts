import { Connection } from "mongoose";
import { RedisClient } from "redis";
import getMongooseConnection from "./mongoose";
import getCacheService, { CacheService } from "./cacheService";

export const getCloseServices = (
    mongoose: Connection,
    redisClient: RedisClient
) => async (): Promise<any> => {
    mongoose.close();
    console.log("Database connection closed.");

    redisClient.quit();
    console.log("Redis client closed.");

    return undefined;
};

export const launchServices = async (): Promise<{
    mongoose: Connection;
    cache: CacheService;
    closeServices: Function;
}> => {
    const mongoose = await getMongooseConnection();
    console.log("Database connection opened.");

    const cache = getCacheService();
    console.log("Redis client set up.");

    const closeServices = getCloseServices(mongoose, cache.redisClient);

    return {
        mongoose,
        cache,
        closeServices,
    };
};
