
const { Worker } = require("bullmq");
const { sendNotification } = require("../services/notificationSender");
const notificationRepository = require("../repositories/notificationRepository");
const logger = require("../utils/logger");

const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
};

const notificationWorker = new Worker(
    "notifications",
    async (job) => {
        logger.info("Processing job", {service: "notification-worker", jobId: job.id, attempt: job.attemptsMade + 1});

        await sendNotification(job)
    },
    {
        connection,
        concurrency: 10,
    }
)

notificationWorker.on("completed", async (job) => {
    logger.info("Job completed", {service: "notification-worker", jobId: job.id});
    await notificationRepository.markSent(job.data.jobId, job.attemptsMade)
})

notificationWorker.on("failed", async (job, error) => {
    logger.error("Job failed", {service: "notification-worker", jobId: job?.id, error: error.message});

    if (job && job.attemptsMade >= job.opts.attempts) {
        await notificationRepository.markFailed(job.data.jobId, job.attemptsMade);
        logger.error("Job permanently failed", {service: "notification-worker", jobId: job?.id, error: error.message});
    }
})

async function shutdown(signal) {
    logger.info("Graceful shutdown started", {service: "notification-worker", signal,});

    try {
        await notificationWorker.close();

        logger.info("Worker closed", {service: "notification-worker", signal,});

        logger.info("Graceful shutdown completed", {service: "notification-worker", signal,});

        process.exit(0);
    } catch (err) {
        logger.error("Shutdown failed", {service: "notification-worker", signal, error: err.message});
        process.exit(1);
    }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

logger.info("Notification worker started", {service: "notification-worker",});