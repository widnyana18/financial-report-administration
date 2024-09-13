const authRoute = require("./modules/auth/auth-route");
const opdRoute = require("./modules/opd/opd-route");
const reportingRoute = require("./modules/reporting/reporting-route");
const dbhBudgetRoute = require("./modules/dbh-budget/dbh-budget-route");

function routes(app) {
  // app endpoint  
  app.use(authRoute.appRouter);
  app.use(opdRoute.appRouter);
  app.use('/admin', reportingRoute.appRouter);
  app.use(dbhBudgetRoute.appRouter);

  // api endpoint
  app.use('/api/auth', authRoute.apiRouter);
  app.use('/api/opd', opdRoute.apiRouter);
  app.use('/api/laporan', reportingRoute.apiRouter);
  app.use('/api/dbh', dbhBudgetRoute.apiRouter);
}

module.exports = routes;
