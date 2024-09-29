const { Router } = require("express");

const reportingController = require("./reporting-controller");
const isAuth = require("../../common/middleware/is-auth");

const appRouter = Router();
const apiRouter = Router();

//admin route Reporting website
appRouter.get("/admin", isAuth, reportingController.renderIndex);
appRouter.get(
  "/admin/buat-laporan",
  isAuth,
  reportingController.renderCreateReporting
);
appRouter.get("admin/:reportId", isAuth, reportingController.renderReportingDetails);
appRouter.get(
  "/admin/edit/:reportingId",
  isAuth,
  reportingController.renderUpdateReporting
);

// route API
apiRouter.get("/", reportingController.getAllReporting);
apiRouter.get("/:reportId", reportingController.getReporting);
apiRouter.post("/add", isAuth, reportingController.createReporting);
apiRouter.post("/edit/:reportId", isAuth, reportingController.updateReporting);
apiRouter.delete(
  "delete/:reportId",
  isAuth,
  reportingController.deleteReporting
);

module.exports = { appRouter, apiRouter };
