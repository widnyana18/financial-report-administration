const authRoute = require("./modules/auth/auth-route");
const employeeRoute = require("./modules/employee/employee-route");
const reportingRoute = require("./modules/reporting/reporting-route");

function routes(app) {
  app.use(authRoute);
  app.use(employeeRoute);  
  app.use(reportingRoute);
}

module.exports = routes;
