
const app = require("./app");
const { startWorker } = require("./queue/notificationQueue");

const PORT = process.env.PORT || 3000;

startWorker();

app.listen(PORT, () => {
    console.log(`Server running on the PORT http://localhost:${PORT}`)
})

