const { Router } = require("express");

const reportingController = require("./reporting-controller");
const isAuth = require("../../common/middleware/is-auth");

const appRouter = Router();
const apiRouter = Router();

//admin route Reporting website
appRouter.get("/", isAuth, reportingController.renderIndex);
appRouter.get(
  "/buat-laporan",
  isAuth,
  reportingController.renderCreateReporting
);
appRouter.get("/:title", isAuth, reportingController.renderReportingDetails);
appRouter.get(
  "/edit/:title",
  isAuth,
  reportingController.renderUpdateReporting
);

appRouter.get(
  "/:title/download-excel",
  isAuth,
  reportingController.exportToExcel
);

// route API
apiRouter.get("/", reportingController.getAllReporting);
apiRouter.get("/:title", reportingController.getReporting);
apiRouter.post("/add", isAuth, reportingController.createReporting);
apiRouter.post("/edit/:title", isAuth, reportingController.updateReporting);
apiRouter.delete(
  "/delete/:title",
  isAuth,
  reportingController.deleteReporting
);

module.exports = { appRouter, apiRouter };
