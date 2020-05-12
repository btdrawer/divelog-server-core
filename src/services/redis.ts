import { promisify } from "util";
import redis from "redis";

const redisClient = (): any => {
    const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
    const client = redis.createClient(redisUrl);
    return {
        ...client,
        hget: promisify(client.hget),
    };
};

export default redisClient;
