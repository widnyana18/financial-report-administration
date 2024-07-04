const authRoute = require("./modules/auth/auth-route");
const employeeRoute = require("./modules/employee/employee-route");
const financeRoute = require("./modules/finance/finance-route");
const reportingRoute = require("./modules/reporting/reporting-route");

function routes(app) {
  app.use(authRoute);
  app.use(employeeRoute);
  // app.use('/anggaran', financeRoute);
  // app.use('/laporan', reportingRoute);
}

module.exports = routes;
