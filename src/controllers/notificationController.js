const rateLimiter = require("../services/rateLimiter");
const notificationService = require("../services/notificationService");

async function createNotification(req, res) {
    const {userId, message, channel} = req.body;

    if (!(await rateLimiter.isAllowed(userId))) {
        return res.status(429).json({
            error: "Rate limit exceed",
            message: "Maximum 5 notifications per user per minute",
            limit: rateLimiter.RATE_LIMIT,
            windowSeconds: rateLimiter.WINDOW_MS / 1000
        })
    }

    const job = await notificationService.createNotificationJob({userId, message, channel});

    return res.status(202).json({
        jobId: job.jobId,
        status: "queued",
        userId: job.userId,
        channel: job.channel,
    })
}

async function getNotificationStatus(req, res) {
    try {
        const {userId} = req.query;

        if (!userId) {
            return res.status(400).json({error: "userId is required"});
        }

        const notifications = await notificationService.getStatus(userId)

        return res.status(200).json({userId, notifications})
    } catch (err) {
        console.log("Error at getNotificationStatus controller ", err.message, err, );
    }
}

module.exports = {
    createNotification,
    getNotificationStatus,
}