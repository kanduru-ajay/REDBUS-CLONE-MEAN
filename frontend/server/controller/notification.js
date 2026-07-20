const Notification = require("../models/notification");
const Preference = require("../models/notificationPreference");

const copy = {
  en: {
    booking_confirmation: ["Booking confirmed", "Your Tedbus booking is confirmed."],
    cancellation: ["Booking cancelled", "Your cancellation request has been processed."],
    schedule_update: ["Schedule update", "There is an update to your bus schedule."],
    journey_reminder: ["Journey reminder", "Your journey is coming up soon."],
    promotion: ["Tedbus offer", "A new travel offer is available for you."],
    community: ["Community update", "Someone interacted with your community activity."],
    review: ["Review reminder", "Share your route experience with other travelers."],
  },
  hi: {
    booking_confirmation: ["बुकिंग पुष्टि", "आपकी Tedbus बुकिंग पुष्टि हो गई है।"],
    cancellation: ["बुकिंग रद्द", "आपका रद्दीकरण अनुरोध पूरा हो गया है।"],
    schedule_update: ["समय अपडेट", "आपकी बस समय-सारणी में अपडेट है।"],
    journey_reminder: ["यात्रा रिमाइंडर", "आपकी यात्रा जल्द शुरू होने वाली है।"],
    promotion: ["Tedbus ऑफर", "आपके लिए नया यात्रा ऑफर उपलब्ध है।"],
    community: ["कम्युनिटी अपडेट", "आपकी कम्युनिटी गतिविधि पर नई प्रतिक्रिया है।"],
    review: ["रिव्यू रिमाइंडर", "दूसरे यात्रियों के लिए अपना अनुभव साझा करें।"],
  },
};

function allowedChannels(preference, requestedChannels, type) {
  const base = requestedChannels && requestedChannels.length ? requestedChannels : ["inApp"];
  if (type === "promotion" && preference && !preference.promotionalEnabled) return ["inApp"];
  return base.filter((channel) => !preference || preference.preferredChannels[channel]);
}

async function createNotification(payload) {
  const preference = await Preference.findOne({ userId: payload.userId }).lean().exec();
  const locale = payload.locale || preference?.locale || "en";
  const localizedCopy = copy[locale]?.[payload.type] || copy.en[payload.type] || ["Tedbus update", "You have a new update."];
  const channels = allowedChannels(preference, payload.channels, payload.type);
  return Notification.create({
    userId: payload.userId,
    type: payload.type,
    title: payload.title || localizedCopy[0],
    message: payload.message || localizedCopy[1],
    locale,
    channels,
    metadata: payload.metadata || {},
    scheduledFor: payload.scheduledFor,
    delivery: channels.map((channel) => ({ channel, status: channel === "inApp" ? "sent" : "queued" })),
  });
}

exports.createNotification = createNotification;

exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 }).lean().exec();
    res.send(notifications);
  } catch (error) {
    res.status(500).json({ error: "Unable to load notifications" });
  }
};

exports.createManualNotification = async (req, res) => {
  try {
    const notification = await createNotification(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Unable to create notification" });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { readAt: new Date() }, { new: true });
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.send(notification);
  } catch (error) {
    res.status(500).json({ error: "Unable to update notification" });
  }
};

exports.retryDelivery = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    notification.delivery = notification.delivery.map((delivery) => {
      if (delivery.status === "sent") return delivery;
      delivery.attempts += 1;
      delivery.lastAttemptAt = new Date();
      delivery.nextRetryAt = new Date(Date.now() + Math.min(delivery.attempts, 5) * 15 * 60 * 1000);
      delivery.status = delivery.attempts > 2 ? "failed" : "queued";
      delivery.error = delivery.status === "failed" ? "Provider adapter unavailable" : "";
      return delivery;
    });
    await notification.save();
    res.send(notification);
  } catch (error) {
    res.status(500).json({ error: "Unable to retry notification" });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const preference = await Preference.findOneAndUpdate(
      { userId: req.params.userId },
      { $setOnInsert: { userId: req.params.userId } },
      { new: true, upsert: true }
    );
    res.send(preference);
  } catch (error) {
    res.status(500).json({ error: "Unable to load preferences" });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const preference = await Preference.findOneAndUpdate(
      { userId: req.params.userId },
      {
        locale: req.body.locale || "en",
        promotionalEnabled: Boolean(req.body.promotionalEnabled),
        preferredChannels: {
          inApp: Boolean(req.body.preferredChannels?.inApp),
          email: Boolean(req.body.preferredChannels?.email),
          push: Boolean(req.body.preferredChannels?.push),
        },
      },
      { new: true, upsert: true }
    );
    res.send(preference);
  } catch (error) {
    res.status(500).json({ error: "Unable to update preferences" });
  }
};
