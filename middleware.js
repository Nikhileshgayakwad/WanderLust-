const Listing = require("./models/listing.js");

// ===============================
// CHECK USER IS LOGGED IN
// ===============================

module.exports.isLoggedIn = (req, res, next) => {

  if (!req.isAuthenticated()) {

    req.session.redirectUrl = req.originalUrl;

    req.flash("error", "You must login first!");

    return res.redirect("/login");
  }

  next();
};


// ===============================
// SAVE REDIRECT URL
// ===============================

module.exports.saveRedirectUrl = (req, res, next) => {

  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }

  next();
};


// ===============================
// CHECK LISTING OWNER
// ===============================

module.exports.isOwner = async (req, res, next) => {

  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(req.user._id)) {

    req.flash(
      "error",
      "You don't have permission to do that!"
    );

    return res.redirect(`/listings/${id}`);
  }

  next();
};


// ===============================
// CURRENT USER FOR EJS
// ===============================

module.exports.setCurrUser = (req, res, next) => {

  res.locals.currUser = req.user;

  next();
};