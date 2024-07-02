const axios = require("axios");

const employeeService = require("./employee-service");

exports.renderEmployees = (req, res, next) => {
  axios
    .get("http://localhost:3000/api/employees")
    .then((response) => {
      res.render("layouts/employees", { employees: response.data });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.renderUpdateEmployee = (req, res, next) => {
  axios
    .get("http://localhost:3000/api/employees", {
      params: { id: req.params.id },
    })
    .then((employee) => {
      res.render("layouts/update-employee", { employee: employee.data });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.findEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.getEmployees();
    return res.status(200).json(employees);
  } catch (error) {
    return next(error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const employee = await employeeService.getEmployeeById(id);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
    }
    const updatedEmployee = await employeeService.updateEmployee(
      { _id: id },
      data
    );
    return res.status(200).json(updatedEmployee);
  } catch (error) {
    return next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  const id = req.params.id;

  try {
    const deletedEmployee = await employeeService.deleteEmployee({ _id: id });

    if (!employee) {
      res.status(404).json({ message: "Failed to delete employee" });
    }
    return res.status(200).json(deletedEmployee);
  } catch (error) {
    return next(error);
  }
};
