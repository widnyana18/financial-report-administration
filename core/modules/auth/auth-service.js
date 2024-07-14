const { Model, FilterQuery } = require("mongoose");

const Employee = require("../employee/employee");

exports.login = async (email, password) => {
  try {
    return await Employee.findOne({ email: email, password: password });
  } catch (error) {
    throw new Error(error);
  }
};
exports.signup = async (email, password, phoneNumber) => {
  const employee = new Employee({
    email: email,
    password: password,
    phoneNumber: phoneNumber,
  });

  try {
    return await employee.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.logout = async () => {};
