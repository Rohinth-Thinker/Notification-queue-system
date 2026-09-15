
const { Router } = require("express");

const { createNotification, getNotificationStatus } = require("../controllers/notificationController");
const { validateNotification } = require("../utils/validation");

const router = Router();

router.post("/notify", validateNotification, createNotification)
router.get("/status", getNotificationStatus);

module.exports = router

