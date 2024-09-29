const { Router } = require("express");

const dbhBudgetController = require("./dbh-budget-controller");
const isAuth = require("../../common/middleware/is-auth");

const appRouter = Router();
const apiRouter = Router();

//admin route Reporting website
appRouter.get("/", isAuth, dbhBudgetController.renderDataDbhOpd);
appRouter.get("/:dbhId", isAuth, dbhBudgetController.renderDataDbhOpd);

// route API
apiRouter.get("/", dbhBudgetController.findDbhBudgetOpd);
apiRouter.get("/admin/:reportId", dbhBudgetController.findDbhBudgetAdmin);
apiRouter.post("/add", isAuth, dbhBudgetController.postAddBudget);
apiRouter.post("/edit/:dbhId", isAuth, dbhBudgetController.updateBudgetRecord);
apiRouter.delete("/delete/:dbhId", isAuth, dbhBudgetController.deleteBudgetRecord);

module.exports = { appRouter, apiRouter };
