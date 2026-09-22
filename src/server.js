
const { connectRedis, redis } = require("./config/redis");
const app = require("./app");
const { connectPostgres, pool } = require("./config/postgres");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;

let server;

async function startServer() {

    await connectRedis();
    await connectPostgres();

    server = app.listen(PORT, () => {
        logger.info("Server Started", {service: "api", port: PORT});
    })
}

async function shutdown(signal) {
    logger.info("Graceful shutdown started", {service: "api", signal});

    if (server) {
        server.close(async () => {
            logger.info("HTTP server closed", {service: "api", signal, port: PORT});

            try {
                await redis.quit();
                logger.info("Redis connection closed", {service: "api", signal});

                await pool.end();
                logger.info("PostgreSQL connection pool closed", {service: "api", signal});

                logger.info("Graceful shutdown completed", {service: "api", signal});                
                process.exit(0);
            } catch (err) {
                logger.error("Error during shutdown", {service: "api", signal, error: err.message});
                process.exit(1)
            }
        })
    } else {
        process.exit(0)
    }
    
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();

