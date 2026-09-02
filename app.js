require("dotenv").config();

const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MongoStore = require("connect-mongo").default;
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLAS_DB;


// Mongo Session Store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE:", err);
});


// Session Options
const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


// EJS
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// Session
app.use(session(sessionOption));
app.use(flash());


// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Global Variables
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;

  next();
});


// Routes
app.use("/listings", listings);
app.use("/listings", reviewRouter);
app.use("/", userRouter);


// 404
app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!!"));
});


// Error Handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;

  res.status(statusCode).render("error.ejs", { message });
});


// MongoDB Connection + Server Start
const port = process.env.PORT || 8080;

async function startServer() {
  try {
    await mongoose.connect(dbUrl);

    console.log("Database is connected");

    // Ye batayega exactly kaunsa database connect hua hai
    console.log("Connected Database:", mongoose.connection.name);
    console.log("Connected Host:", mongoose.connection.host);

    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });

  } catch (err) {
    console.log("Database connection error:");
    console.log(err);
    process.exit(1);
  }
}

startServer();