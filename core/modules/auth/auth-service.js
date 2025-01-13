const Opd = require("../opd/models/opd");

exports.login = async (filter) => {
  try {
    return await Opd.findOne(filter);
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
    institutionId: req.institutionId,
  });
  
  try {
     return await opd.save();
  } catch (error) {
    throw new Error(error);
  }
};
