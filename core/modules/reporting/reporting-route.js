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
appRouter.get("/:reportingId", isAuth, reportingController.renderReportingDetails);
appRouter.get(
  "/edit/:reportingId",
  isAuth,
  reportingController.renderUpdateReporting
);

appRouter.get(
  "/:reportingId/download-excel",
  isAuth,
  reportingController.exportToExcel
);

// route API
apiRouter.get("/", reportingController.getAllReporting);
apiRouter.get("/:reportingId", reportingController.getReporting);
apiRouter.post("/add", isAuth, reportingController.createReporting);
apiRouter.post("/edit/:reportingId", isAuth, reportingController.updateReporting);
apiRouter.delete(
  "/delete/:reportingId",
  isAuth,
  reportingController.deleteReporting
);

module.exports = { appRouter, apiRouter };
