require("dotenv").config();
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");
const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
const PORT = 3000;

const taskController = require("./controllers/tasks_controllers");
const ToDoModel = require("./models/tasks");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

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

// newForm
app.get("/todos/new", taskController.newForm);

// create
app.post("/todos", taskController.create);
