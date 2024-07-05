const { Router } = require("express");

const employeeController = require("./employee-controller");

const router = Router();

//root route employee
router.get('/employees', employeeController.renderEmployees);
router.get('/employees/:id', employeeController.renderUpdateEmployee);

//API
router.get('/api/employees', employeeController.findEmployees);
router.patch('/api/employees/:id', employeeController.updateEmployee);
router.delete('/api/employees/:id', employeeController.deleteEmployee);

module.exports = router;


