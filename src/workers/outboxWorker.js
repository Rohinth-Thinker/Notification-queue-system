
const { pool } = require("../config/postgres");
const { notificationQueue } = require("../queue/notificationQueue");
const logger = require("../utils/logger");

async function processOutbox() {
    const client = await pool.connect()

    try {

        const query = `
            SELECT o.id, o.notification_id, n.user_id, n.message, n.channel, n.created_at
            FROM notification_outbox o JOIN notifications n ON n.id = o.notification_id
            WHERE o.processed_at IS NULL
            ORDER BY o.created_at
            LIMIT 10
        `

        const result = await client.query(query);

        for (const row of result.rows) {
            await notificationQueue.add(
                "send-notification",
                {jobId: row.notification_id, userId: row.user_id, message: row.message, channel: row.channel, createdAt: row.created_at},
                {jobId: row.notification_id, attempts: 4, backoff: {type: "exponential", delay: 1000}, removeOnComplete: true, removeOnFail: false},
            )

            await client.query(
                `
                UPDATE notification_outbox
                SET processed_at = CURRENT_TIMESTAMP
                WHERE id = $1    
                `,
                [row.id]
            )

            logger.info("Notification published", {service: "outbox-worker", notificationId: row.notification_id});
        }
    } catch (err) {
        logger.error("Outbox processing failed", {service: "outbox-worker", error: err.message,});
    }finally {
        client.release();
    }
}

const interval = setInterval(processOutbox, 1000)

async function shutdown(signal) {
    logger.info("Graceful shutdown started", {service: "outbox-worker", signal,});
    clearInterval(interval);

    try {
        await pool.end();
        logger.info("Postgres pool closed", {service: "outbox-worker", signal,});

        logger.info("Graceful shutdown completed", {service: "outbox-worker", signal,});
        process.exit(0);
    } catch (err) {
        logger.error("Shutdown failed", {service: "outbox-worker", signal, error: err.message});
        process.exit(1);
    }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));


logger.info("Outbox worker started", {service: "outbox-worker",});
processOutbox();