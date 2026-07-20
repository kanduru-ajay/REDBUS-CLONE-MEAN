const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true, minlength: 2, maxlength: 600 },
    reports: [
      {
        userId: { type: String, required: true },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const communityPostSchema = new Schema(
  {
    authorId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    authorAvatar: { type: String, required: false },
    type: {
      type: String,
      enum: ["story", "tip", "discussion"],
      required: true,
    },
    forumType: {
      type: String,
      enum: ["route", "destination", "advice"],
      required: true,
      index: true,
    },
    routeName: { type: String, default: "" },
    destination: { type: String, default: "" },
    title: { type: String, required: true, minlength: 6, maxlength: 120 },
    content: { type: String, required: true, minlength: 20, maxlength: 3000 },
    tips: [{ type: String, maxlength: 200 }],
    photos: [{ type: String }],
    tags: [{ type: String, maxlength: 30 }],
    likes: [{ type: String }],
    comments: [commentSchema],
    reports: [
      {
        userId: { type: String, required: true },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["visible", "flagged", "hidden"],
      default: "visible",
      index: true,
    },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunityPosts", communityPostSchema);
