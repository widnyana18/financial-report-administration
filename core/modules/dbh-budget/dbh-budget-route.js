const { Router } = require("express");

const dbhBudgetController = require("./dbh-budget-controller");

const appRouter = Router();
const apiRouter = Router();

//admin route Reporting website
appRouter.get("/", dbhBudgetController.renderDataDbhOpd);
appRouter.get("/:budgetId", dbhBudgetController.renderDataDbhOpd);

// route API
apiRouter.get("/", dbhBudgetController.findAll);
apiRouter.get("/admin/:reportId", dbhBudgetController.findDbhBudgetAdmin);
apiRouter.get("/:opdId", dbhBudgetController.findDbhBudgetOpd);
apiRouter.post("/", dbhBudgetController.postAddBudget);
apiRouter.post("/:budgetId", dbhBudgetController.updateBudgetRecord);
apiRouter.delete("/:budgetId", dbhBudgetController.deleteBudgetRecord);

module.exports = { appRouter, apiRouter };
