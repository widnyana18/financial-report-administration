const express = require("express");
const { createServer } = require("http");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");

const routes = require("./core/routes");
const connectDB = require("./core/common/configs/database");

const app = express();
const server = createServer(app);

// set dotenv
dotenv.config({path :'.env.dev'});

process.env.NODE_ENV = "development";
const env = process.env.NODE_ENV;

// mongodb connection
if (env !== "test") {
  connectDB();
}

// set view engine
app.set("view engine", "ejs");
app.set("views", "./ui/views");

// parse request to body-parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// set public folder
app.use(express.static(path.join(__dirname, "ui/public")));

// load routes
routes(app);
module.exports = server;
