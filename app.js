const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config(); 




const PORT = process.env.PORT || 3000;
// 🔹 CHANGED: clearer constant name

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

// ================= DATABASE =================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.log(err));

const taskSchema = new mongoose.Schema({ 
  name: String,
});

const Task = mongoose.model("Task", taskSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [taskSchema],
});

const List = mongoose.model("List", listSchema); 

// ================= ROUTES =================

// HOME (Today list)
app.get("/", async (req, res) => {
  try {
    const todayTasks = await Task.find({}); 

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

  if (listName === "Favicon.ico") {
    return res.sendStatus(204);
  }

  try {
    let foundList = await List.findOne({ name: listName }); 

    if (!foundList) {
      foundList = new List({
        name: listName,
        items: [],
      });
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

  const newTask = new Task({ 
    name: taskName,
  });

  if (listName === "Today") {
    await newTask.save();
    return res.redirect("/");
  }

  const foundList = await List.findOne({ name: listName });
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
      await Task.findByIdAndDelete(taskId);
      return res.redirect("/");
    }

    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: taskId } } }
    );

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
