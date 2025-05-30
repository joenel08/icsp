const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middlewares
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, collectionName: "sessions" }),
  cookie: { secure: false },
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const weightRoutes = require("./routes/weights");
const concernRoutes = require("./routes/concerns");
const uploadRoutes = require("./routes/uploads");
const reportRoutes = require("./routes/reports");
const dashboardRoutes = require("./routes/dashboard");

// Use routes
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", categoryRoutes);
app.use("/", weightRoutes);
app.use("/", concernRoutes);
app.use("/", uploadRoutes);
app.use("/", reportRoutes);
app.use("/", dashboardRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
