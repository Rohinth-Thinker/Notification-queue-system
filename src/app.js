
const express = require("express");
const helmet = require("helmet");

const { redis } = require("./config/redis");
const { pool } = require("./config/postgres");

const notificationRoutes = require("./routes/notificationRoutes");
const { errorHandler } = require("./middleware/errorHandler");


const app = express();

app.use(helmet());
app.use(express.json({
    limit: "100kb",
}))

app.get("/health", async (req, res) => {
    let redisStatus = "ok";
    let postgresStatus = "ok"

    try {
        await redis.ping()
    } catch (err) {
        redisStatus = "error"
    }

    try {
        await pool.query("SELECT 1")
    } catch (err) {
        postgresStatus = "error"
    }

    const healthy = redisStatus == "ok" && postgresStatus == "ok";

    res.status(healthy ? 200 : 503).json({
        status: healthy ? "ok" : "unhealthy",
        redis: redisStatus,
        postgres: postgresStatus,
    })

})

app.use("/", notificationRoutes);

app.use(errorHandler);

module.exports = app;