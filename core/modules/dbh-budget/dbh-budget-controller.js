const reportingService = require("../reporting/reporting-service");
const opdService = require("../opd/opd-service");
const dbhBudgetService = require("./dbh-budget-service");

exports.renderDataDbhOpd = async (req, res, next) => {  
  const dbhId = req.params.dbhId;
  let dataDbhOpd = [];
  let periods = [];
  let years = [];
  const query = req.query;

  try {
    const opd = await opdService.getOpdById(req.user._id);
    const reportings = await reportingService.findManyReporting();

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

    const selectedReporting = await reportingService.findOneReporting({
      period: query.triwulan,
      year: Number(query.tahun),
    });

    if (selectedReporting !== null) {
      await dbhBudgetService.calculateBudget({
        opdId: req.user._id,
        reportingId: selectedReporting._id,
        parameter: "Program",
      });

      dataDbhOpd = await dbhBudgetService.findBudget({
        opdId: req.user._id,
        reportingId: selectedReporting._id,
      });
    }

    console.log("SELEECTT REPORTING : " + selectedReporting.period);

    // console.log("KEREEN : " + dataDbhOpd + "TYPE:" + typeof dataDbhOpd);
    console.log("EDITTT :" + query.edit);

    if (query.edit && dbhId) {
      const selectedDbh = await dbhBudgetService.findBudget({ _id: dbhId });

      res.render("dbh-opd/dbh-budget", {
        pageTitle: "Update Data DBH OPD",
        userRole: "opd",
        apiUrl: "api/dbh/add",
        opd: opd,
        selectedFilter: { period: query.triwulan, year: query.tahun },
        filters: { periods, years },
        dbhBudgets: dataDbhOpd,
        selectedDbh: selectedDbh[0],
      });
    } else {
      res.render("dbh-opd/dbh-budget", {
        pageTitle: "Data Dbh Opd",
        userRole: "opd",
        apiUrl: `api/dbh/edit/${dbhId}`,
        opd: opd,
        selectedDbh: null,
        selectedFilter: { period: query.triwulan, year: query.tahun },
        filters: { periods, years },
        dbhBudgets: dataDbhOpd,
      });
    }
  } catch (error) {}
};

exports.findAll = async (req, res, next) => {
  const dbhBudget = await dbhBudgetService.findBudget();
  return res.status(200).json(dbhBudget);
};

exports.findDbhBudgetOpd = async (req, res, next) => {  
  const query = req.query;
  let dataDbhOpd = [];

  try {
    const selectedReporting = await reportingService.findOneReporting({
      period: query.triwulan,
      year: Number(query.tahun),
    });

    if (selectedReporting !== null) {
      await dbhBudgetService.calculateBudget({
        opdId: req.user._id,
        reportingId: selectedReporting._id,
        parameter: "Program",
      });

      dataDbhOpd = await dbhBudgetService.findBudget({
        opdId: req.user._id,
        reportingId: selectedReporting._id,
      });
    }

    return res.status(200).json(dataDbhOpd);
  } catch (error) {}
};

exports.findDbhBudgetAdmin = async (req, res, next) => {
  const reportingId = params.reportId;

  try {
    await dbhBudgetService.calculateBudget({
      reportingId: reportingId,
      parameter: "Lembaga",
    });

    const dbhBudget = await dbhBudgetService.findBudget({
      reportingId: reportingId,
    });

    return res.status(200).json(dbhBudget);
  } catch (error) {}
};

exports.postAddBudget = async (req, res, next) => {  
  const data = {opdId: req.user._id, ...req.body };

  try {
    // console.log("TRIWULAN | TAHUN: " + data.period);
    const budgetData = await dbhBudgetService.addDbhBudget(data);
    console.log("BUDGET DATA : " + budgetData);
    res.redirect(`/?triwulan=${data.period}&tahun=${data.year}&edit=false`);
    // return res.status(200).json(budgetData);
  } catch (error) {
    return next(error);
  }
};

exports.updateBudgetRecord = async (req, res, next) => {
  const data = req.body;

  try {
    const budgetRecord = await dbhBudgetService.findBudget({
      _id: req.params.dbhId,
    });
    if (!budgetRecord) {
      res.status(404).json({ message: "Reporting not found" });
    }
    await dbhBudgetService.updateBudget(req, data);

    // return res.status(200).json(updatedBudget);
    res.redirect(`/?triwulan=${data.period}&tahun=${data.year}&edit=false`);
  } catch (error) {
    return next(error);
  }
};

exports.deleteBudgetRecord = async (req, res, next) => {
  try {
    const deletedBudget = await dbhBudgetService.deleteBudget(req);
    return res.status(200).json(deletedBudget);
  } catch (error) {
    return next(error);
  }
};
