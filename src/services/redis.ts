const redis = require("redis");
import { promisify } from "util";

const redisClient = () => {
    const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
    const client = redis.createClient(redisUrl);
    client.hget = promisify(client.hget);
    return client;
};

export default redisClient;
