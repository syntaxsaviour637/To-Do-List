const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();

/* ================= 🔴 NEW ================= */
const session = require("express-session");
/* ========================================== */

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ================= 🔴 NEW ================= */
app.use(
  session({
    secret: "todo-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
/* ========================================== */

/* ================= 🔴 NEW ================= */
app.use((req, res, next) => {
  if (!req.session.userId) {
    req.session.userId = new mongoose.Types.ObjectId().toString();
  }
  next();
});
/* ========================================== */

app.set("view engine", "ejs");

// ================= DATABASE =================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.log(err));

/* ================= 🔴 UPDATED ================= */
const taskSchema = new mongoose.Schema({
  name: String,
  userId: String, // 🔴 NEW
});
/* ============================================ */

const Task = mongoose.model("Task", taskSchema);

/* ================= 🔴 UPDATED ================= */
const listSchema = new mongoose.Schema({
  name: String,
  userId: String, // 🔴 NEW
  items: [taskSchema],
});
/* ============================================ */

const List = mongoose.model("List", listSchema);

// ================= ROUTES =================

// HOME (Today list)
app.get("/", async (req, res) => {
  try {
    /* ================= 🔴 UPDATED ================= */
    const todayTasks = await Task.find({
      userId: req.session.userId,
    });
    /* ============================================ */

    res.render("index", {
      listTitle: "Today",
      taskList: todayTasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Database Error");
  }
});

// DYNAMIC LIST ROUTE
app.get("/:listName", async (req, res) => {
  const listName = _.capitalize(req.params.listName);

  if (listName === "Favicon.ico") return res.sendStatus(204);

  try {
    /* ================= 🔴 UPDATED ================= */
    let foundList = await List.findOne({
      name: listName,
      userId: req.session.userId,
    });
    /* ============================================ */

    if (!foundList) {
      /* ================= 🔴 UPDATED ================= */
      foundList = new List({
        name: listName,
        userId: req.session.userId,
        items: [],
      });
      /* ============================================ */

      await foundList.save();
    }

    res.render("index", {
      listTitle: foundList.name,
      taskList: foundList.items,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

// ADD TASK
app.post("/", async (req, res) => {
  const taskName = req.body.task;
  const listName = _.capitalize(req.body.submitBtn);

  if (!taskName || taskName.trim() === "") {
    return res.redirect(listName === "Today" ? "/" : "/" + listName);
  }

  /* ================= 🔴 UPDATED ================= */
  const newTask = new Task({
    name: taskName,
    userId: req.session.userId,
  });
  /* ============================================ */

  if (listName === "Today") {
    await newTask.save();
    return res.redirect("/");
  }

  /* ================= 🔴 UPDATED ================= */
  const foundList = await List.findOne({
    name: listName,
    userId: req.session.userId,
  });
  /* ============================================ */

  if (!foundList) return res.redirect("/");

  foundList.items.push(newTask);
  await foundList.save();

  res.redirect("/" + listName);
});

// DELETE TASK
app.post("/delete", async (req, res) => {
  try {
    const taskId = req.body.checkbox;
    const listName = _.capitalize(req.body.listName);

    if (listName === "Today") {
      /* ================= 🔴 UPDATED ================= */
      await Task.findOneAndDelete({
        _id: taskId,
        userId: req.session.userId,
      });
      /* ============================================ */

      return res.redirect("/");
    }

    /* ================= 🔴 UPDATED ================= */
    await List.findOneAndUpdate(
      { name: listName, userId: req.session.userId },
      { $pull: { items: { _id: taskId } } }
    );
    /* ============================================ */

    res.redirect("/" + listName);
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// ================= SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
