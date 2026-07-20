const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationPreferenceSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    locale: { type: String, default: "en" },
    promotionalEnabled: { type: Boolean, default: true },
    preferredChannels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationPreferences", notificationPreferenceSchema);
