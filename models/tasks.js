const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const todoSchema = {
  name: { type: String, required: true },
  description: { type: String },
  dateTime: { type: Date, default: DateTime.now, required: true },
  completed: { type: Boolean, required: true },
};

const TodoModel = new mongoose.model("Todo", todoSchema);

module.exports = { TodoModel };
