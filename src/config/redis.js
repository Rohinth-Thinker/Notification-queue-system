
const { createClient } = require("redis");
const logger = require("../utils/logger")

const redis = createClient({
    url: process.env.REDIS_URL || 
    `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
})

redis.on("error", (error) => {
    logger.error("Redis error", {error: error.message});
})

async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect()
    }
}

module.exports = {
    redis,
    connectRedis,
}