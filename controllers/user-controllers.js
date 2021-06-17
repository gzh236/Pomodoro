const { UserModel } = require("../models/users");
const bcrypt = require("bcrypt");

module.exports = {
  registrationForm: async (req, res) => {
    let user = req.user;

    res.render("user-registration", { user });
  },

  register: async (req, res) => {
    let user = req.user;

    try {
      user = await UserModel.findOne({ username: req.body.username });
    } catch (err) {
      console.log(err);
      res.redirect("/register");
    }

    if (user) {
      res.redirect("/register");
      console.log("user already exists");
      return;
    }

    const hashedPwd = await bcrypt.hash(req.body.password, 10);

    try {
      await UserModel.create({
        username: req.body.username,
        password: hashedPwd,
      });

      res.redirect("/");
    } catch (err) {
      console.log(err);
      res.redirect("/register");
    }
  },

  loginForm: (req, res) => {
    let user = req.user;

    res.render("user-login", { user });
  },

  login: (req, res) => {
    let user = req.user;
    res.redirect("/todos");
  },
};
