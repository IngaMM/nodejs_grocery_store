var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var compression = require("compression");
var helmet = require("helmet");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var inventoryRouter = require("./routes/inventory"); //Import routes for "inventory" area of site
const basicAuth = require("express-basic-auth");
require("dotenv").config();

var app = express();

app.use(helmet());
app.use(compression()); //Compress all routes

//Set up mongoose connection
var mongoose = require("mongoose");
// Set up mongoose connection
var dev_db_url = process.env.DB_URL;
var mongoDB = process.env.MONGODB_URI || dev_db_url;

mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.post(
  "/*/delete",
  basicAuth({
    challenge: true,
    users: { admin: "foobar" }
  })
);
app.post(
  "/*/update",
  basicAuth({
    challenge: true,
    users: { admin: "foobar" }
  })
);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/inventory", inventoryRouter); // Add inventory routes to middleware chain.

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
