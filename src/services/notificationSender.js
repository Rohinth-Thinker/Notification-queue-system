
async function sleep(ms) {
    return await new Promise((resolve) => setTimeout(resolve, ms))
}

async function sendNotification(job) {
    console.log(`[SEND] Job = ${job.jobId} | User=${job.userId} | Channel = ${job.channel} | Attempt = ${job.attempt}`);

    await sleep(500);

    const shouldFail = process.env.FORCE_SEND_FAILURE === "true" || Math.random() < 0.2;

    if (shouldFail) {
        throw new Error("Simulated notification send failure");
    }

    console.log(`[SUCCESS] Job = ${job.jobId}`)

    return true
}

module.exports = {
    sendNotification,
    sleep
}