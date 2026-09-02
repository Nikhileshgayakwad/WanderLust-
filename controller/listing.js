const Listing = require("../models/listing.js");


// =====================================
// GEOCODE LOCATION USING MAPTILER
// =====================================

async function getCoordinates(location, country) {

  const query = `${location}, ${country}`;

  const encodedQuery = encodeURIComponent(query);

  const url =
    `https://api.maptiler.com/geocoding/${encodedQuery}.json?key=${process.env.MAPTILER_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to fetch location from MapTiler");
  }

  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error("Location not found");
  }

  return data.features[0].geometry.coordinates;
}


// =====================================
// INDEX
// =====================================

module.exports.index = async (req, res) => {

  const allListings = await Listing.find({});

  res.render("listings/index.ejs", {
    allListings
  });

};


// =====================================
// RENDER NEW FORM
// =====================================

module.exports.renderNewForm = (req, res) => {

  res.render("listings/new.ejs");

};


// =====================================
// SHOW LISTING
// =====================================

module.exports.showListing = async (req, res) => {

  const { id } = req.params;

  const listing = await Listing.findById(id)

    .populate({
      path: "reviews",

      populate: {
        path: "author"
      }

    })

    .populate("owner");


  if (!listing) {

    req.flash(
      "error",
      "Listing you requested does not exist!"
    );

    return res.redirect("/listings");

  }


  res.render("listings/show.ejs", {
    listing,
    maptilerKey: process.env.MAPTILER_KEY
  });

};


// =====================================
// CREATE LISTING
// =====================================

module.exports.createListing = async (req, res) => {

  const newListing = new Listing(
    req.body.listing
  );


  // =====================================
  // GET COORDINATES FROM MAPTILER
  // =====================================

  const coordinates = await getCoordinates(
    newListing.location,
    newListing.country
  );


  // Save coordinates in MongoDB
  newListing.geometry = {
    type: "Point",
    coordinates: coordinates
  };


  // =====================================
  // IMAGE UPLOAD
  // =====================================

  if (req.file) {

    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };

  }


  // =====================================
  // OWNER
  // =====================================

  newListing.owner = req.user._id;


  // =====================================
  // SAVE LISTING
  // =====================================

  await newListing.save();


  req.flash(
    "success",
    "New Listing Created!"
  );


  res.redirect("/listings");

};


// =====================================
// EDIT LISTING
// =====================================

module.exports.editListing = async (req, res) => {

  const { id } = req.params;

  const listing = await Listing.findById(id);


  if (!listing) {

    req.flash(
      "error",
      "Listing you requested does not exist!"
    );

    return res.redirect("/listings");

  }


  res.render(
    "listings/edit.ejs",
    { listing }
  );

};


// =====================================
// UPDATE LISTING
// =====================================

module.exports.updateListing = async (req, res) => {

  const { id } = req.params;


  // Find current listing
  const oldListing = await Listing.findById(id);

  if (!oldListing) {

    req.flash(
      "error",
      "Listing you requested does not exist!"
    );

    return res.redirect("/listings");

  }


  // =====================================
  // UPDATE NORMAL FIELDS
  // =====================================

  const listing = await Listing.findByIdAndUpdate(

    id,

    {
      ...req.body.listing
    },

    {
      new: true
    }

  );


  // =====================================
  // UPDATE LOCATION COORDINATES
  // =====================================

  const coordinates = await getCoordinates(
    listing.location,
    listing.country
  );


  listing.geometry = {
    type: "Point",
    coordinates: coordinates
  };


  // =====================================
  // UPDATE IMAGE
  // =====================================

  if (req.file) {

    listing.image = {

      url: req.file.path,

      filename: req.file.filename

    };

  }


  // Save geometry and image
  await listing.save();


  req.flash(
    "success",
    "Listing Updated!"
  );


  res.redirect(
    `/listings/${id}`
  );

};


// =====================================
// DELETE LISTING
// =====================================

module.exports.deleteListing = async (req, res) => {

  const { id } = req.params;

  await Listing.findByIdAndDelete(id);


  req.flash(
    "success",
    "Listing Deleted!"
  );


  res.redirect("/listings");

};