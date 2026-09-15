
# Rate-Limited Notification Queue

A backend service built with **Node.js and Express.js** that accepts notification jobs, enforces a per-user rate limit, processes notifications asynchronously using an in-memory queue, and automatically retries failed notifications using exponential backoff.

This project was built as part of the **Digiryte Technical Challenge - Challenge 1**.

---

## Features

* REST API using Express.js
* `POST /notify` for creating notification jobs
* Supports `email`, `sms`, and `push` channels
* Request validation using Zod
* Per-user rate limiting
* Maximum **5 notifications per user per minute**
* Sliding-window rate limiting
* In-memory FIFO notification queue
* Single background worker
* Simulated notification sending
* Approximately **20% random failure rate**
* Automatic retry on failed sends
* Exponential backoff: `1s → 2s → 4s`
* Maximum **4 attempts** per notification
* `GET /status` for inspecting queue and notification state
* Centralized error handling
* No database required

---

## Tech Stack

* **Node.js**
* **Express.js**
* **JavaScript**
* **Zod**

Development/testing tools used during development:

* Postman / cURL

---

## Project Structure

```text
notification-queue/
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── routes/
│   │   └── notificationRoutes.js
│   │
│   ├── controllers/
│   │   └── notificationController.js
│   │
│   ├── services/
│   │   ├── notificationService.js
│   │   ├── rateLimiter.js
│   │   └── notificationSender.js
│   │
│   ├── queue/
│   │   └── notificationQueue.js
│   │
│   ├── store/
│   │   └── notificationStore.js
│   │
│   ├── utils/
│   │   └── validation.js
│   │
│   └── middleware/
│       └── errorHandler.js
│
├── package.json
├── README.md
└── .gitignore
```

---

# Getting Started

## Prerequisites

Make sure you have Node.js and npm installed.

Check:

```bash
node --version
npm --version
```

---

## Installation

Clone the repository and install the dependencies:

```bash
npm install
```

---

## Running the Application

### Development

```bash
npm run dev
```

### Normal start

```bash
npm start
```

The server runs on:

```text
http://localhost:3000
```

When the server starts, the background worker also starts.

Example:

```text
[WORKER] Started
Server running on http://localhost:3000
```

---

# API Endpoints

## 1. Health Check

```http
GET /health
```

Example:

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "ok"
}
```

---

# 2. Create Notification

```http
POST /notify
```

### Request Body

```json
{
  "userId": "user-123",
  "message": "Hello!",
  "channel": "email"
}
```

### Supported Channels

```text
email
sms
push
```

### Successful Response

The notification is added to the queue and the API immediately returns:

```text
202 Accepted
```

Example:

```json
{
  "jobId": "generated-job-id",
  "status": "queued",
  "userId": "user-123",
  "channel": "email"
}
```

The notification is then processed asynchronously by the background worker.

---

# 3. Rate Limiting

The service allows a maximum of:

```text
5 notifications per user per 60 seconds
```

The rate limiter uses a **sliding window**.

For example:

```text
user-123 → Request 1 ✓
user-123 → Request 2 ✓
user-123 → Request 3 ✓
user-123 → Request 4 ✓
user-123 → Request 5 ✓
user-123 → Request 6 ✗
```

The sixth request returns:

```text
429 Too Many Requests
```

Example response:

```json
{
  "error": "Rate limit exceeded",
  "message": "Maximum 5 notifications per user per minute",
  "limit": 5,
  "windowSeconds": 60
}
```

The rate limit is maintained independently for each user.

For example:

```text
user-123 → 5 requests ✓
user-456 → 5 requests ✓
```

`user-456` is not affected by `user-123` reaching the limit.

---

# Why Reject Requests Instead of Queueing Them?

The assessment allows requests over the rate limit to either be rejected or queued/delayed.

This implementation deliberately **rejects requests with HTTP 429** after the per-user limit is reached.

This keeps the behavior predictable:

```text
Request
   ↓
Validation
   ↓
Rate Limiter
   ↓
Allowed? ── No → 429
   │
  Yes
   ↓
