const { Router } = require("express");

const dbhRealizationController = require("./dbh-realization-controller");
const isAuth = require("../../common/middleware/is-auth");

const appRouter = Router();
const apiRouter = Router();

//admin route Reporting website
appRouter.get("/", isAuth, dbhRealizationController.renderDataDbhOpd);
appRouter.get("/:dbhId", isAuth, dbhRealizationController.renderDataDbhOpd);

// route API
apiRouter.get("/", dbhRealizationController.findDbhRealizationOpd);
apiRouter.post("/add", isAuth, dbhRealizationController.postAddBudget);
apiRouter.post("/edit/:dbhId", isAuth, dbhRealizationController.updateBudgetRecord);
apiRouter.delete("/delete/:dbhId", isAuth, dbhRealizationController.deleteBudgetRecord);
apiRouter.post("/send-report", isAuth, dbhRealizationController.postSendDbhOpdReporting);

module.exports = { appRouter, apiRouter };
