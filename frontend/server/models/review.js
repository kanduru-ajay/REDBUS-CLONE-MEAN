const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    bookingId: { type: String, required: true, unique: true },
    busId: { type: String, required: true, index: true },
    routeName: { type: String, required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    content: { type: String, minlength: 20, maxlength: 1200, required: true },
    isHidden: { type: Boolean, default: false },
    trustedReviewer: { type: Boolean, default: false },
    reports: [
      {
        userId: { type: String, required: true },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reviews", reviewSchema);
