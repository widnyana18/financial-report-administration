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
    if (!item.institutionName || !item.dbhBudget) {
      updateDataQuery.push({
        deleteOne: { filter: { _id: item._id } },
      });
    } else if (!item._id) {
      delete item._id;
      updateDataQuery.push({
        insertOne: {          
          document: { ...item },
        },
      });
    } else {
      updateDataQuery.push({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { ...item } },
        },
      });
    }
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
  const reporting = new Reporting({
    ...data,
    totalDbhRecieved: await calculateTotalDbhRecieved(data),
  });

  try {
    return await reporting.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateReporting = async (filter, data) => {
  try {
    return await Reporting.findOneAndUpdate(filter, {
      ...data,
      totalDbhRecieved: await calculateTotalDbhRecieved(data),
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteReporting = async (id) => {
  return await Reporting.deleteOne({ _id: id });
};

calculateTotalDbhRecieved = async (data) => {
  const getReportingByYear = await Reporting.find({
    year: data.year,
  });

  let sumLastDbhRecieved = Object.values(data.dbhRecieved).reduce(
    (acc, value) => parseInt(acc) + parseInt(value),
    0
  );

  getReportingByYear.forEach((item) => {
    sumLastDbhRecieved += item.totalDbhRecieved;
  });

  return sumLastDbhRecieved;
};
