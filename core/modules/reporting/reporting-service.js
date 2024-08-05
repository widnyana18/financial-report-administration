const Reporting = require("./models/reporting");
const Budget = require("./models/budget");
const { generatedId } = require("../../common/utils/id_gen");

exports.getAllReporting = async () => {
  // if (user.role === "admin") {
  return await Reporting.find();
  // }
  // return await Reporting.findOne({ opdId: id });
};

exports.getReportingById = async (id) => {
  try {
    return await Opd.findById(id);
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
  });

  try {
    return await reporting.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateReporting = async (reportId, input) => {
  try {
    return await Reporting.findOneAndUpdate({ _id: reportId }, input, {
      new: true,
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteReporting = async (id) => {
  return await Reporting.deleteOne({ _id: id });
};
