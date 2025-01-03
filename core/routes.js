const authRoute = require("./modules/auth/auth-route");
const opdRoute = require("./modules/opd/opd-route");
const reportingRoute = require("./modules/reporting/reporting-route");
const dbhRealizationRoute = require("./modules/dbh-realization/dbh-realization-route");

function routes(app) {
  // app endpoint  
  app.use(authRoute.appRouter);
  app.use(opdRoute.appRouter);
  app.use("/admin", reportingRoute.appRouter);
  app.use(dbhRealizationRoute.appRouter);

  // api endpoint
  app.use('/api/auth', authRoute.apiRouter);
  app.use('/api/opd', opdRoute.apiRouter);
  app.use('/api/laporan', reportingRoute.apiRouter);
  app.use('/api/dbh', dbhRealizationRoute.apiRouter);
}

module.exports = routes;
