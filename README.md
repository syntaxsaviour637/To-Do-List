# 📝 To-Do List Web App

A dynamic To-Do List application built using **Node.js**, **Express**, **EJS**, and **MongoDB**.  
This app allows users to manage daily tasks as well as create **custom task lists** dynamically using URL parameters.

---

## 🚀 Features

- ✅ Add & delete tasks
- 📅 Default **Today** list
- 📂 Unlimited custom lists (e.g. `/work`, `/study`)
- 💾 Persistent storage using **MongoDB Atlas**
- 🌐 Deployed-ready (Render compatible)
- 🎨 Simple and clean UI with EJS templating

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB (Atlas M0)
- **Templating Engine:** EJS
- **ODM:** Mongoose
- **Utilities:** Lodash
- **Environment Variables:** dotenv

---

## 📂 Project Structure

├── public/ # Static files (CSS, images)
├── views/ # EJS templates
├── app.js # Main server file
├── package.json
├── .gitignore
└── README.md


---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/todoListDB
