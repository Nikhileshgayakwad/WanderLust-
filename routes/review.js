const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const { reviewSchema } = require("../schema.js");
const { isLoggedIn } = require("../middleware.js");

const reviewController = require("../controller/review.js");


// ===============================
// VALIDATE REVIEW
// ===============================

const validateReview = (req, res, next) => {

  const { error } = reviewSchema.validate(req.body);

  if (error) {

    const errMess = error.details
      .map((el) => el.message)
      .join(",");

    throw new ExpressError(400, errMess);
  }

  next();
};


// ===============================
// CREATE REVIEW
// POST /listings/:id/reviews
// ===============================

router.post(
  "/:id/reviews",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);


// ===============================
// DELETE REVIEW
// DELETE /listings/:id/reviews/:reviewId
// ===============================

router.delete(
  "/:id/reviews/:reviewId",
  isLoggedIn,
  wrapAsync(reviewController.deleteReview)
);


module.exports = router;