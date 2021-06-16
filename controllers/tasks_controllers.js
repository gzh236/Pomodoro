const { TodoModel } = require("../models/tasks");
const _ = require("lodash");
const { rearg } = require("lodash");

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
        date: Date.now(),
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
    }
  },

  getTimer: (req, res) => {
    TodoModel.findOne({ slug: req.params.slug })
      .then((taskResp) => {
        res.render("start", {
          todo: taskResp,
          todoStartTime: taskResp.taskStartTime,
          todoPauseTime: taskResp.taskPauseTime,
          todoResumeTime: taskResp.taskResumeTime,
          todoDuration: taskResp.duration,
        });
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/todos/" + req.params.slug);
      });
  },

  start: (req, res) => {
    TodoModel.findOneAndUpdate(
      { slug: req.params.slug },
      {
        $set: { taskStartTime: Date.now() },
      },

      { new: true }
    )
      .then((taskResp) => {
        res.redirect("/todos/" + req.params.slug + "/start");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/todos/" + req.params.slug);
      });
  },

  pause: async (req, res) => {
    const pauseTime = Date.now();
    try {
      const todo = await TodoModel.findOne({ slug: req.params.slug });
      const durationElapsed = (pauseTime - todo.taskStartTime) / 60000;

      todo.duration -= durationElapsed;

      todo.taskPauseTime = pauseTime;
      await todo.save();

      res.redirect("/todos/" + req.params.slug + "/start");
    } catch (err) {
      console.log(err);
    }
  },

  resume: async (req, res) => {
    let resumeTime = Date.now();
    try {
      let todo = await TodoModel.findOne({ slug: req.params.slug });
      todo.taskStartTime = resumeTime;
      todo.taskPauseTime = 0;
      await todo.save();

      res.redirect("/todos/" + req.params.slug + "/start");
    } catch (err) {
      console.log(err);
    }
  },

  edit: async (req, res) => {
    try {
      let todo = await TodoModel.findOne({ slug: req.params.slug });
      res.render("edit", { todo });
    } catch (err) {
      console.log(err);
      res.redirect("/todos/" + req.params.slug);
    }
  },

  update: async (req, res, next) => {
    if (!req.body) {
      console.log(`error retrieving form data`);
      res.redirect("/todos/" + req.params.slug + "/edit");
      return;
    }

    if (!req.body.name || !req.body.duration) {
      console.log(`please fill in all required fields`);
      // flash err msg
    }

    try {
      (newSlug = _.kebabCase(req.body.name)),
        await TodoModel.findOneAndUpdate(
          { slug: req.params.slug },
          {
            $set: {
              name: req.body.name,
              description: req.body.description,
              duration: req.body.duration,
              slug: newSlug,
            },
          },
          { new: true }
        );
      res.redirect("/todos/" + newSlug);
    } catch (err) {
      console.log(err);
      // flash err msg
    }
  },

  delete: async (req, res) => {
    try {
      await TodoModel.deleteOne({ slug: req.params.slug });
      res.redirect("/todos");
    } catch (err) {
      console.log(err);
      res.redirect("/todos/" + req.params.slug);
    }
  },
};
