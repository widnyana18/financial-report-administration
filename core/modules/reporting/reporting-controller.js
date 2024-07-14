const { Types } = require("mongoose");

const reportingService = require("./reporting-service");

const appName = process.env.APP_NAME;

exports.renderIndex = async (req, res, next) => {
  const reportings = await reportingService.getAllReporting();
  res.render("reporting/index", {
    pageTitle: appName,
    path: "/",
    reportings: reportings,
  });
};

exports.renderReportings = async (req, res, next) => {
  const employee = req.session.user;
  const reportings = await reportingService.getAllReporting();
  res.render("/reporting/reporting", {
    pageTitle: "My Laporan",
    path: "/laporan",
    reportings: reportings,
  });
};

exports.renderReportingDetails = async (req, res, next) => {
  const reportId = req.params.reportId;
  const reporting = await reportingService.findBudget({reportingId: reportId});
  res.render("reporting/reporting-details", {
    pageTitle: "Data Anggaran",
    path: "/laporan",
    reporting: reporting,
  });
};

exports.renderCreateReporting = (req, res, next) => {
  res.render("reporting/create-reporting", {
    pageTitle: "Buat Laporan Baru",
    path: "/laporan",
  });
};

exports.renderAddBudget = (req, res, next) => {
  res.render("reporting/add-budget", {
    pageTitle: "Tambah Data Anggaran",
    path: "/laporan",
  });
};

exports.renderUpdateBudgetRecord = async (req, res, next) => {
  const reportId = req.params.reportId;
  const reporting = await reportingService.findBudget({reportingId: reportId});

  if (!reporting) {
    res.redirect(`/laporan/${id}`);
  } else {
    res.render("reporting/update-budget-data", {
      pageTitle: "Update Data Anggaran",
      path: "/laporan",
      reporting: reporting,
    });
  }
};

exports.getAllReporting = async (req, res, next) => {
  // const employee = req.session.user;

  try {
    const reportings = await reportingService.getAllReporting();
    return res.status(200).json(reportings);
  } catch (error) {
    return next(error);
  }
};

exports.getAllBudgetByReporting = async (req, res, next) => {
  const reportId = req.params.reportId;
  try {
    const budgetData = await reportingService.findBudget({reportingId: reportId});
    return res.status(200).json(budgetData);
  } catch (error) {
    return next(error);
  }
};

exports.createReporting = async (req, res, next) => {
  const data = req.body;
  try {
    const reporting = await reportingService.createReporting(data);
    // res.redirect("/laporan");
    return res.status(200).json(reporting);
  } catch (error) {
    return next(error);
  }
};

exports.updateReporting = async (req, res, next) => {
  const reportId = req.params.reportId;
  const data = req.body;

  try {
    const reporting = await reportingService.findBudget({ reportingId: reportId });
    if (!reporting) {
      res.status(404).json({ message: "Reporting not found" });
    }
    const updatedReporting = await reportingService.updateReporting(
      reportId,
      data
    );
    return res.status(200).json(updatedReporting);
  } catch (error) {
    return next(error);
  }
};

exports.deleteReporting = async (req, res, next) => {
  const id = req.params.reportId;

  try {
    const deletedReporting = await reportingService.deleteReporting(id);
    return res.status(200).json(deletedReporting);
  } catch (error) {
    return next(error);
  }
};

exports.addBudget = async (req, res, next) => {
  const reportingId = new Types.ObjectId(req.params.reportId);    
  console.log("REEEEQQQ BOOODY: " + req.body[0]);
  
  try {
    const budgetData = await reportingService.addBudget(reportingId, req.body);
    return res.status(200).json(budgetData);
  } catch (error) {
    return next(error);
  }
};

exports.updateBudgetRecord = async (req, res, next) => {
  const budgetId = req.params.budgetId;
  const data = req.body;

  try {
    const budgetRecord = await reportingService.findBudget({ id: budgetId });
    if (!budgetRecord) {
      res.status(404).json({ message: "Reporting not found" });
    }
    const updatedBudget = await reportingService.updateBudget(
      budgetId,
      data
    );
    return res.status(200).json(updatedBudget);
  } catch (error) {
    return next(error);
  }
};

exports.deleteBudgetRecord = async (req, res, next) => {
  const budgetId = req.params.budgetId;

  try {
    const deletedBudget = await reportingService.deleteBudget(budgetId);
    return res.status(200).json(deletedBudget);
  } catch (error) {
    return next(error);
  }
};
