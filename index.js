const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const routes = require("./core/routes");
const Opd = require("./core/modules/opd/models/opd");

const app = express();

// set dotenv
dotenv.config({ path: ".env.dev" });

const port = process.env.PORT || 8080;
const dbUri = process.env.DATABASE_URI;

const store = new MongoDBStore({
  uri: dbUri,
  collection: "sessions",
});

app.use(
  session(
    {
      secret: "my secret",
      resave: false,
      saveUninitialized: false,
      store: store,
    },
    (req, res, next) => {
      console.log("Session callback function called");
      if (!req.session) {
        console.log("Initializing session");
        req.session = {};
      } else {
        console.log("Session already initialized");
      }
      next();
    }
  )
);

// set view engine
app.set("view engine", "ejs");
app.set("views", "./ui/views");

// parse request to body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set public folder
app.use(express.static(path.join(__dirname, "ui/public")));
app.use("/admin", express.static(path.join(__dirname, "ui/public")));

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use((req, res, next) => {    
  if (!req.session.user) {
    return next();
  }

  Opd.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

// load routes
routes(app);

mongoose
  .connect(dbUri)
  .then((result) => {
    app.listen(port, () => {
      console.info(`Server running 🤖🚀 at http://localhost:${port}/`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
