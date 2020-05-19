import getMongooseConnection from "./mongoose";
import { createClient, getQueryWithCache, getClearCache } from "./redis";
import { Connection } from "mongoose";

export default async (): Promise<{
    mongoose: Connection;
    queryWithCache: Function;
    clearCache: Function;
}> => {
    const mongoose = await getMongooseConnection();

    const redisClient = createClient();
    const queryWithCache = getQueryWithCache(redisClient);
    const clearCache = getClearCache(redisClient);
    console.log("Redis client set up.");

    mongoose.on("error", (err: any) => console.log(err));
    mongoose.on("close", () => {
        console.log("Database connection closed.");
        redisClient.quit();
        console.log("Redis client closed.");
    });

    return {
        mongoose,
        queryWithCache,
        clearCache,
    };
};
