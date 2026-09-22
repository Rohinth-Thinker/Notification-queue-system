
function log(level, message, metadata={}) {
    const entry = {
        timestamp: new Date().toISOString,
        level,
        message,
        ...metadata,
    }

    console.log(JSON.stringify(entry));
}

const logger = {
    info(message, metadata={}) {
        log("info", message, metadata);
    },

    warn(message, metadata={}) {
        log("warn", message, metadata);
    },

    error(message, metadata={}) {
        log("error", message, metadata);
    },
}

module.exports = logger;