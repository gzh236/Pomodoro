const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const todoSchema = {
  name: { type: String },
  duration: { type: Number, min: 15, max: 90 },
  description: { type: String },
  date: {
    type: Date,
    required: true,
  },
  taskStartTime: { type: Number },
  taskPauseTime: { type: Number },
  slug: { type: String, required: true, unique: true },
};

const TodoModel = new mongoose.model("Todo", todoSchema);

module.exports = { TodoModel };
