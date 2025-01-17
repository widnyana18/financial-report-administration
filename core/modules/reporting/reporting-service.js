const Reporting = require("./models/reporting");
const InstitutionBudget = require("../dbh-realization/models/institution-budget");

exports.findInstitutionBudget = async (filter) => {
  try {
    return await InstitutionBudget.find(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.insertInstitutionBudget = async (dataArray) => {
  try {
    return await InstitutionBudget.insertMany(dataArray);
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateInstitutionBudget = async (dataArray) => {
  let updateDataQuery = [];

  dataArray.forEach((item) => {
    if (!item.opdId) {
      updateDataQuery.push({
        deleteOne: { filter: { _id: item._id } },
      });
    } else if (!item._id) {
      updateDataQuery.push({
        insertOne: {
          document: item,
        },
      });
    } else {
      updateDataQuery.push({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: item },
        },
      });
    }
  });

  try {
    return await InstitutionBudget.bulkWrite(updateDataQuery);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteInstitutionBudget = async (filter) => {
  try {
    return await InstitutionBudget.deleteMany({ _id: { $in: filter } });
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
  const reporting = new Reporting(data);

  try {
    return await reporting.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateReporting = async (filter, data) => {
  try {
    return await Reporting.findOneAndUpdate(filter, data);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteReporting = async (id) => {
  return await Reporting.deleteOne({ _id: id });
};
