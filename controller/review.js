const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const ExpressError = require("../utils/ExpressError.js");


// ===============================
// CREATE REVIEW
// ===============================

module.exports.createReview = async (req, res) => {

  const { id } = req.params;


  // Find listing
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ExpressError(
      404,
      "Listing not found"
    );
  }


  // Create new review
  const newReview = new Review(
    req.body.review
  );


  // Logged-in user becomes author
  newReview.author = req.user._id;


  // Add review to listing
  listing.reviews.push(newReview);


  // Save review
  await newReview.save();


  // Save listing
  await listing.save();


  req.flash(
    "success",
    "Review is Posted"
  );


  res.redirect(
    `/listings/${id}`
  );
};


// ===============================
// DELETE REVIEW
// ===============================

module.exports.deleteReview = async (req, res) => {

  const { id, reviewId } = req.params;


  // Find review
  const review = await Review.findById(reviewId);

  if (!review) {

    req.flash(
      "error",
      "Review not found"
    );

    return res.redirect(
      `/listings/${id}`
    );
  }


  // Check review owner
  if (
    !review.author ||
    !review.author.equals(req.user._id)
  ) {

    req.flash(
      "error",
      "You don't have permission to delete this review"
    );

    return res.redirect(
      `/listings/${id}`
    );
  }


  // Remove review from listing
  await Listing.findByIdAndUpdate(
    id,
    {
      $pull: {
        reviews: reviewId
      }
    }
  );


  // Delete review
  await Review.findByIdAndDelete(reviewId);


  req.flash(
    "success",
    "Review Deleted"
  );


  res.redirect(
    `/listings/${id}`
  );
};
