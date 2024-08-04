const { Model, FilterQuery } = require("mongoose");

const Opd = require("../opd/opd");

exports.login = async (email, password) => {
  try {
    return await Opd.findOne({ email: email, password: password });
  } catch (error) {
    throw new Error(error);
  }
};
exports.signup = async (email, password, phoneNumber) => {
  const opd = new Opd({
    email: email,
    password: password,
    phoneNumber: phoneNumber,
  });

  try {
    return await opd.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.logout = async () => {};
