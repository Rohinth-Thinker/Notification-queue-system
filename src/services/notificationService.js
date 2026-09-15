
const crypto = require("crypto");

const notificationStore = require("../store/notificationStore")
const notificationQueue = require("../queue/notificationQueue")

function createNotificationJob({ userId, message, channel }) {

    const job = {
        jobId: crypto.randomUUID(),
        userId,
        message,
        channel,
        attempt: 0,
        createdAt: new Date().toISOString(),
    }

    notificationStore.incrementQueued(userId);
    notificationQueue.enqueue(job)

    return job;

}

function getStatus(userId) {
    return notificationStore.getStatus(userId);
}

function getAllStatus(userId) {
    return notificationStore.getAllStatus();
}

function getQueueSize() {
    return notificationQueue.getQueueSize();
}

module.exports = {
    createNotificationJob,
    getStatus,
    getAllStatus,
    getQueueSize,
}