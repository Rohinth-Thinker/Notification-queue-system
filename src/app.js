
const express = require("express");

const notificationRoutes = require("./routes/notificationRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json())

app.get("/health", (req, res) => {
    res.json({status: "ok"})
})

app.use("/", notificationRoutes);

app.use(errorHandler);

module.exports = app;