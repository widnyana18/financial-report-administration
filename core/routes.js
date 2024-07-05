const authRoute = require("./modules/auth/auth-route");
const employeeRoute = require("./modules/employee/employee-route");
const reportingRoute = require("./modules/reporting/reporting-route");

function routes(app) {
  // app endpoint  
  app.use(authRoute.appRouter);
  app.use('/karyawan', employeeRoute.appRouter);
  app.use('/laporan', reportingRoute.appRouter);

  // api endpoint
  app.use('/api', authRoute.apiRouter);
  app.use('/api/karyawan', employeeRoute.apiRouter);
  app.use('/api/laporan', reportingRoute.apiRouter);
}

module.exports = routes;
