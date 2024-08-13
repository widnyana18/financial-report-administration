const express = require("express");
const { createServer } = require("http");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set public folder
app.use(express.static(path.join(__dirname, "ui/public")));

// load routes
routes(app);

module.exports = server;
