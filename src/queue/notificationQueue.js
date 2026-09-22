
const {Queue} = require("bullmq");

const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
}

const notificationQueue = new Queue("notifications", {connection})
// notificationQueue.obliterate({ force: true });

module.exports = {
    notificationQueue,
}