const DbhRealization = require("./models/dbh-realization");
const reportingService = require("../reporting/reporting-service");
const { Types } = require("mongoose");

exports.groupDbhByOpd = async (filter) => {
  // Aggregation pipeline to group and sort data by opdId
  const objReportId = new Types.ObjectId(filter.reportingId);

  return await DbhRealization.aggregate([
    {
      // Step 1: Optional - Filter by id if needed (you can remove this if not needed)
      $match: { reportingId: objReportId, opdId: { $in: filter.opds } },
    },
    {
      // Step 2: Sort the documents by opdId and other fields if needed (e.g., createdAt)
      $sort: { opdId: 1, createdAt: 1 }, // Sort by opdId and createdAt field within each group
    },
    {
      // Step 3: Group the documents by opdId
      $group: {
        _id: "$opdId", // Group by opdId
        data: { $push: "$$ROOT" }, // Push all documents in that group to a 'data' array
        totalDbhOpd: {
          $addToSet: {
            $cond: {
              if: { $eq: ["$parameter", "Lembaga"] },
              then: "$$ROOT",
              else: null,
            },
          },
        },
      },
    },
  ]);
};

exports.findBudget = async (filter) => {
  try {
    return await DbhRealization.find(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getLastOneDbh = async (filter) => {
  try {
    return await DbhRealization.findOne(filter).sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(error);
  }
};

exports.addDbhRealization = async (data) => {
  try {
    const dbhRealizationMod = new DbhRealization(data);
    return await dbhRealizationMod.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.calculateTotalDbhOpd = async (filter) => {
  console.log("FILTER = " + JSON.stringify(filter));
  const splitDbhId = filter._id.split(".");
  const lmIdIdx = splitDbhId[0];
  const pgIdIdx = splitDbhId[1] ?? "";
  const kgIdIdx = splitDbhId[2] ?? "";

  const selectedInstitutionId = lmIdIdx;
  const selectedProgramId = `${lmIdIdx}.${pgIdIdx}`;
  const selectedActivityId = `${lmIdIdx}.${pgIdIdx}.${kgIdIdx}`;

  console.log(
    "INsttitutId = " +
      selectedInstitutionId +
      " ## programId = " +
      selectedProgramId +
      " ## activityId = " +
      selectedActivityId
  );

  try {
    const activityDbhDataUpdated = await updateDbhDocByFilter({
      selectedId: selectedActivityId,
      selectedParam: "Kegiatan",
      selectedChildParam: "Sub Kegiatan",
      ...filter,
    });

    console.log("ACTIVITY = " + activityDbhDataUpdated);

    const programDbhDataUpdated = await updateDbhDocByFilter({
      selectedId: selectedProgramId,
      selectedParam: "Program",
      selectedChildParam: "Kegiatan",
      ...filter,
    });

    console.log(" ## PROGRAM = " + programDbhDataUpdated);

    const institutionDbhDataUpdated = await updateDbhDocByFilter({
      selectedId: selectedInstitutionId,
      selectedParam: "Lembaga",
      selectedChildParam: "Program",
      ...filter,
    });

    console.log(" ## LEMBAGA = " + institutionDbhDataUpdated);
  } catch (error) {
    throw new Error(error);
  }
};

const updateDbhDocByFilter = async (filter) => {
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
    const calculateDbhDocByFilter = await DbhRealization.aggregate([
      {
        $match: {
          _id: { $regex: new RegExp(filter.selectedId) },
          opdId: new Types.ObjectId(filter.opdId),
          reportingId: new Types.ObjectId(filter.reportingId),
          parameter: filter.selectedChildParam,
        },
      },
      {
        $group: {
          _id: null,
          ...sumDbhInAllDoc,
        },
      },
      {
        $project: { _id: 0, ...setTotalDbhField },
      },
    ]);

    console.log(
      "SUM DOC = " + JSON.stringify(calculateDbhDocByFilter, null, 2)
    );

    return await DbhRealization.findOneAndUpdate(
      {
        _id: filter.selectedId,
        opdId: filter.opdId,
        reportingId: filter.reportingId,
        parameter: filter.selectedParam,
      },
      calculateDbhDocByFilter[0] ?? {
        pagu: 0,
        dbh: {
          pkb: [0, 0],
          bbnkb: [0, 0],
          pbbkb: [0, 0],
          pap: [0, 0],
          pajakRokok: [0, 0],
        },
      },
      {
        new: true,
      }
    );
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateBudget = async (filter, data) => {
  try {
    return await DbhRealization.findOneAndUpdate(filter, data, {
      new: true,
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteBudget = async (filter) => {
  try {
    return await DbhRealization.deleteMany(filter);
  } catch (error) {}
};
