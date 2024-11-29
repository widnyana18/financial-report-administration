const DbhBudget = require("./models/dbh-budget");
const { generatedId } = require("../../common/utils/id_gen");
const reportingService = require("../reporting/reporting-service");
const {Types} = require('mongoose');

exports.groupDbhByOpd = async (reportId) => {
  // Aggregation pipeline to group and sort data by opdId
  const objReportId = new Types.ObjectId(reportId);
  
  return await DbhBudget.aggregate([
    {
      // Step 1: Optional - Filter by id if needed (you can remove this if not needed)
      $match: { reportingId:  objReportId },
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
    return await DbhBudget.find(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.addDbhBudget = async (data) => {
  const reporting = await reportingService.findOneReporting({
    period: data.period,
    year: data.year,
  });

  const dbhId = await createBudgetId(data);

  console.log("REPORTING ID :" + reporting);

  const dbhBudget = new DbhBudget({
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

  console.log("DBH BUDGET : " + dbhBudget);

  try {
    const dbhAdded = await dbhBudget.save();

    if (data.parameter === "Lembaga") {
      await reportingService.updateReporting(reporting._id, {
        totalDbhOpdAdded: totalDbhOpdAdded + 1,
      });
    }

    console.log("DBH ADDED : " + dbhAdded);
    if (dbhAdded) {
      const calculate = await this.calculateBudget({
        opdId: opdId,
        reportingId: reporting._id,
        parameter: data.parameter,
      });

      console.log("CALCULATE : " + calculate);
    }

    return dbhAdded;
  } catch (error) {
    throw new Error(error);
  }
};

const createBudgetId = async (data) => {
  let dbhId;

  const latestBudget = await DbhBudget.findOne({
    parameter: data.parameter,
  }).sort({ createdAt: -1 });

  console.log("parentId", data.parentId);
  console.log("latestBudget", latestBudget);

  switch (data.parameter) {
    case "Lembaga":
      dbhId = generatedId(latestLembaga) ?? "LM01";
      break;
    case "Program":
      dbhId = generatedId(latestBudget) ?? `${data.parentId}PG01`;
      break;
    case "Kegiatan":
      dbhId = generatedId(latestBudget) ?? `${data.parentId}KG01`;
      break;
    default:
      dbhId = generatedId(latestBudget) ?? `${data.parentId}SK001`;
      break;
  }
  console.log("DBH ID", dbhId);
  return dbhId;
};

exports.calculateBudget = async (filter) => {
  try {
    const selectedBudgetList = await DbhBudget.find(filter);
    
    let pagu = 0;
    let pkbBudget = 0;
    let pkbRealization = 0;
    let bbnkbBudget = 0;
    let bbnkbRealization = 0;
    let pbbkbBudget = 0;
    let pbbkbRealization = 0;
    let papBudget = 0;
    let papRealization = 0;
    let pajakRokokBudget = 0;
    let pajakRokokRealization = 0;

    for (let item of selectedBudgetList) {
      pagu += item.pagu;
      pkbBudget += item.dbh.pkb[0];
      pkbRealization += item.dbh.pkb[1];
      bbnkbBudget += item.dbh.bbnkb[0];
      bbnkbRealization += item.dbh.bbnkb[1];
      pbbkbBudget += item.dbh.pbbkb[0];
      pbbkbRealization += item.dbh.pbbkb[1];
      papBudget += item.dbh.pap[0];
      papRealization += item.dbh.pap[1];
      pajakRokokBudget += item.dbh.pajakRokok[0];
      pajakRokokRealization += item.dbh.pajakRokok[1];
    }

    const totalDbh = {
      pagu: pagu,
      pkb: [pkbBudget, pkbRealization],
      bbnkb: [bbnkbBudget, bbnkbRealization],
      pbbkb: [pbbkbBudget, pbbkbRealization],
      pap: [papBudget, papRealization],
      pajakRokok: [pajakRokokBudget, pajakRokokRealization],
    };    

    if (filter.parameter == "Program") {
      return await DbhBudget.findOneAndUpdate(
        {
          opdId: filter.opdId,
          reportingId: filter.reportingId,
          parameter: "Lembaga",
        },
        totalDbh,
        {
          new: true,
        }
      );
    } else {      
      const sumDbhBudget = totalDbh.pkb[0] + totalDbh.bbnkb[0] + totalDbh.pbbkb[0] + totalDbh.pap[0] + totalDbh.pajakRokok[0];
      const sumDbhRealization = totalDbh.pkb[1] + totalDbh.bbnkb[1] + totalDbh.pbbkb[1] + totalDbh.pap[1] + totalDbh.pajakRokok[1];

      return await reportingService.updateReporting(filter.reportingId, {
        totalDbhBudget: sumDbhBudget,
        totalDbhRealization: sumDbhRealization,
        totalInstitutionDbh: totalDbh,
      });
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

    const dbhUpdated = await DbhBudget.findOneAndUpdate(
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
    const dbh = await DbhBudget.findById(req.dbhId);
    const dbhDeleted = await DbhBudget.deleteOne({ _id: req.params.dbhId });

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
