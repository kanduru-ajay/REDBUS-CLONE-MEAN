const CommunityPost = require("../models/communityPost");

const visibleFilter = { status: { $ne: "hidden" } };

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildPostPayload(body) {
  const tags = Array.isArray(body.tags)
    ? body.tags.map(normalizeText).filter(Boolean).slice(0, 8)
    : [];
  const tips = Array.isArray(body.tips)
    ? body.tips.map(normalizeText).filter(Boolean).slice(0, 6)
    : [];
  const photos = Array.isArray(body.photos)
    ? body.photos.filter((photo) => typeof photo === "string" && photo.startsWith("data:image/")).slice(0, 4)
    : [];

  return {
    authorId: normalizeText(body.authorId),
    authorName: normalizeText(body.authorName),
    authorEmail: normalizeText(body.authorEmail),
    authorAvatar: normalizeText(body.authorAvatar),
    type: normalizeText(body.type),
    forumType: normalizeText(body.forumType),
    routeName: normalizeText(body.routeName),
    destination: normalizeText(body.destination),
    title: normalizeText(body.title),
    content: normalizeText(body.content),
    tags,
    tips,
    photos,
  };
}

exports.getPosts = async (req, res) => {
  try {
    const { forumType, type, routeName, destination, sort } = req.query;
    const query = { ...visibleFilter };

    if (forumType) query.forumType = forumType;
    if (type) query.type = type;
    if (routeName) query.routeName = new RegExp(routeName, "i");
    if (destination) query.destination = new RegExp(destination, "i");

    const posts = await CommunityPost.find(query).lean().exec();
    const rankedPosts = posts
      .map((post) => ({
        ...post,
        likeCount: post.likes.length,
        commentCount: post.comments.filter((comment) => !comment.isHidden).length,
        reportCount: post.reports.length,
        trendingScore:
          post.likes.length * 2 +
          post.comments.filter((comment) => !comment.isHidden).length * 3 +
          post.reports.length * -4,
      }))
      .sort((left, right) => {
        if (sort === "most-liked") return right.likeCount - left.likeCount;
        if (sort === "trending") return right.trendingScore - left.trendingScore;
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });

    res.send(rankedPosts);
  } catch (error) {
    res.status(500).json({ error: "Unable to load community posts" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const payload = buildPostPayload(req.body);
    if (!payload.authorId || !payload.authorEmail) {
      return res.status(403).json({ error: "Only verified logged-in users can create posts" });
    }
    if (!payload.title || payload.title.length < 6 || !payload.content || payload.content.length < 20) {
      return res.status(400).json({ error: "Add a clear title and at least 20 characters of content" });
    }
    if (!["story", "tip", "discussion"].includes(payload.type)) {
      return res.status(400).json({ error: "Choose a valid post type" });
    }
    if (!["route", "destination", "advice"].includes(payload.forumType)) {
      return res.status(400).json({ error: "Choose a valid forum" });
    }

    const post = await CommunityPost.create(payload);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Unable to publish post" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(403).json({ error: "Please sign in to like posts" });

    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.status === "hidden") return res.status(404).json({ error: "Post not found" });

    const hasLiked = post.likes.includes(userId);
    post.likes = hasLiked ? post.likes.filter((id) => id !== userId) : [...post.likes, userId];
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(500).json({ error: "Unable to update like" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const authorId = normalizeText(req.body.authorId);
    const authorName = normalizeText(req.body.authorName);
    const content = normalizeText(req.body.content);
    if (!authorId) return res.status(403).json({ error: "Please sign in to comment" });
    if (content.length < 2) return res.status(400).json({ error: "Comment is too short" });

    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.status === "hidden") return res.status(404).json({ error: "Post not found" });

    post.comments.push({ authorId, authorName: authorName || "Traveler", content });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Unable to add comment" });
  }
};

exports.reportPost = async (req, res) => {
  try {
    const userId = normalizeText(req.body.userId);
    const reason = normalizeText(req.body.reason);
    if (!userId) return res.status(403).json({ error: "Please sign in to report content" });
    if (!reason) return res.status(400).json({ error: "Please include a report reason" });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!post.reports.some((report) => report.userId === userId)) {
      post.reports.push({ userId, reason });
      if (post.reports.length >= 3) post.status = "flagged";
      await post.save();
    }
    res.send(post);
  } catch (error) {
    res.status(500).json({ error: "Unable to report post" });
  }
};

exports.moderatePost = async (req, res) => {
  try {
    const { status, adminNote, adminEmail } = req.body;
    if (!adminEmail || !String(adminEmail).endsWith("@tedbus.admin")) {
      return res.status(403).json({ error: "Admin moderation access required" });
    }
    if (!["visible", "flagged", "hidden"].includes(status)) {
      return res.status(400).json({ error: "Invalid moderation status" });
    }

    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: normalizeText(adminNote) },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.send(post);
  } catch (error) {
    res.status(500).json({ error: "Unable to moderate post" });
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const posts = await CommunityPost.find({ ...visibleFilter, authorId: req.params.userId }).lean().exec();
    const comments = await CommunityPost.find({
      ...visibleFilter,
      "comments.authorId": req.params.userId,
    })
      .select("title comments createdAt")
      .lean()
      .exec();

    res.send({
      posts,
      comments: comments.flatMap((post) =>
        post.comments
          .filter((comment) => comment.authorId === req.params.userId && !comment.isHidden)
          .map((comment) => ({ ...comment, postTitle: post.title, postId: post._id }))
      ),
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to load activity" });
  }
};
