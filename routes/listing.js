const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const index = require("../controller/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

const { ListingSchema } = require("../schema.js");

const {
  isLoggedIn,
  isOwner
} = require("../middleware.js");


// =====================================
// VALIDATE LISTING
// =====================================

const validateListing = (req, res, next) => {

  const { error } = ListingSchema.validate(req.body);

  if (error) {

    const errMess = error.details
      .map((el) => el.message)
      .join(",");

    throw new ExpressError(400, errMess);
  }

  next();
};


// =====================================
// NEW LISTING FORM
// =====================================

router.get(
  "/new",
  isLoggedIn,
  index.renderNewForm
);


// =====================================
// INDEX + CREATE
// =====================================

router.route("/")

  .get(
    wrapAsync(index.index)
  )

  .post(
    isLoggedIn,

    // Image field name = image
    upload.single("image"),

    validateListing,

    wrapAsync(index.createListing)
  );


// =====================================
// SHOW + UPDATE + DELETE
// =====================================

router.route("/:id")

  .get(
    wrapAsync(index.showListing)
  )

  .put(
    isLoggedIn,

    isOwner,

    // Image field name = image
    upload.single("image"),

    validateListing,

    wrapAsync(index.updateListing)
  )

  .delete(
    isLoggedIn,

    isOwner,

    wrapAsync(index.deleteListing)
  );


// =====================================
// EDIT FORM
// =====================================

router.get(
  "/:id/edit",

  isLoggedIn,

  isOwner,

  wrapAsync(index.editListing)
);


module.exports = router;