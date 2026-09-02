const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require ("passport");
const userController = require("../controller/user.js");


router.route ("/signup")
.get(userController.render )
.post(
  wrapAsync(userController.signup)
);

router.route("/login")
.get(userController.login)
.post( passport.authenticate("local", {failureRedirect: '/login', failureFlash: true}),async(req,res)=>{
req.flash("success"," Welocome to the WonderLust! ");
res.redirect("/listings");

});



router.get("/logout",userController.logout);
module.exports = router;