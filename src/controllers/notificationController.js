const rateLimiter = require("../services/rateLimiter");
const { createNotificationJob, getStatus, getAllStatus, getQueueSize } = require("../services/notificationService");

function createNotification(req, res) {
    const {userId, message, channel} = req.body;

    if (!rateLimiter.isAllowed(userId)) {
        return res.status(429).json({
            error: "Rate limit exceed",
            message: "Maximum 5 notifications per user per minute",
            limit: rateLimiter.RATE_LIMIT,
            windowSeconds: rateLimiter.WINDOW_MS / 1000
        })
    }

    const job = createNotificationJob({userId, message, channel});

    return res.status(202).json({
        jobId: job.jobId,
        status: "queued",
        userId: job.userId,
        channel: job.channel,
    })
}

function getNotificationStatus(req, res) {
    const {userId} = req.query;

    if (userId) {
        return res.json({userId, ...getStatus(userId), rateLimitRemaining: rateLimiter.getRemainingRequests(userId)});
    }

    return res.json({queueSize: getQueueSize(), users: getAllStatus()})
}

module.exports = {
    createNotification,
    getNotificationStatus,
}