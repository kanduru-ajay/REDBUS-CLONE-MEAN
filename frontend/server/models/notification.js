const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deliverySchema = new Schema(
  {
    channel: { type: String, enum: ["inApp", "email", "push"], required: true },
    status: { type: String, enum: ["queued", "sent", "failed"], default: "queued" },
    attempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date },
    nextRetryAt: { type: Date },
    error: { type: String, default: "" },
  },
  { _id: false }
);

const notificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["booking_confirmation", "cancellation", "schedule_update", "journey_reminder", "promotion", "community", "review"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    locale: { type: String, default: "en" },
    channels: [{ type: String, enum: ["inApp", "email", "push"] }],
    delivery: [deliverySchema],
    metadata: { type: Schema.Types.Mixed, default: {} },
    readAt: { type: Date },
    scheduledFor: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", notificationSchema);
