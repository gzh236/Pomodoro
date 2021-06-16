require("dotenv").config();
const express = require("express");
const session = require("express-session");
const app = express();

const methodOverride = require("method-override");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const ProgressBar = require("progressbar.js");

const passport = require("passport"),
  LocalStrategy = require("passport-local).Strategy");

const mongoose = require("mongoose"),
  mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
const PORT = process.env.PORT || 3000;

// test

const taskController = require("./controllers/tasks_controllers");
const ToDoModel = require("./models/tasks");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "public"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(methodOverride("_method"));

// passport init
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {});

passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    });
  })
);

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => {
    app.listen(PORT, () => {
      console.log(`Pomodo-roll listening at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    console.log(`server error`);
  });

// ROUTES //

// index
app.get("/todos", taskController.index);

// create
app.post("/todos", taskController.create);

// delete
app.delete("/todos/:slug/delete", taskController.delete);

// newForm
app.get("/todos/new", taskController.newForm);

// show
app.get("/todos/:slug", taskController.show);

// update;
app.patch("/todos/:slug", taskController.update);

// pause, resume
app.patch("/todos/:slug/pause", taskController.pause);
app.patch("/todos/:slug/resume", taskController.resume);

// start
app.get("/todos/:slug/start", taskController.getTimer);
app.patch("/todos/:slug/start", taskController.start);

// edit
app.get("/todos/:slug/edit", taskController.edit);
