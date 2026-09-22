
const {redis} = require("../config/redis");

const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;

const rateLimiterScript = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])

    redis.call("ZREMRANGEBYSCORE", key, 0, now - window)

    local count = redis.call("ZCARD", key)

    if count >= limit then
        return 0
    end

    redis.call("ZADD", key, now, ARGV[4])
    
    redis.call("EXPIRE", key, 60)
    
    return 1
`

async function isAllowed(userId) {
    const now = Date.now()
    const key = `rate_limit${userId}`
    const value = `${now} - ${Math.random()}`

    const result = await redis.eval(rateLimiterScript, {
        keys: [key],
        arguments: [String(now), String(WINDOW_MS), String(RATE_LIMIT), value]
    })

    return result == 1

}

async function removeExpiredRequests(userId, now) {
    const key = `rate_limit:${userId}`
    await redis.zRemRangeByScore(key, 0, now - WINDOW_MS )
    return key;
}

async function getRemainingRequests(userId) {
    const now = Date.now()
    const key = await removeExpiredRequests(userId, now)
    const count = await redis.zCard(key)

    return Math.max(0, RATE_LIMIT - count);
}

module.exports = {
    isAllowed,
    getRemainingRequests,
    RATE_LIMIT,
    WINDOW_MS
}