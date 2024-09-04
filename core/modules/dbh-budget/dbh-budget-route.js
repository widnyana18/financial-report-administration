const { Router } = require("express");

const dbhBudgetController = require("./dbh-budget-controller");

const appRouter = Router();
const apiRouter = Router();

//admin route Reporting website
appRouter.get("/", dbhBudgetController.renderDataDbhOpd);
appRouter.get("/:dbhId", dbhBudgetController.renderDataDbhOpd);

// route API
apiRouter.get("/", dbhBudgetController.findAll);
apiRouter.get("/admin/:reportId", dbhBudgetController.findDbhBudgetAdmin);
apiRouter.get("/:opdId", dbhBudgetController.findDbhBudgetOpd);
apiRouter.post("/add", dbhBudgetController.postAddBudget);
apiRouter.post("/edit/:dbhId", dbhBudgetController.updateBudgetRecord);
apiRouter.delete("/delete/:dbhId", dbhBudgetController.deleteBudgetRecord);

module.exports = { appRouter, apiRouter };
