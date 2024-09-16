const { Router } = require("express");

const reportingController = require("./reporting-controller");

const appRouter = Router();
const apiRouter = Router();

//admin route Reporting website
appRouter.get("/", reportingController.renderIndex);
appRouter.get("/:reportId", reportingController.renderReportingDetails);
appRouter.get("/buat-laporan", reportingController.renderCreateReporting);
appRouter.get("/edit-laporan", reportingController.renderUpdateReporting);

// route API
apiRouter.get("/", reportingController.getAllReporting);
apiRouter.get("/:reportId", reportingController.getReporting);
apiRouter.post("/add", reportingController.createReporting);
apiRouter.post("/edit/:reportId", reportingController.updateReporting);
apiRouter.delete("delete/:reportId", reportingController.deleteReporting);

module.exports = { appRouter, apiRouter };