Queue
```

The queue is therefore responsible for processing **accepted notification jobs**, while the rate limiter controls whether a new notification can be accepted.

---

# 4. Notification Queue

Accepted notifications are represented as jobs and placed into an in-memory FIFO queue.

Example:

```text
Queue

Job A
Job B
Job C
Job D
```

The worker processes them in order:

```text
Job A → Job B → Job C → Job D
```

The queue exists only in memory and therefore persists while the Node.js process is running.

No database is required for this challenge.

---

# 5. Background Worker

The application uses **one background worker**.

The worker continuously checks the queue:

```text
             Queue
               ↓
             Worker
               ↓
             Job A
               ↓
             Sender
```

The worker processes jobs independently from the HTTP request.

Therefore:

```text
POST /notify
      ↓
Add job to queue
      ↓
Return 202
      ↓
Worker processes job
```

This prevents the API request from waiting for the simulated notification send to finish.

### Why one worker?

A single worker keeps the implementation simple and deterministic for this assessment.

It also makes queue ordering, retry behavior, and in-memory state easier to reason about.

In a production system, worker concurrency could be increased or multiple worker processes could consume jobs from a shared queue depending on throughput requirements.

---

# 6. Simulated Notification Sending

The application does not send real emails, SMS messages, or push notifications.

Instead, the sender simulates the operation and waits briefly to represent processing/network time.

Each send has approximately a:

```text
20% failure probability
```

A successful send produces logs similar to:

```text
[SEND] Job=abc123 | User=user-123 | Channel=email
[SUCCESS] Job=abc123
```

---

# 7. Retry and Exponential Backoff

When a notification fails, the worker automatically retries it.

The maximum number of attempts is:

```text
4
```

The retry delay increases exponentially.

```text
Attempt 1 → failure
             ↓
           wait 1s

Attempt 2 → failure
             ↓
           wait 2s

Attempt 3 → failure
             ↓
           wait 4s

Attempt 4 → final attempt
```

The formula is:

```text
backoff = baseDelay × 2^(attempt - 1)
```

With a base delay of `1 second`:

```text
1s → 2s → 4s
```

### Why exponential backoff?

If the notification provider is temporarily unavailable, immediately retrying can place additional load on an already failing service.

Exponential backoff progressively increases the delay between retries and gives the downstream service time to recover.

If all attempts fail, the notification is marked as permanently failed.

---

# Demonstrating Retry Behavior

The normal sender randomly fails approximately 20% of the time.

For a deterministic demonstration, the application supports:

```text
FORCE_SEND_FAILURE=true
```

### Windows PowerShell

Set the environment variable:

```powershell
$env:FORCE_SEND_FAILURE="true"
```

Then start the server:

```powershell
npm run dev
```

Send a notification.

The logs should show:

```text
[WORKER] Job=abc123 | Attempt=1/4
[SEND] Job=abc123
[WORKER] Job=abc123 failed
[RETRY] Job=abc123 | Next attempt in 1000ms

[WORKER] Job=abc123 | Attempt=2/4
[SEND] Job=abc123
[WORKER] Job=abc123 failed
[RETRY] Job=abc123 | Next attempt in 2000ms

[WORKER] Job=abc123 | Attempt=3/4
[SEND] Job=abc123
[WORKER] Job=abc123 failed
[RETRY] Job=abc123 | Next attempt in 4000ms

