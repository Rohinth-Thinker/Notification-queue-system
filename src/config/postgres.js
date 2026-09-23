
const {Pool} = require("pg");
const logger = require("../utils/logger");

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "notification_db",
})

pool.on("error", (error) => {
    logger.error("Postgres error", {error: error.message});
})

async function connectPostgres() {
    const client = await pool.connect();

    try {
        await client.query("SELECT 1");
        logger.info("Postgres connected successfully")
    } finally {
        client.release();
    }

}

module.exports = {
    pool,
    connectPostgres,
}