const { Queue } = require("bullmq");

const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
};

const notificationQueue = new Queue("notifications", {
    connection,
});

async function main() {
    const failedJobs = await notificationQueue.getJobs(
        ["failed"],
        0,
        20
    );

    console.log(`Found ${failedJobs.length} failed jobs\n`);

    for (const job of failedJobs) {
        console.log("=================================");
        console.log("Job ID:", job.id);
        console.log("Name:", job.name);
        console.log("Data:", job.data);
        console.log("Attempts made:", job.attemptsMade);
        console.log("Failed reason:", job.failedReason);
        console.log("Stacktrace:", job.stacktrace);
        console.log("=================================\n");
    }

    await notificationQueue.close();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});