const employeeService = require("./employee-service");

exports.renderEmployees = async (req, res, next) => {
  const employees = await employeeService.getEmployees();
  res.render("employees/employees", {
    pageTitle: "Employees",
    path: "/employees",
    employees: employees,
  });
};

exports.renderUpdateEmployee = async (req, res, next) => {
  const id = req.params.id;
  const employee = await employeeService.getEmployeeById(id);

  if (!employee) {
    res.redirect("/employees");
  } else {
    res.render("employees/update-employee", {
      pageTitle: "Update Employee",
      path: "/employee",
      employee: employee,
    });
  }
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
    const deletedEmployee = await employeeService.deleteEmployee(id);
    return res.status(200).json(deletedEmployee);
  } catch (error) {
    return next(error);
  }
};
