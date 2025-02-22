const { Types } = require("mongoose");

const Reporting = require("./models/reporting");
const InstitutionBudget = require("../dbh-realization/models/institution-budget");
const DbhRealization = require("../dbh-realization/models/dbh-realization");

exports.groupDbhByOpd = async (filter) => {
  return await DbhRealization.aggregate([
    {
      // Step 1: Optional - Filter by id if needed (you can remove this if not needed)
      $match: {
        reportingId: new Types.ObjectId(filter.reportingId),
        opdId: { $in: filter.opds },
      },
    },
    {
      // Step 2: Sort the documents by opdId and other fields if needed (e.g., createdAt)
      $sort: { _id: 1 }, // Sort by opdId and createdAt field within each group
    },
    {
      // Step 3: Group the documents by opdId
      $group: {
        _id: "$opdId", // Group by opdId
        data: {
          $push: {
            norek: "$norek",
            name: "$name",
            parameter: "$parameter",
            pagu: "$pagu",
            dbh: "$dbh",
          },
        },
        totalDbhOpd: {
          $first: {
            $cond: {
              if: { $eq: ["$parameter", "Lembaga"] },
              then: {
                pagu: "$pagu",
                dbh: "$dbh",
              },
              else: "$$REMOVE",
            },
          },
        },
      },
    },
  ]);
};

exports.findInstitutionBudget = async (filter) => {
  try {
    return await InstitutionBudget.find(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getLastOneInstitutionBudget = async (filter) => {
  try {
    return await InstitutionBudget.findOne(filter).sort({ createdAt: -1 });
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

exports.updateInstitutionBudget = async (filter, data) => {
  try {
    return await InstitutionBudget.updateOne(filter, data);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteOneInstitutionBudget = async (filter) => {
  try {
    return await InstitutionBudget.deleteOne(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteManyInstitutionBudget = async (filter) => {
  try {
    return await InstitutionBudget.deleteMany(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.findOneReporting = async (filter) => {
  try {
    return await Reporting.findOne(filter).sort({ createdAt: -1 });
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
    return await Reporting.find(filter).sort({ period: 1, year: 1 });
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
  return await Reporting.findByIdAndDelete(id);
};

exports.calculateTotalDbhReporting = async (reportingId) => {
  try {
    const sumAllDocInstitutionByReportId = await DbhRealization.aggregate([
      {
        $match: {
          reportingId: new Types.ObjectId(reportingId),
          parameter: "Lembaga",
        },
      },
      {
        $group: {
          _id: null,
          totalPagu: { $sum: "$pagu" },
          pkbBudgets: { $sum: { $arrayElemAt: ["$dbh.pkb", 0] } },
          pkbRealizations: { $sum: { $arrayElemAt: ["$dbh.pkb", 1] } },
          bbnkbBudgets: { $sum: { $arrayElemAt: ["$dbh.bbnkb", 0] } },
          bbnkbRealizations: { $sum: { $arrayElemAt: ["$dbh.bbnkb", 1] } },
          pbbkbBudgets: { $sum: { $arrayElemAt: ["$dbh.pbbkb", 0] } },
          pbbkbRealizations: { $sum: { $arrayElemAt: ["$dbh.pbbkb", 1] } },
          papBudgets: { $sum: { $arrayElemAt: ["$dbh.pap", 0] } },
          papRealizations: { $sum: { $arrayElemAt: ["$dbh.pap", 1] } },
          pajakRokokBudgets: {
            $sum: { $arrayElemAt: ["$dbh.pajakRokok", 0] },
          },
          pajakRokokRealizations: {
            $sum: { $arrayElemAt: ["$dbh.pajakRokok", 1] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalDbhBudget: {
            $add: [
              "$pkbBudgets",
              "$bbnkbBudgets",
              "$pbbkbBudgets",
              "$papBudgets",
              "$pajakRokokBudgets",
            ],
          },
          totalDbhRealization: {
            $add: [
              "$pkbRealizations",
              "$bbnkbRealizations",
              "$pbbkbRealizations",
              "$papRealizations",
              "$pajakRokokRealizations",
            ],
          },
          totalInstitutionDbh: {
            pagu: "$totalPagu",
            pkb: ["$pkbBudgets", "$pkbRealizations"],
            bbnkb: ["$bbnkbBudgets", "$bbnkbRealizations"],
            pbbkb: ["$pbbkbBudgets", "$pbbkbRealizations"],
            pap: ["$papBudgets", "$papRealizations"],
            pajakRokok: ["$pajakRokokBudgets", "$pajakRokokRealizations"],
          },
        },
      },
    ]);

    console.log(
      "sumAllDocInstitutionByReportId = " +
        JSON.stringify(sumAllDocInstitutionByReportId)
    );

    return await Reporting.findOneAndUpdate(
      { _id: reportingId },
      sumAllDocInstitutionByReportId[0]
    );
  } catch (error) {
    throw new Error(error);
  }
};
