const redis = require("redis");
import { promisify } from "util";

const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
const redisClient = redis.createClient(redisUrl);

redisClient.hget = promisify(redisClient.hget);

export default redisClient;
