import mongoose, { Connection } from "mongoose";
import CacheService from "./cacheService";

class Services {
    mongoose: Connection;
    cache: CacheService;

    constructor(mongoose: Connection, cache: CacheService) {
        this.mongoose = mongoose;
        this.cache = cache;
    }

    private static async getMongooseConnection(): Promise<Connection> {
        await mongoose.connect(<string>process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        const { connection } = mongoose;
        connection.on("error", (err: any) => console.log(err));
        return connection;
    }

    static async launchServices(): Promise<Services> {
        const mongoose = await this.getMongooseConnection();
        const cache = new CacheService();
        return new Services(mongoose, cache);
    }

    closeServices = async (): Promise<any> => {
        this.mongoose.close();
        console.log("Database connection closed.");
        this.cache.redisClient.quit();
        console.log("Redis client closed.");
        return undefined;
    };
}

export default Services;
