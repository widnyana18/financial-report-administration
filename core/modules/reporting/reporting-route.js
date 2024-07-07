const { Router } = require("express");

const reportingController = require("./reporting-controller");

const appRouter = Router();
const apiRouter = Router();

//admin route Reporting website
appRouter.get("/", reportingController.renderIndex);
appRouter.get("/", reportingController.renderReportings);
appRouter.get("/buat-laporan", reportingController.renderCreateReporting);
appRouter.get("/:id", reportingController.renderReportingDetails);
appRouter.get("/:id", reportingController.updateReporting);

// route API
apiRouter.get("/", reportingController.getAllReporting);
apiRouter.get("/:id", reportingController.getReportingById);
apiRouter.post("/", reportingController.createReporting);
apiRouter.patch("/:id", reportingController.updateReporting);
apiRouter.delete("/:id", reportingController.deleteReporting);

module.exports = { appRouter, apiRouter };
