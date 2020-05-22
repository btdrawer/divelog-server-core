import getMongooseConnection from "./mongoose";
import { Connection } from "mongoose";
import { createClient, getQueryWithCache, getClearCache } from "./redis";
import { RedisClient } from "redis";

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
    redisClient: RedisClient;
    cacheFunctions: {
        queryWithCache: Function;
        clearCache: Function;
    };
    closeServices: Function;
}> => {
    const mongoose = await getMongooseConnection();
    console.log("Database connection opened.");

    const redisClient = createClient();
    const queryWithCache = getQueryWithCache(redisClient);
    const clearCache = getClearCache(redisClient);
    console.log("Redis client set up.");

    const closeServices = getCloseServices(mongoose, redisClient);

    return {
        mongoose,
        redisClient,
        cacheFunctions: {
            queryWithCache,
            clearCache,
        },
        closeServices,
    };
};
