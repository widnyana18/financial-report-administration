const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("express-flash");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const crypto = require("crypto");

const routes = require("./core/routes");
const opdService = require("./core/modules/opd/opd-service");

const app = express();

// set dotenv
dotenv.config({ path: ".env.prod" });

const port = process.env.PORT || 8080;
const dbUri = process.env.DATABASE_URI;

const store = new MongoDBStore({
  uri: dbUri,
  collection: "sessions",
});

// Kunci enkripsi (harus 32 byte untuk AES-256)

const encryptionKey = crypto.randomBytes(32).toString("hex"); // Simpan kunci ini dengan aman!
const iv = crypto.randomBytes(16).toString("hex"); // IV harus 16 byte untuk AES

fs.readFile(".env.dev", "utf8", (err, data) => {
  if (data.includes("ENCRYPTION_KEY") && data.includes("IV")) {
    console.log("Variabel sudah ada di .env.");
    return;
  }
  fs.appendFileSync(".env.dev", `\nENCRYPTION_KEY=${encryptionKey}\nIV=${iv}`);
});

const csrfProtection = csrf();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "log/access.log"),
  { flags: "a" }
);

// set view engine
app.set("view engine", "ejs");
app.set("views", "./ui/views");

// Atur CSP header
app.use((req, res, next) => {
  const key = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = key;

  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://code.jquery.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
      ],
    },
  })(req, res, next);
});

app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(flash());

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

// parse request to body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set public folder
app.use(express.static(path.join(__dirname, "ui/public")));
app.use("/admin", express.static(path.join(__dirname, "ui/public")));

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  await opdService
    .getOneOpd({ _id: req.session.user._id })
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

app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// load routes
routes(app);

mongoose
  .connect(dbUri)
  .then((result) => {
    app.listen(port, () => {
      console.info(`Server running 🤖🚀 at ${process.env.BASE_URL}`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
