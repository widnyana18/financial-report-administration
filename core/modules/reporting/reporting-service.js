const Reporting = require("./models/reporting");

exports.getAllReporting = async (filter) => {
  // if (user.role === "admin") {
  return await Reporting.find(filter);
  // }
  // return await Reporting.findOne({ opdId: id });
};

exports.findReporting = async (filter) => {
  try {
    return await Reporting.findOne(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.createReporting = async (data) => {
  const reporting = new Reporting({
    title: data.title,
    period: data.period ?? "January - Maret",
    year: data.year ?? "2024",
    dbhRecieved: data.dbhRecieved,
    totalInstitutionDbh: data.totalInstitutionDbh,
    fileExcelUrl: data.fileExcelUrl,
    status: data.status,
    opdId: data.opdId,
    totalDbhBudget: data.totalDbhBudget,
    totalDbhRealization: data.totalDbhRealization,
    
  });

  try {
    return await reporting.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateReporting = async (reportId, input) => {
  try {
    return await Reporting.findOneAndUpdate({ _id: reportId }, input);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteReporting = async (id) => {
  return await Reporting.deleteOne({ _id: id });
};
