const { Router } = require("express");

const reportingController = require("./reporting-controller");

const appRouter = Router();
const apiRouter = Router();

//admin route Reporting website
appRouter.get("/", reportingController.renderIndex);
appRouter.get("/", reportingController.renderReportings);
appRouter.get("/buat-baru", reportingController.renderCreateReporting);
appRouter.get("/:reportId", reportingController.renderReportingDetails);
appRouter.get("/:reportId/tambah-record", reportingController.renderAddBudget);
appRouter.get(
  "/:reportId/edit-record/:budgetId",
  reportingController.renderUpdateBudgetRecord
);

// route API
apiRouter.get("/:reportId", reportingController.getAllBudgetByReporting);
apiRouter.post("/:reportId", reportingController.addBudget);
apiRouter.patch("/:reportId/:budgetId", reportingController.updateBudgetRecord);
apiRouter.delete("/:reportId/:budgetId", reportingController.deleteBudgetRecord);

module.exports = { appRouter, apiRouter };
