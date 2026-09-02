const User = require("../models/user.js");


module.exports.render = (req, res) => {
  res.render("users/signup.ejs");
};


module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    const newUser = new User({
      username,
      email,
    });

    const registeredUser = await User.register(newUser, password);

    console.log("Registered User:", registeredUser);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }

      req.flash("success", "Welcome to WanderLust!");
      res.redirect("/listings");
    });

  } catch (e) {
    console.log("Signup Error:", e);

    req.flash("error", e.message);
    res.redirect("/signup");
  }
};


module.exports.login = (req, res) => {
  res.render("users/login.ejs");
};


module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.flash("success", "You are now logged out!");
    res.redirect("/listings");
  });
};