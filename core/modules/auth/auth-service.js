const Opd = require("../opd/models/opd");

exports.login = async (filter) => {
  try {
    return await Opd.findOne(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.signup = async (data) => {
  try {
    const opd = new Opd(data);
    return await opd.save();
  } catch (error) {
    throw new Error(error);
  }
};
