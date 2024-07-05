const { Router } = require("express");

const reportingController = require("./reporting-controller");

const appRouter = Router();
const apiRouter = Router();

//admin route Reporting website
appRouter.get("/", (req, res, next) => {
  console.log("");
});
appRouter.get("/", (req, res, next) => {
  console.log("this is reporting views");
});
appRouter.get("/create-new", (req, res, next) => {
  console.log("this is create new reporting views");
});
appRouter.get("/:id", (req, res, next) => {
  console.log("this is detailing update views");
});
appRouter.get("/:id", (req, res, next) => {
  console.log("This is update reporting views");
});

// route API
apiRouter.get("/", (req, res, next) => {
  console.log("Run api reporting route");
});
apiRouter.post("/", (req, res, next) => {
  console.log("Run post create reporting route");
});
apiRouter.patch("/:id", (req, res, next) => {
  console.log("Run patch update reporting route");
});
apiRouter.delete("/:id", (req, res, next) => {
  console.log("Run delete reporting route");
});

module.exports = { appRouter, apiRouter };
