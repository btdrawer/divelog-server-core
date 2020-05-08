import cache from "./cache";
import createRedisClient from "./redis";
const mongoose = require("mongoose");

const connect = async () => {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    const db = mongoose.connection;
    console.log("Database connection opened.");
    const redisClient = createRedisClient();
    cache(redisClient);
    console.log("Redis client set up.");

    db.on("error", (err: any) => console.log(err));
    db.on("close", () => {
        console.log("Database connection closed.");
        redisClient.quit();
        console.log("Redis client closed.");
    });

    return { db, redisClient };
};

export default connect;
