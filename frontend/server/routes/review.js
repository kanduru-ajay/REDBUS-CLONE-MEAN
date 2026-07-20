const express = require("express");
const router = express.Router();
const reviewController = require("../controller/review");

router.get("/reviews", reviewController.getReviews);
router.post("/reviews", reviewController.createReview);
router.patch("/reviews/:id", reviewController.updateReview);
router.post("/reviews/:id/report", reviewController.reportReview);
router.patch("/reviews/:id/moderate", reviewController.moderateReview);

module.exports = router;
