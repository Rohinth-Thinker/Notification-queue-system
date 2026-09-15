
const users = new Map()

function ensureUser(userId) {
    if (!users.has(userId)) {
        users.set(userId, { queued: 0, sent: 0, failed: 0 })
    }
    return users.get(userId);
}

function incrementQueued(userId) {
    const user = ensureUser(userId)
    user.queued++;
}

function decrementQueued(userId) {
    const user = ensureUser(userId)
    if (user.queued > 0) {
        user.queued--;
    }
}

function incrementSent(userId) {
    const user = ensureUser(userId)
    user.sent++;
}

function incrementFailed(userId) {
    const user = ensureUser(userId)
    user.failed++;
}

function getStatus(userId) {
    return users.get(userId) || { queued: 0, sent: 0, failed: 0 };
}

function getAllStatus() {
    return Object.fromEntries(users);
}

module.exports = {
    incrementQueued,
    decrementQueued,
    incrementSent,
    incrementFailed,
    getStatus,
    getAllStatus
}