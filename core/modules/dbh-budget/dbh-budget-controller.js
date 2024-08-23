const reportingService = require("../reporting/reporting-service");
const opdService = require("../opd/opd-service");
const dbhBudgetService = require("./dbh-budget-service");

const { Types } = require("mongoose");

exports.renderDataDbhOpd = async (req, res, next) => {
  const opdId = new Types.ObjectId("66b4959610753739b55d62e9");
  const dbhId = req.params.dbhId;
  let dataDbhOpd = [];
  let periods = [];
  let years = [];
  const query = req.query;

  const opd = await opdService.getOpdById(opdId);
  const reportings = await reportingService.getAllReporting();

  reportings.forEach((item, index) => {
    const isPeriodAdded = periods.includes(item.period);
    const isYearAdded = years.includes(item.year);

    if (!isPeriodAdded) {
      periods.push(item.period);
    }

    if (!isYearAdded) {
      years.push(item.year);
    }
  });

  const selectedReporting = await reportingService.findReporting({
    period: query.triwulan,
    year: Number(query.tahun),
  });

  if (selectedReporting !== null) {
    const result = await dbhBudgetService.findBudget({
      opdId: opdId,
      reportingId: selectedReporting._id ?? "",
    });

    dataDbhOpd = JSON.stringify(result);
  }

  console.log("SELEECTT REPORTING : " + selectedReporting);

  console.log("KEREEN : " + dataDbhOpd + "TYPE:" + typeof dataDbhOpd);
  console.log(dbhBudgetService);

  if (query.edit === true && dbhId) {
    const selectedDbh = await dbhBudgetService.findBudget({ _id: dbhId });

    res.render("dbh-opd/dbh-budget", {
      pageTitle: "Update Data DBH OPD",
      path: "/",
      opd: opd,
      filter: { period: query.triwulan, year: query.tahun },
      selectedDbh: selectedDbh,
      dbhBudget: { reportingData: { periods, years }, dataDbhOpd },
    });
  } else {
    res.render("dbh-opd/dbh-budget", {
      pageTitle: "Data Dbh Opd",
      path: "/",
      opd: opd,
      filter: { period: query.triwulan, year: query.tahun },
      dbhBudget: { reportingData: { periods, years }, dataDbhOpd },
    });
  }
};

// exports.filterDbhBudget = async (req, res, next) => {
//   let dataDbhOpd = [];
//   const data = req.body;
//   const selectedReporting = await reportingService.findReporting({
//     period: data.period,
//     year: data.year,
//   });

//   if (selectedReporting !== null) {
//     dataDbhOpd = await dbhBudgetService.findBudget({
//       opdId: opdId,
//       reportingId: selectedReporting._id,
//     });
//   }

//   return res.status(200).json(dataDbhOpd);
// };

exports.findAll = async (req, res, next) => {
  const dbhBudget = await dbhBudgetService.findBudget();
  return res.status(200).json(dbhBudget);
};

exports.findDbhBudgetOpd = async (req, res, next) => {
  // const opdId = req.opd._id;
  const opdId = new Types.ObjectId(req.params.opdId);
  const dbhBudget = await dbhBudgetService.findBudget({ opdId: opdId });
  return res.status(200).json(dbhBudget);
};

exports.findDbhBudgetAdmin = async (req, res, next) => {
  const reportingId = new Types.ObjectId(req.params.reportId);
  const dbhBudget = await dbhBudgetService.findBudget({
    reportingId: reportingId,
  });
  return res.status(200).json(dbhBudget);
};

exports.postAddBudget = async (req, res, next) => {
  const opdId = new Types.ObjectId("66b4959610753739b55d62e9");
  // const opdId = req.opd._id;
  const data = req.body;
  const reqData = {
    parentId: data.parentId,
    period: data.period,
    year: data.year,
    opdId: opdId,
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
  };

  console.log("FILTER : " + data.period, data.year, req.body);

  try {
    const budgetData = await dbhBudgetService.addDbhBudget(reqData);
    console.log("BUDGET GESS: " + budgetData);
    if (budgetData) {
      res.redirect(`/?triwulan=${data.period}&tahun=${data.year}&edit=false`);
    }
    // return res.status(200).json(budgetData);
  } catch (error) {
    return next(error);
  }
};

exports.updateBudgetRecord = async (req, res, next) => {
  const budgetId = req.params.budgetId;
  const data = req.body;

  try {
    const budgetRecord = await dbhBudgetService.findBudget({ id: budgetId });
    if (!budgetRecord) {
      res.status(404).json({ message: "Reporting not found" });
    }
    const updatedBudget = await dbhBudgetService.updateBudget(budgetId, data);
    return res.status(200).json(updatedBudget);
  } catch (error) {
    return next(error);
  }
};

exports.deleteBudgetRecord = async (req, res, next) => {
  const budgetId = req.params.budgetId;

  try {
    const deletedBudget = await dbhBudgetService.deleteBudget(budgetId);
    return res.status(200).json(deletedBudget);
  } catch (error) {
    return next(error);
  }
};
