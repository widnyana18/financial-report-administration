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

exports.addDbhBudget = async (data) => {
  const reporting = await reportingService.findReporting({
    period: data.period,
    year: data.year,
  });

  // const opdId = new Types.ObjectId(data.opdId);
  const budgetId = await createBudgetId(data);
  const dbhBudget = new DbhBudget({
    _id: budgetId,
    reportingId: reporting._id,
    opdId: data.opdId,
    noRek: data.noRek,
    parameter: data.parameter,
    name: data.name,
    pagu: data.pagu,
    dbh: data.dbh,
  });

  try {
    return await dbhBudget.save();
  } catch (error) {
    throw new Error(error);
  }
};

const createBudgetId = async (data) => {
  let budgetId;

  const latestBudget = await DbhBudget.findOne({
    parameter: data.parameter,
    _id: `/${data.parentId}/i`,
  });

  switch (data.parameter) {
    case "Lembaga":
      const latestLembaga = await DbhBudget.findOne({
        parameter: "Lembaga",
      }).sort({ createdAt: -1 });
      budgetId = generatedId(latestLembaga) ?? "LM01";
      break;
    case "Program":
      budgetId = generatedId(latestBudget) ?? `${data.parentId}PG01`;
      break;
    case "Kegiatan":
      budgetId = generatedId(latestBudget) ?? `${data.parentId}KG01`;
      break;
    default:
      budgetId = generatedId(latestBudget) ?? `${data.parentId}SK001`;
      break;
  }
  return budgetId;
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

exports.updateBudget = async (budgetId, input) => {
  try {
    return await DbhBudget.findOneAndUpdate({ _id: budgetId }, input, {
      new: true,
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteBudget = async (id) => {
  return await DbhBudget.deleteOne({ _id: id });
};
