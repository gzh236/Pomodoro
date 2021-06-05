const { TodoModel } = require("../models/tasks");
const mongoose = require("mongoose");

module.exports = {
  index: async (req, res) => {
    let tasks = [];
    try {
      tasks = await TodoModel.find();
    } catch (err) {
      console.log(err);
    }
  },

  newForm: (req, res) => {
    res.render("new");
  },

  create: async (req, res) => {
    // create logic
    await TodoModel.create({});
  },
};
