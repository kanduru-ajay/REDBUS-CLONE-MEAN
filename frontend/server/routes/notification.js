const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification");

router.get("/notifications/:userId", notificationController.listNotifications);
router.post("/notifications", notificationController.createManualNotification);
router.patch("/notifications/:id/read", notificationController.markRead);
router.post("/notifications/:id/retry", notificationController.retryDelivery);
router.get("/notification-preferences/:userId", notificationController.getPreferences);
router.put("/notification-preferences/:userId", notificationController.updatePreferences);

module.exports = router;
