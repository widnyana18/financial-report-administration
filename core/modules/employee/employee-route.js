const { Router } = require("express");

const employeeController = require("./employee-controller");

const appRouter = Router();
const apiRouter = Router();

//root route employee
appRouter.get('/', employeeController.renderEmployees);
appRouter.get('/:id', employeeController.renderUpdateEmployee);

//API
apiRouter.get('/', employeeController.findEmployees);
apiRouter.patch('/:id', employeeController.updateEmployee);
apiRouter.delete('/:id', employeeController.deleteEmployee);

module.exports = {appRouter, apiRouter};


