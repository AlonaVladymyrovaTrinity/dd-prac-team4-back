require("dotenv").config();
require("express-async-errors");
const express = require("express");
const session = require("express-session");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const favicon = require("express-favicon");
const { xss } = require("express-xss-sanitizer");
const helmet = require("helmet");
const passport = require("passport");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP to 100 requests per windowMs
});

const logger = require("./logger");

app.use(limiter);
// middleware setup

app.use(xss());

app.use(express.json());
//Security middleware
app.use(helmet());

app.use(cors({ origin: [/localhost:8000$/], credentials: true }));

//Logging middleware (using morgan)
app.use(
  morgan("dev", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(bodyParser.json());

app.use(cookieParser());
// Configure express-session middleware
app.use(
  session({
    secret: "your-secret-key", // Replace with a secret key for session data encryption
    resave: false,
    saveUninitialized: false,
    // Other configuration options can be added as needed
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Database setup (using Mongoose)
mongoose.set("strictQuery", true);

const connectDB = (url) => {
  return mongoose.connect(url);
};

module.exports = connectDB;

//routers
const authRouter = require("./routes/authRoutes.js");

app.use("/api/v1/auth", authRouter);

// Error handling middleware (must be defined after all other routes and middleware)
//add later

// Start the server
const port = process.env.PORT || 8000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      logger.info(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    logger.error(error);
  }
};

start();
