
const crypto = require("crypto");

const { notificationQueue } = require("../queue/notificationQueue");
const notificationRepository = require("../repositories/notificationRepository");

async function createNotificationJob({ userId, message, channel }) {

    const job = {
        jobId: crypto.randomUUID(),
        userId,
        message,
        channel,
        createdAt: new Date().toISOString(),
    }

    await notificationRepository.createNotificationWithOutbox(job);

    // await notificationQueue.add("send-notification", job, {
    //     attempts: 4,
    //     backoff: {
    //         type: "exponential",
    //         delay: 1000,
    //     },

    //     removeOnComplete: true,
    //     removeOnFail: false,
    // })

    return job;

}

function getStatus(userId) {
    return notificationRepository.getNotificationsByUser(userId);
}

async function getQueueSize() {
    const counts = await notificationQueue.getJobCounts("waiting", "active", "delayed")
    return counts.waiting + counts.active + counts.delayed
}

module.exports = {
    createNotificationJob,
    getStatus,
    getQueueSize,
}