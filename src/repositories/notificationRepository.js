const crypto = require("crypto");
const {pool} = require("../config/postgres")

async function createNotificationWithOutbox(notification) {
    const client = await pool.connect();
    
    try {

        client.query("BEGIN");

        const notificationQuery = `
            INSERT INTO notifications (id, user_id, message, channel)
            VALUES ($1, $2, $3, $4) RETURNING *
        `

        await client.query(notificationQuery, [
            notification.jobId,
            notification.userId,
            notification.message,
            notification.channel,
        ])

        const outboxQuery = `
            INSERT INTO notification_outbox (id, notification_id)
            VALUES ($1, $2)
        `

        await client.query(outboxQuery, [crypto.randomUUID(), notification.jobId])

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK")
        throw err;
    } finally {
        client.release()
    }
}

async function markSent(id, attempts) {
    const query = `
        UPDATE notifications SET
        status = 'sent', attempts = $2, sent_at = CURRENT_TIMESTAMP
        WHERE id = $1
    `

    await pool.query(query, [id, attempts])
}

async function markFailed(id, attempts) {
    const query = `
        UPDATE notifications SET
        status = 'failed', attempts = $2, failed_at = CURRENT_TIMESTAMP
        WHERE id = $1
    `

    await pool.query(query, [id, attempts])
}

async function getNotificationsByUser(userId) {
    const query = `
        SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
    `

    const result = await pool.query(query, [userId]);
    return result.rows;
}

module.exports = {
    createNotificationWithOutbox,
    markSent,
    markFailed,
    getNotificationsByUser,
}