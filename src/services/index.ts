import getMongooseConnection from "./mongoose";
import { createClient, getQueryWithCache, getClearCache } from "./redis";
import { Connection } from "mongoose";

export const getCloseServices = (
    mongoose: Connection,
    redisClient: any
) => async (): Promise<any> => {
    mongoose.close();

    redisClient.quit();
    console.log("Redis client closed.");

    return undefined;
};

export const launchServices = async (): Promise<{
    cacheFunctions: {
        queryWithCache: Function;
        clearCache: Function;
    };
    closeServices: Function;
}> => {
    const mongoose = await getMongooseConnection();

    const redisClient = createClient();
    const queryWithCache = getQueryWithCache(redisClient);
    const clearCache = getClearCache(redisClient);
    console.log("Redis client set up.");

    const closeServices = getCloseServices(mongoose, redisClient);

    return {
        cacheFunctions: {
            queryWithCache,
            clearCache,
        },
        closeServices,
    };
};
