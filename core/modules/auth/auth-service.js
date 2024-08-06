const Opd = require("../opd/opd");

exports.login = async (email, password) => {
  try {
    return await Opd.findOne({ email: email, password: password });
  } catch (error) {
    throw new Error(error);
  }
};
exports.signup = async (req) => {
  const opd = new Opd({
    fullname: req.fullname,
    email: req.email,
    password: req.password,    
    institution: req.institution,
  });

  const reportId = await reportingService.findReporting({period: req.period});
  
  try {
     await opd.save();
     return reportId;
  } catch (error) {
    throw new Error(error);
  }
};

exports.logout = async () => {};
