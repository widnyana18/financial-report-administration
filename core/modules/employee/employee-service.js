const Employee = require("./employee");

exports.getEmployeeById = async (id) => {
  try {
    return await Employee.findById(id);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getEmployees = async () => {
  return await Employee.find();
};

exports.updateEmployee = async (filter, input) => {
  const employee = await Employee.findOneAndUpdate(filter, input, {
    new: true,
  });
  return employee;
};

exports.deleteEmployee = async (id) => {
  const employee = await Employee.findOneAndDelete({_id: id});
  return employee;
};
