
const {z} = require("zod");

const notificationSchema = z.object({
    userId: z.string().trim().min(1, "userId is required"),
    message: z.string().trim().min(1, "message is required"),
    channel: z.enum(["email", "sms", "push"])
})

function validateNotification(req, res, next) {
    const result = notificationSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            error: "Validation failed",
            details: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }))
        })
    }
    
    req.body = result.data;
    next();
}

module.exports = {
    validateNotification,
}