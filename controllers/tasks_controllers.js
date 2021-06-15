const { TodoModel } = require("../models/tasks");
const pomodoroTimer = require("../helper");
const { DateTime, Duration } = require("luxon");
const _ = require("lodash");

module.exports = {
  index: async (req, res) => {
    let tasks = [];
    try {
      tasks = await TodoModel.find();
      res.render("index", { tasks });
    } catch (err) {
      console.log(err);
    }
  },

  newForm: (req, res) => {
    res.render("new");
  },

  create: async (req, res) => {
    if (!req.body) {
      console.log(`error retrieving form data`);
      res.redirect("/todos/new");
      return;
    }

    if (!req.body.duration || !req.body.name) {
      console.log(`please complete all required fields`);
      res.redirect("/todos/new");
      return;
    }

    try {
      let slug = _.kebabCase(req.body.name);

      let taskDescription = req.body.description;

      if (!req.body.description) {
        taskDescription = "-";
      }

      await TodoModel.create({
        name: req.body.name,
        duration: req.body.duration,
        description: taskDescription,
        date: DateTime.now(),
        slug: slug,
      });
      res.redirect("/todos");
    } catch (err) {
      console.log(err);
      res.redirect("/todos/new");
    }
  },

  show: async (req, res) => {
    // slug validation
    if (!req.params.slug) {
      // err message
      res.redirect("/todos");
      return;
    }

    try {
      selectedTask = await TodoModel.findOne({ slug: req.params.slug });
      res.render("show", { selectedTask });
    } catch (err) {
      // err message
      console.log(err);
      res.redirect("/todos");
      return;
    }
  },

  getTimer: (req, res) => {
    TodoModel.findOne({ slug: req.params.slug })
      .then((taskResp) => {
        res.render("start", {
          todo: taskResp,
          todoStartTime: taskResp.taskStartTime,
          todoPauseTime: taskResp.taskPauseTime,
          todoDuration: taskResp.duration,
        });
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/todos/" + req.params.slug);
      });
  },

  start: (req, res) => {
    let taskDuration;

    let selectedTask = TodoModel.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: { taskStartTime: Date.now() } },
      { new: true }
    )
      .then((taskResp) => {
        res.redirect("/todos/" + req.params.slug + "/start");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/todos/" + selectedTask.slug);
        return;
      });
  },

  // pauseTimer: (req, res) => {
  //   TodoModel.findOneAndUpdate(
  //     { slug: req.params.slug },
  //     { $set: { taskPauseTime: Date.now() } },
  //     { new: true }
  //   )
  //     .then((taskResp) => {
  //       res.render("pause", {
  //         todo: taskResp,
  //         todoStartTime: taskResp.taskStartTime,
  //         todoPauseTime: taskResp.taskPauseTime,
  //         todoDuration: taskResp.duration,
  //       });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       res.redirect("/todos/" + req.params.slug + "/start");
  //     });
  // },

  // pause: (req, res) => {
  //   // determine current pause time
  //   let selectedTask = TodoModel.findOneAndUpdate(
  //     { slug: req.params.slug },
  //     { $set: { taskStartTime: Date.now() } },
  //     { new: true }
  //   )
  //     .then((taskResp) => {
  //       console.log(taskResp.taskStartTime);
  //       console.log(taskResp.taskPauseTime);
  //       res.redirect("/todos/" + req.params.slug + "/pause");
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       res.redirect("/todos/" + selectedTask.slug + "/start");
  //       return;
  //     });
  // },

  edit: async (req, res) => {
    try {
      let todo = await TodoModel.findOne({ slug: req.params.slug });
      res.render("edit", { todo });
    } catch (err) {
      console.log(err);
      res.redirect("/todos/" + req.params.slug);
    }
  },

  update: async (req, res) => {
    try {
      let newSlug = _.kebabCase(req.body.name);
      let todo = await TodoModel.updateOne(
        { slug: req.params.slug },
        {
          $set: {
            name: req.body.name,
            description: req.body.description,
            duration: req.body.duration,
            slug: newSlug,
          },
        }
      );
      res.redirect("/todos/");
    } catch (err) {
      console.log(err);
      res.redirect("/todos/" + req.params.slug);
    }
  },

  delete: async (req, res) => {
    // delete logic
  },
};
