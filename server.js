require("dotenv").config();
const express = require("express");
const session = require("express-session");
const app = express();

const methodOverride = require("method-override");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const ProgressBar = require("progressbar.js");

const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

const mongoose = require("mongoose"),
  mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
const PORT = process.env.PORT || 3000;

const taskController = require("./controllers/tasks_controllers");
const userController = require("./controllers/user-controllers");
const { ToDoModel } = require("./models/tasks");
const { UserModel } = require("./models/users");

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(flash());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { path: "/", secure: false, maxAge: 3600000 },
  })
);
app.use(methodOverride("_method"));
app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  next();
});

// passport init
app.use(passport.initialize());
app.use(passport.session());

// serialise the user to support login sessions
passport.serializeUser(function (user, done) {
  done(null, user);
});

// ID deserialised which will be used to find the user (req.user)
passport.deserializeUser(function (id, done) {
  // Setups user model
  UserModel.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy(function (username, password, done) {
    // find user by username
    UserModel.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }

      // validate pw
      bcrypt.compare(password, user.password, function (err, res) {
        if (err) {
          return done(err);
        }
        // if pw doesnt match, return an error
        if (res === false) {
          return done(null, false, { message: "Incorrect password" });
        }
        // successful match
        return done(null, user);
      });
    });
  })
);

function isLoggedIn(req, res, next) {
  if (req.user) {
    return next();
  }
  res.redirect("/");
}

function alreadyLoggedIn(req, res, next) {
  if (!req.user) {
    return next();
  }
  res.redirect("/todos");
}
// APP ROUTES //

// index
app.get("/todos", isLoggedIn, taskController.index);

// create
app.post("/todos", isLoggedIn, taskController.create);

// delete
app.delete("/todos/:slug/delete", isLoggedIn, taskController.delete);

// newForm
app.get("/todos/new", isLoggedIn, taskController.newForm);

// show
app.get("/todos/:slug", isLoggedIn, taskController.show);

// update;
app.patch("/todos/:slug", isLoggedIn, taskController.update);

// pause, resume
app.patch("/todos/:slug/pause", taskController.pause);
app.patch("/todos/:slug/resume", taskController.resume);

// start
app.get("/todos/:slug/start", taskController.getTimer);
app.patch("/todos/:slug/start", taskController.start);

// edit
app.get("/todos/:slug/edit", isLoggedIn, taskController.edit);

// USER AUTH ROUTES //

app.get("/", userController.loginForm);

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/todos",
    failureRedirect: "/",
  }),
  userController.login
);

app.get("/register", alreadyLoggedIn, userController.registrationForm);

app.post("/", alreadyLoggedIn, userController.register);

// logout
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

mongoose.set("useFindAndModify", false);

mongoose
  .connect(mongoURI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    app.listen(PORT, () => {
      console.log(`Pomodotoro listening at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    console.log(`server error`);
  });
