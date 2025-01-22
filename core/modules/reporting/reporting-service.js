const { Types } = require("mongoose");

const Reporting = require("./models/reporting");
const InstitutionBudget = require("../dbh-realization/models/institution-budget");
const DbhRealization = require("../dbh-realization/models/dbh-realization");

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

exports.calculateTotalDbhReporting = async (filter) => {
  const sumDbhInAllDoc = {
    pagu: { $sum: "$pagu" },
    pkbBudget: { $sum: { $arrayElemAt: ["$dbh.pkb", 0] } },
    pkbRealization: { $sum: { $arrayElemAt: ["$dbh.pkb", 1] } },
    bbnkbBudget: { $sum: { $arrayElemAt: ["$dbh.bbnkb", 0] } },
    bbnkbRealization: { $sum: { $arrayElemAt: ["$dbh.bbnkb", 1] } },
    pbbkbBudget: { $sum: { $arrayElemAt: ["$dbh.pbbkb", 0] } },
    pbbkbRealization: { $sum: { $arrayElemAt: ["$dbh.pbbkb", 1] } },
    papBudget: { $sum: { $arrayElemAt: ["$dbh.pap", 0] } },
    papRealization: { $sum: { $arrayElemAt: ["$dbh.pap", 1] } },
    pajakRokokBudget: {
      $sum: { $arrayElemAt: ["$dbh.pajakRokok", 0] },
    },
    pajakRokokRealization: {
      $sum: { $arrayElemAt: ["$dbh.pajakRokok", 1] },
    },
  };

  const setTotalDbhField = {
    pagu: "$pagu",
    dbh: {
      pkb: ["$pkbBudget", "$pkbRealization"],
      bbnkb: ["$bbnkbBudget", "$bbnkbRealization"],
      pbbkb: ["$pbbkbBudget", "$pbbkbRealization"],
      pap: ["$papBudget", "$papRealization"],
      pajakRokok: ["$pajakRokokBudget", "$pajakRokokRealization"],
    },
  };

  try {
    const sumAllDocInstitutionByReportId = await DbhRealization.aggregate([
      {
        $match: {
          reportingId: new Types.ObjectId(filter.reportingId),
          parameter: "Lembaga",
        },
      },
      {
        $group: {
          _id: null,
          ...sumDbhInAllDoc,
          totalDbhBudget: {
            $sum: [
              { $arrayElemAt: ["$dbh.pkb", 0] },
              { $arrayElemAt: ["$dbh.bbnkb", 0] },
              { $arrayElemAt: ["$dbh.pbbkb", 0] },
              { $arrayElemAt: ["$dbh.pap", 0] },
              { $arrayElemAt: ["$dbh.pajakRokok", 0] },
            ],
          },
          sumDbhRealization: {
            $sum: [
              { $arrayElemAt: ["$dbh.pkb", 1] },
              { $arrayElemAt: ["$dbh.bbnkb", 1] },
              { $arrayElemAt: ["$dbh.pbbkb", 1] },
              { $arrayElemAt: ["$dbh.pap", 1] },
              { $arrayElemAt: ["$dbh.pajakRokok", 1] },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalDbhBudget: 1,
          totalDbhRealization: 1,
          totalInstitutionDbh: setTotalDbhField,
        },
      },
    ]);

    return await Reporting.findOneAndUpdate(
      { _id: filter.reportingId },
      sumAllDocInstitutionByReportId[0]
    );
  } catch (error) {
    throw new Error(error);
  }
};
