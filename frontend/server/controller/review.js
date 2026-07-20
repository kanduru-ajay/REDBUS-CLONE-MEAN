const Booking = require("../models/booking");
const Review = require("../models/review");

function isCompleted(booking) {
  const status = String(booking.status || "").toLowerCase();
  if (status === "completed") return true;
  const journeyDate = new Date(booking.departureDetails.date);
  return Number.isFinite(journeyDate.getTime()) && journeyDate.getTime() <= Date.now();
}

function routeName(booking) {
  return `${booking.departureDetails.city} to ${booking.arrivalDetails.city}`;
}

async function buildSummary(query) {
  const reviews = await Review.find({ ...query, isHidden: false }).sort({ createdAt: -1 }).lean().exec();
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0;
  return { averageRating: Number(averageRating.toFixed(1)), reviews };
}

exports.getReviews = async (req, res) => {
  try {
    const query = {};
    if (req.query.busId) query.busId = req.query.busId;
    if (req.query.routeName) query.routeName = new RegExp(req.query.routeName, "i");
    res.send(await buildSummary(query));
  } catch (error) {
    res.status(500).json({ error: "Unable to load reviews" });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { userId, userName, bookingId, rating, content } = req.body;
    if (!userId) return res.status(403).json({ error: "Only verified users can review journeys" });
    if (!content || content.trim().length < 20) return res.status(400).json({ error: "Review must be at least 20 characters" });

    const booking = await Booking.findById(bookingId).lean().exec();
    if (!booking || booking.customerId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Review requires your own completed journey" });
    }
    if (!isCompleted(booking)) return res.status(400).json({ error: "Review unlocks after journey completion" });

    const existing = await Review.findOne({ bookingId }).lean().exec();
    if (existing) return res.status(409).json({ error: "This journey already has a review" });

    const visibleReviewCount = await Review.countDocuments({ userId, isHidden: false });
    const review = await Review.create({
      userId,
      userName: userName || "Verified traveler",
      bookingId,
      busId: booking.busId,
      routeName: routeName(booking),
      rating,
      content: content.trim(),
      trustedReviewer: visibleReviewCount >= 2,
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Unable to create review" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    const hoursSinceCreate = (Date.now() - new Date(review.createdAt).getTime()) / 36e5;
    if (hoursSinceCreate > 24) return res.status(403).json({ error: "Reviews are locked after 24 hours" });
    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.content && req.body.content.trim().length >= 20) review.content = req.body.content.trim();
    await review.save();
    res.send(review);
  } catch (error) {
    res.status(500).json({ error: "Unable to update review" });
  }
};

exports.reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (!review.reports.some((report) => report.userId === req.body.userId)) {
      review.reports.push({ userId: req.body.userId, reason: req.body.reason || "Inappropriate review" });
      if (review.reports.length >= 3) review.isHidden = true;
      await review.save();
    }
    res.send(review);
  } catch (error) {
    res.status(500).json({ error: "Unable to report review" });
  }
};

exports.moderateReview = async (req, res) => {
  try {
    if (!req.body.adminEmail || !String(req.body.adminEmail).endsWith("@tedbus.admin")) {
      return res.status(403).json({ error: "Admin moderation access required" });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, { isHidden: Boolean(req.body.isHidden) }, { new: true });
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.send(review);
  } catch (error) {
    res.status(500).json({ error: "Unable to moderate review" });
  }
};
