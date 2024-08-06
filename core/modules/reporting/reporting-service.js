const Reporting = require("./models/reporting");

exports.getAllReporting = async () => {
  // if (user.role === "admin") {
  return await Reporting.find();
  // }
  // return await Reporting.findOne({ opdId: id });
};

exports.findReporting = async (filter) => {
  try {
    return await Opd.findById(filter);
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
