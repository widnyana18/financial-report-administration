const express = require("express");
const { createServer } = require("http");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");

const routes = require("./routes");
const connectDB = require("./common/configs/database");

const app = express();
const server = createServer(app);

dotenv.config({path :'.env.dev'});

process.env.NODE_ENV = "development";
const env = process.env.NODE_ENV;

// mongodb connection
if (env !== "test") {
  connectDB();
}

// parse request to body-parser
app.use(bodyparser.json());

// log requests
// app.use(morgan('tiny'));

// set view engine
app.set("view engine", "ejs");

routes(app);
module.exports = server;
