const DbhBudget = require("./model/dbh-budget");
const { generatedId } = require("../../common/utils/id_gen");
const reportingService = require("../reporting/reporting-service");

exports.findBudget = async (filter) => {
  try {
    return await DbhBudget.find(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.addBudget = async (reportingId, opdId, data) => {
  const budgetId = await createBudgetId(reportingId, data);
  const dbhBudget = new DbhBudget({
    _id: budgetId,
    reportingId: reportingId,
    opdId: opdId,
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

  const budget = await DbhBudget.findOne({
    parameter: data.parameter,
    _id: `/${data.parentId}/`,
  });

  switch (data.parameter) {
    case "Lembaga":
      const lembaga = await DbhBudget.findOne({
        parameter: "Lembaga",
      }).sort({ createdAt: -1 });

      budgetId = generatedId(lembaga._id) ?? "LM01";
      break;
    case "Program":
      budgetId = generatedId(budget._id) ?? `${data.parentId}PG01`;
      break;
    case "Kegiatan":
      budgetId = generatedId(budget._id) ?? `${data.parentId}KG01`;
      break;
    default:
      budgetId = generatedId(budget._id) ?? `${data.parentId}SK001`;
      break;
  }
  return budgetId;
};

exports.calculateBudget = async (reportId) => {
  try {
    const institutionBudgetList = await DbhBudget.find({
      parameter: "Lembaga"
    });

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

    for (let item of institutionBudgetList) {
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

    const totalInstitutionDbh = {
      pagu: pagu,
      pkb: [pkbBudget, pkbRealization],
      bbnkb: [bbnkbBudget, bbnkbRealization],
      pbbkb: [pbbkbBudget, pbbkbRealization],
      pap: [papBudget, papRealization],
      pajakRokok: [pajakRokokBudget, pajakRokokRealization],
    };

    return await reportingService.updateReporting(reportId, {
      totalInstitutionDbh: totalInstitutionDbh,
    });
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
