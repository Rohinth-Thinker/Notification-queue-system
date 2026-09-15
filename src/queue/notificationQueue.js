
const notificationStore = require("../store/notificationStore")
const {sendNotification, sleep} = require("../services/notificationSender");

const queue = []

let workerStarted = false;

const MAX_ATTEMPTS = 4
const BASE_BACKOFF_MS = 1000

function enqueue(job) {
    queue.push(job)

    console.log(`[QUEUE] Job = ${job.jobId} added | Queue size = ${queue.length}`);
}

async function processJob(job) {
    while (job.attempt < MAX_ATTEMPTS) {
        job.attempt++;
        const attemptStartedAt = Date.now();

        console.log(`[WORKER] Job = ${job.jobId} | Attempt = ${job.attempt}/${MAX_ATTEMPTS}`)

        try {
            await sendNotification(job)
            
            notificationStore.decrementQueued(job.userId);
            notificationStore.incrementSent(job.userId);

            console.log(`[WORKER] Job = ${job.jobId} completed | Duration = ${Date.now() - attemptStartedAt}ms`);
            return

        } catch(error) {
            console.log(`[WORKER] Job = ${job.jobId} failed | ${error.message}`);

            if (job.attempt >= MAX_ATTEMPTS) {
                notificationStore.decrementQueued();
                notificationStore.incrementFailed();

                console.log(`[WORKER] Job = ${job.jobId} permanently failed`);

                return;
            }
            
            const backoffMs = BASE_BACKOFF_MS * Math.pow(2, job.attempt - 1)
            console.log(`[RETRY] Job = ${job.jobId} | Next attempt in ${backoffMs}ms`);
            await sleep(backoffMs);
        }
    }
}

async function worker() {
    console.log(`[WORKER] Started`)

    while (true) {
        if (queue.length === 0) {
            await sleep(100);
            continue;
        }

        const job = queue.shift()
        await processJob(job);
    }
}

function startWorker() {
    if (workerStarted) return;

    workerStarted = true
    worker();
}

function getQueueSize() {
    return queue.length;
}

module.exports = {
    enqueue,
    startWorker,
    getQueueSize
}