const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  name: { type: String },
  duration: { type: Number },
  description: { type: String },
  date: {
    type: Date,
  },
  taskStartTime: { type: Number },
  taskPauseTime: { type: Number, default: 0 },
  taskResumeTime: { type: Number, default: 0 },
  slug: { type: String, required: true, unique: true },
});

const TodoModel = new mongoose.model("Todo", todoSchema);

module.exports = { TodoModel };
