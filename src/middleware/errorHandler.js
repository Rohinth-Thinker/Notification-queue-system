
function errorHandler(err, req, res, next) {
    console.log("[ERROR] ", err.message)

    if (err instanceof SyntaxError && err.status == 400 && "body" in err) {
        return res.status(400).json({
            error: "Invalid JSON",
            message: "Request body contains malformed JSON"
        })
    }

    return res.status(500).json({
        error: "Internal server error"
    })
}

module.exports = {
    errorHandler,
}