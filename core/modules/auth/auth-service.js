const Opd = require("../opd/models/opd");

exports.login = async (username, password) => {
  try {
    return await Opd.findOne({ username: username, password: password });
  } catch (error) {
    throw new Error(error);
  }
};

exports.signup = async (req) => {
  const opd = new Opd({
    opdName: req.opdName,
    username: req.username,
    password: req.password,   
    phone: req.phone, 
    institution: req.institution,
  });
  
  try {
     return await opd.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.logout = async () => {};
