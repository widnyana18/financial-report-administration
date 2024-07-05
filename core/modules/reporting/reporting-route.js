const { Router } = require("express");

const reportingController = require("./reporting-controller");

const router = Router();

//admin route Reporting website
router.get("/", (req, res, next) => {
  console.log("");
});
router.get("/reporting", (req, res, next) => {
  console.log("this is reporting views");
});
router.get("/reporting/create-new", (req, res, next) => {
  console.log("this is create new reporting views");
});
router.get("/reporting/:id", (req, res, next) => {
  console.log("this is detailing update views");
});
router.get("/reporting/:id", (req, res, next) => {
  console.log("This is update reporting views");
});

// route API
router.get("/api/reporting", (req, res, next) => {
  console.log("Run api reporting route");
});
router.post("/api/reporting", (req, res, next) => {
  console.log("Run post create reporting route");
});
router.patch("/api/reporting:id", (req, res, next) => {
  console.log("Run patch update reporting route");
});
router.delete("/api/reporting/:id", (req, res, next) => {
  console.log("Run delete reporting route");
});

module.exports = router;
