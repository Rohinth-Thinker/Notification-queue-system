const { Queue } = require("bullmq");

const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
};

const notificationQueue = new Queue("notifications", {
    connection,
});

async function main() {
    const counts = await notificationQueue.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed"
    );

    console.log(counts);

    await notificationQueue.close();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});