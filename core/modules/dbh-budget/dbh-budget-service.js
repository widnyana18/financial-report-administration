const DbhBudget = require("./models/dbh-budget");
const { generatedId } = require("../../common/utils/id_gen");
const reportingService = require("../reporting/reporting-service");

const { Types } = require("mongoose");

exports.findBudget = async (filter) => {
  try {
    return await DbhBudget.find(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.addDbhBudget = async (req, data) => {
  const reporting = await reportingService.findReporting({
    period: req.triwulan,
    year: req.tahun,
  });

  // const opdId = new Types.ObjectId(data.opdId);
  const dbhId = await createBudgetId(data);
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

  try {
    const dbhAdded = await dbhBudget.save();

    if (dbhAdded && data.parameter === "Program") {
      await dbhBudgetService.calculateBudget({
        opdId: opdId,
        reportingId: reporting._id,
        parameter: data.parameter,
      });
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
    _id: `/${data.parentId}/i`,
  });

  switch (data.parameter) {
    case "Lembaga":
      const latestLembaga = await DbhBudget.findOne({
        parameter: "Lembaga",
      }).sort({ createdAt: -1 });
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
      return await reportingService.updateReporting(filter.reportingId, {
        totalInstitutionDbh: totalDbh,
      });
    }
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateBudget = async (req, input) => {
  const opdId = new Types.ObjectId("66b4959610753739b55d62e9");

  try {
    const reporting = await reportingService.findReporting({
      period: req.query.triwulan,
      year: req.query.tahun,
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
          pajakRokok: [input.pajakRokokBudget ?? 0, input.pajakRokokRealization ?? 0],
        },
      },
      {
        new: true,
      }
    );

    if (dbhUpdated && input.parameter === "Program") {
      await dbhBudgetService.calculateBudget({
        opdId: opdId,
        reportingId: reporting._id,
        parameter: data.parameter,
      });
    }
    return dbhUpdated;
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteBudget = async (req) => {
  const opdId = new Types.ObjectId("66b4959610753739b55d62e9");

  try {
    const reporting = await reportingService.findReporting({
      period: req.triwulan,
      year: req.tahun,
    });
    const dbh = await DbhBudget.findById(req.dbhId);
    const dbhDeleted = await DbhBudget.deleteOne({ _id: req.params.dbhId });

    if (dbhDeleted && dbh.parameter === "Program") {
      await dbhBudgetService.calculateBudget({
        opdId: opdId,
        reportingId: reporting._id,
        parameter: dbh.parameter,
      });
    }

    return dbhDeleted;
  } catch (error) {}
};
