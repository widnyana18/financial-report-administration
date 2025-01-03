const Reporting = require("./models/reporting");
const Institution = require("../dbh-realization/models/institution");

exports.findInstitution = async (filter) => {
  try {
    return await Institution.find(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.insertInstitution = async (dataArray) => {
  try {
    return await Institution.insertMany(dataArray);
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateInstitution = async (dataArray) => {
  let updateDataQuery = [];
  dataArray.forEach((item) => {
    updateDataQuery.push({
      updateOne: { filter: { _id: item.id }, update: { $set: { ...item } } },
    });
  });

  try {
    return await Institution.bulkWrite(updateDataQuery);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteInstitution = async (filter) => {
  try {
    return await Institution.deleteMany({ _id: { $in: filter } });
  } catch (error) {
    throw new Error(error);
  }
};

exports.findOneReporting = async (filter) => {
  try {
    return await Reporting.findOne(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getLastReporting = async () => {
  try {
    return await Reporting.findOne().sort({ createdAt: -1 }).exec();
  } catch (error) {
    throw new Error(error);
  }
};

exports.findManyReporting = async (filter) => {  

  try {
    return await Reporting.find(filter);       
  } catch (error) {
    throw new Error(error);
  }
};

exports.createReporting = async (data) => {
 

  const getReportingByYear = await Reporting.find({
    year: data.year,
  });

  let totalSumDbh = Object.values(dbhRecieved).reduce(
    (acc, value) => acc + value,
    0
  );

  getReportingByYear.forEach((item) => {
    totalSumDbh += item.totalDbhRecieved;
  });

  console.log("Total Sum:", totalSumDbh); // Output: Total Sum: 1000

  const reporting = new Reporting({
    ...data,
    totalDbhRecieved: totalSumDbh,
  });

  try {
    return await reporting.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateReporting = async (filter, input) => {
  try {
    return await Reporting.findOneAndUpdate(filter, input);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteReporting = async (id) => {
  return await Reporting.deleteOne({ _id: id });
};
