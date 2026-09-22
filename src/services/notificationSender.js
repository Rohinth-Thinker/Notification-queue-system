
const logger = require("../utils/logger");

async function sleep(ms) {
    return await new Promise((resolve) => setTimeout(resolve, ms))
}

async function sendNotification(job) {
    logger.info("Send job", {service: "notification-sender", jobId: job.data.id, userId: job.data.userId, channel: job.data.channel, attempt: job.attemptsMade + 1})

    await sleep(500);

    const shouldFail = process.env.FORCE_SEND_FAILURE === "true" || Math.random() < 0.2;

    if (shouldFail) {
        throw new Error("Simulated notification send failure");
    }

    logger.info("Job success", {service: "notification-sender", jobId: job.data.id, userId: job.data.userId, channel: job.data.channel, attempt: job.attemptsMade + 1});

    return true
}

module.exports = {
    sendNotification,
    sleep
}