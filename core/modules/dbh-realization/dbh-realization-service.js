const DbhRealization = require("./models/dbh-realization");
const { createBudgetId } = require("../../common/utils/id_gen");
const reportingService = require("../reporting/reporting-service");
const { Types } = require("mongoose");

exports.groupDbhByOpd = async (filter) => {
  // Aggregation pipeline to group and sort data by opdId
  const objReportId = new Types.ObjectId(filter.reportingId);

  return await DbhRealization.aggregate([
    {
      // Step 1: Optional - Filter by id if needed (you can remove this if not needed)
      $match: { reportingId: objReportId, opdId: {$in: filter.opds} },
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

exports.addDbhRealization = async (data) => {
  const reporting = await reportingService.findOneReporting({
    period: data.period,
    year: data.year,
  });

  const dbhId = await createBudgetId(data);

  console.log("REPORTING ID :" + reporting);

  const dbhRealization = new DbhRealization({
    _id: dbhId,
    reportingId: reporting._id,
    opdId: data.opdId,
    noRek: data.noRek,
    parameter: data.parameter,
    name: data.name,
    pagu: data.pagu,
    dbh: {
      pkb: [data.pkbBudget, data.pkbRealization],
      bbnkb: [data.bbnkbBudget, data.bbnkbRealization],
      pbbkb: [data.pbbkbBudget, data.pbbkbRealization],
      pap: [data.papBudget, data.papRealization],
      pajakRokok: [data.pajakRokokBudget, data.pajakRokokRealization],
    },
  });

  console.log("DBH BUDGET : " + dbhRealization);

  try {
    const dbhAdded = await dbhRealization.save();

    console.log("DBH ADDED : " + dbhAdded);

    if (dbhAdded && data.parameter == "Sub Kegiatan") {
      const calculate = await this.calculateBudget({
        selectedSkId: new Types.ObjectId(dbhId),
        opdId: data.opdId,
        reportingId: reporting._id,
        selectedParam: data.parameter,
      });

      console.log("CALCULATE : " + calculate);
    }

    return dbhAdded;
  } catch (error) {
    throw new Error(error);
  }
};

exports.calculateBudget = async (filter) => {
  try {
    if (filter.selectedParam == "Sub Kegiatan") {
      const splitSkId = filter.selectedSkId.split(".");
      const lmIdIdx = splitSkId[0];
      const pgIdIdx = splitSkId[1];
      const kgIdIdx = splitSkId[2];

      const selectedInstitutionId = lmIdIdx;
      const selectedProgramId = `${lmIdIdx}.${pgIdIdx}`;
      const selectedActivityId = `${lmIdIdx}.${pgIdIdx}.${kgIdIdx}`;

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

      const sumAllDocSubActivityByActivity = await DbhRealization.aggregate([
        {
          $match: {
            _id: `/${selectedActivityId}/`,
            opdId: filter.opdId,
            reportingId: filter.reportingId,
            parameter: "Sub Kegiatan",
          },
        },
        {
          $group: { _id: null, ...sumDbhInAllDoc },
        },
        {
          $project: { _id: 0, ...setTotalDbhField },
        },
      ]);

      const activityDataUpdated = await DbhRealization.findOneAndUpdate(
        {
          _id: selectedActivityId,
          opdId: filter.opdId,
          reportingId: filter.reportingId,
          parameter: "Kegiatan",
        },
        sumAllDocSubActivityByActivity,
        {
          new: true,
        }
      );

      if (activityDataUpdated) {
        const sumAllDocActivityByProgram = await DbhRealization.aggregate([
          {
            $match: {
              _id: `/${selectedProgramId}/`,
              opdId: filter.opdId,
              reportingId: filter.reportingId,
              parameter: "Kegiatan",
            },
          },
          {
            $group: { _id: null, ...sumDbhInAllDoc },
          },
          {
            $project: { _id: 0, ...setTotalDbhField },
          },
        ]);

        const programDataUpdated = await DbhRealization.findOneAndUpdate(
          {
            _id: selectedProgramId,
            opdId: filter.opdId,
            reportingId: filter.reportingId,
            parameter: "Program",
          },
          sumAllDocActivityByProgram,
          {
            new: true,
          }
        );

        if (programDataUpdated) {
          const sumAllDocProgramByInstitution = await DbhRealization.aggregate([
            {
              $match: {
                _id: `/${selectedInstitutionId}/`,
                opdId: filter.opdId,
                reportingId: filter.reportingId,
                parameter: "Program",
              },
            },
            {
              $group: { _id: null, ...sumDbhInAllDoc },
            },
            {
              $project: { _id: 0, ...setTotalDbhField },
            },
          ]);

          return await DbhRealization.findOneAndUpdate(
            {
              _id: selectedInstitutionId,
              opdId: filter.opdId,
              reportingId: filter.reportingId,
              parameter: "Lembaga",
            },
            sumAllDocProgramByInstitution,
            {
              new: true,
            }
          );
        }
      }
    } else {
      const sumAllDocInstitutionByReportId = await DbhRealization.aggregate([
        {
          $match: {
            reportingId: filter.reportingId,
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

      return await reportingService.updateReporting(
        filter.reportingId,
        sumAllDocInstitutionByReportId
      );
    }
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateBudget = async (req, input) => {
  const opdId = req.user._id;

  console.log("DBH ID : " + req.params.dbhId);
  try {
    const reporting = await reportingService.findOneReporting({
      period: input.period,
      year: input.year,
    });

    const dbhUpdated = await DbhRealization.findOneAndUpdate(
      { _id: req.params.dbhId },
      {
        ...input,
        dbh: {
          pkb: [input.pkbBudget ?? 0, input.pkbRealization ?? 0],
          bbnkb: [input.bbnkbBudget ?? 0, input.bbnkbRealization ?? 0],
          pbbkb: [input.pbbkbBudget ?? 0, input.pbbkbRealization ?? 0],
          pap: [input.papBudget ?? 0, input.papRealization ?? 0],
          pajakRokok: [
            input.pajakRokokBudget ?? 0,
            input.pajakRokokRealization ?? 0,
          ],
        },
      },
      {
        new: true,
      }
    );

    if (dbhUpdated) {
      await this.calculateBudget({
        opdId: opdId,
        reportingId: reporting._id,
        parameter: input.parameter,
      });
    }
    return dbhUpdated;
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteBudget = async (req) => {
  const opdId = req.user._id;

  try {
    const reporting = await reportingService.findOneReporting({
      period: req.triwulan,
      year: req.tahun,
    });
    const dbh = await DbhRealization.findById(req.dbhId);
    const dbhDeleted = await DbhRealization.deleteOne({ _id: req.params.dbhId });

    if (dbhDeleted) {
      await this.calculateBudget({
        opdId: opdId,
        reportingId: reporting._id,
        parameter: dbh.parameter,
      });
    }

    return dbhDeleted;
  } catch (error) {}
};
