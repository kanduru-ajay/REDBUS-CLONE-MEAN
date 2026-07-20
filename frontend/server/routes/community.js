const express = require("express");
const router = express.Router();
const communityController = require("../controller/community");

router.get("/community/posts", communityController.getPosts);
router.post("/community/posts", communityController.createPost);
router.post("/community/posts/:id/like", communityController.toggleLike);
router.post("/community/posts/:id/comments", communityController.addComment);
router.post("/community/posts/:id/report", communityController.reportPost);
router.patch("/community/posts/:id/moderate", communityController.moderatePost);
router.get("/community/activity/:userId", communityController.getUserActivity);

module.exports = router;
