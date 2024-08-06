const { Types } = require("mongoose");

const reportingService = require("./reporting-service");
const dbhBudgetService = require("../dbh-budget/dbh-budget-service");

const appName = process.env.APP_NAME;

exports.renderIndex = async (req, res, next) => {
  const reportings = await reportingService.getAllReporting();
  res.render("reporting/index", {
    pageTitle: appName,
    path: "/",
    reportings: reportings,
  });
};

exports.renderReportingDetails = async (req, res, next) => {
  const reportingId = new Types.ObjectId(req.params.reportId);
  const reporting = await reportingService.findReporting({_id: reportingId});
  const dbhBudget = await dbhBudgetService.getAllBudgetByReporting(reportingId);

  res.render("reporting/reporting-details", {
    pageTitle: req.body.title,
    path: "/admin",
    reporting: reporting,
    dbhBudget: dbhBudget,
  });
};

exports.renderCreateReporting = (req, res, next) => {
  res.render("reporting/create-reporting", {
    pageTitle: "Buat Laporan Baru",
    path: "/admin",
  });
};

exports.renderUpdateReporting = async (req, res, next) => {
  const reportingId = new Types.ObjectId(req.params.reportId);
  const reporting = await reportingService.findReporting({_id: reportingId});

  if (!reporting) {
    res.redirect(`/admin/${reportingId}`);
  } else {
    res.render("reporting/create-reporting", {
      pageTitle: "Update Data Anggaran",
      path: "/admin",
      reporting: reporting,
    });
  }
};

exports.getAllReporting = async (req, res, next) => {
  // const opd = req.session.user;
  const reportings = await reportingService.getAllReporting();
  return res.status(200).json(reportings);
};

exports.getReporting = async (req, res, next) => {
  // const opd = req.session.user;
  const reportingId = new Types.ObjectId(req.params.reportId);
  const reporting = await reportingService.findReporting({_id: reportingId});
  return res.status(200).json(reporting);
};

exports.createReporting = async (req, res, next) => {
  const data = req.body;
  try {
    const reporting = await reportingService.createReporting(data);
    // res.redirect("/admin");
    return res.status(200).json(reporting);
  } catch (error) {
    return next(error);
  }
};

exports.updateReporting = async (req, res, next) => {
  const reportingId = new Types.ObjectId(req.params.reportId);
  const data = req.body;

  try {
    const reporting = await reportingService.findBudget({
      reportingId: reportingId,
    });
    if (!reporting) {
      res.status(404).json({ message: "Reporting not found" });
    }
    const updatedReporting = await reportingService.updateReporting(
      reportingId,
      data
    );
    return res.status(200).json(updatedReporting);
  } catch (error) {
    return next(error);
  }
};

exports.deleteReporting = async (req, res, next) => {
  const reportingId = new Types.ObjectId(req.params.reportId);

  try {
    const deletedReporting = await reportingService.deleteReporting(reportingId);
    return res.status(200).json(deletedReporting);
  } catch (error) {
    return next(error);
  }
};