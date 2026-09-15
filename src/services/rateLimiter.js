
const requests = new Map();

const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;

function removeExpiredRequests(userId, now) {
    const timestamps = requests.get(userId) || []

    const validTimestamps = timestamps.filter((timestamp) => now - timestamp < WINDOW_MS)

    requests.set(userId, validTimestamps)

    return validTimestamps;
}

function isAllowed(userId) {
    const now = Date.now()

    const timestamps = removeExpiredRequests(userId, now)

    if (timestamps.length >= RATE_LIMIT) return false

    timestamps.push(now)

    return true
}

function getRemainingRequests(userId) {
    const now = Date.now()

    const timestamps = removeExpiredRequests(userId, now)

    return Math.max(0, RATE_LIMIT - timestamps.length);
}

module.exports = {
    isAllowed,
    getRemainingRequests,
    RATE_LIMIT,
    WINDOW_MS
}