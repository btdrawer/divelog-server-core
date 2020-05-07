import cache from "./cache";
import createRedisClient from "./redis";
const mongoose = require("mongoose");

const connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    const db = mongoose.connection;
    const redisClient = createRedisClient();

    db.on("open", () => {
        console.log("Database connection opened.");
        cache(redisClient);
    });
    db.on("error", (err: any) => console.log(err));
    db.on("close", () => {
        console.log("Database connection closed.");
        redisClient.quit();
    });

    return { db, redisClient };
};

export default connect;