[WORKER] Job=abc123 | Attempt=4/4
[SEND] Job=abc123
[WORKER] Job=abc123 failed
[WORKER] Job=abc123 permanently failed
```

This makes the retry and backoff behavior easy to demonstrate.

Without `FORCE_SEND_FAILURE`, the sender uses the normal approximately 20% random failure rate.

---

# 8. Status

## All users

```http
GET /status
```

Example:

```bash
curl http://localhost:3000/status
```

Example response:

```json
{
  "queueSize": 0,
  "users": {
    "user-123": {
      "queued": 0,
      "sent": 4,
      "failed": 1
    },
    "user-456": {
      "queued": 1,
      "sent": 2,
      "failed": 0
    }
  }
}
```

---

## Specific user

```http
GET /status?userId=user-123
```

Example:

```bash
curl "http://localhost:3000/status?userId=user-123"
```

Response:

```json
{
  "userId": "user-123",
  "queued": 0,
  "sent": 4,
  "failed": 1,
  "rateLimitRemaining": 2
}
```

### Status fields

| Field                | Meaning                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `queued`             | Accepted jobs that have not reached a final state                |
| `sent`               | Successfully processed notifications                             |
| `failed`             | Notifications that exhausted all retry attempts                  |
| `queueSize`          | Number of jobs currently waiting in the queue                    |
| `rateLimitRemaining` | Number of requests the user can still make in the current window |

---

# 9. Request Validation

Incoming requests are validated using **Zod** before reaching the controller.

Required fields:

```text
userId
message
channel
```

`channel` must be one of:

```text
email
sms
push
```

Invalid requests return:

```text
400 Bad Request
```

### Missing userId

```json
{
  "message": "Hello",
  "channel": "email"
}
```

### Empty message

```json
{
  "userId": "user-123",
  "message": "",
  "channel": "email"
}
```

### Invalid channel

```json
{
  "userId": "user-123",
  "message": "Hello",
  "channel": "whatsapp"
}
```

Example validation response:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "channel",
      "message": "..."
    }
  ]
}
```

Malformed JSON is also handled with a `400 Bad Request` response rather than crashing the server.

---

# 10. Architecture

The overall request flow is:

```text
                    POST /notify
                         │
                         ▼
                 Zod Validation
                         │
                         ▼
                  Rate Limiter
                    │       │
                 Allow     Reject
                    │       │
                    │      429
                    ▼
             Notification Service
                    │
                    ▼
                Create Job
                    │
              ┌─────┴─────┐
              ▼           ▼
            Store        Queue
                          │
                          ▼
                        Worker
                          │
                          ▼
                       Sender
                       /    \
                  Success   Failure
                     │         │
                     ▼         ▼
                  sent++     Retry
                               │
                         1s → 2s → 4s
                               │
                          ┌────┴────┐
                          ▼         ▼
                       Success   Max Attempts
                          │         │
                        sent++    failed++
```

---

# Design Decisions

### In-memory state

A database is not required by the challenge.

The queue, rate-limit timestamps, and notification counters are therefore maintained in memory.

This state remains available across requests while the Node.js process is running.

A production implementation would use persistent/shared infrastructure such as Redis or a message broker.

### Sliding-window rate limiter

A sliding window provides a more precise limit than a simple fixed one-minute counter.

The limiter stores timestamps for each user and removes timestamps older than 60 seconds.

### Single worker

A single worker was chosen to keep processing deterministic and simple for the assessment.

A production system could use multiple workers or worker processes to increase throughput.

### Exponential backoff

Exponential backoff prevents immediate repeated retries against a potentially unavailable downstream service.

### Function-based architecture

The application uses functions rather than classes and separates responsibilities into modules:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Queue / Store
```

This keeps the implementation lightweight while maintaining separation of concerns.

---

# Manual Acceptance Checklist

The following behaviors can be demonstrated manually.

### Validation

```text
✓ Valid request → 202
✓ Missing userId → 400
✓ Empty message → 400
✓ Invalid channel → 400
✓ Malformed JSON → 400
```

### Rate limiting

```text
✓ First 5 requests → accepted
✓ Sixth request → 429
✓ Different user has independent limit
```

### Queue

```text
✓ Accepted request creates a job
✓ Job enters the queue
✓ Worker processes the job
✓ API returns before processing completes
```

### Retry

```text
✓ Send can fail
✓ Failed send is retried
✓ Backoff increases: 1s → 2s → 4s
✓ Maximum attempts are enforced
✓ Permanently failed job increments failed count
```

### Status

```text
✓ GET /status works
✓ Per-user queued count
✓ Per-user sent count
✓ Per-user failed count
✓ Queue size
```
