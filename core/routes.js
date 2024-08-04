const authRoute = require("./modules/auth/auth-route");
const opdRoute = require("./modules/opd/opd-route");
const reportingRoute = require("./modules/reporting/reporting-route");

function routes(app) {
  // app endpoint  
  app.use(authRoute.appRouter);
  app.use('/karyawan', opdRoute.appRouter);
  app.use('/laporan', reportingRoute.appRouter);

  // api endpoint
  app.use('/api', authRoute.apiRouter);
  app.use('/api/karyawan', opdRoute.apiRouter);
  app.use('/api/laporan', reportingRoute.apiRouter);
}

module.exports = routes;
