const { Types } = require("mongoose");

const reportingService = require("./reporting-service");
const dbhBudgetService = require("../dbh-budget/dbh-budget-service");

const appName = process.env.APP_NAME;

exports.renderIndex = async (req, res, next) => {
  const years = [];

  try {
    const allReporting = await reportingService.findManyReporting();
    const reportingByYear = await reportingService.findManyReporting({
      year: Number(req.query.tahun),
    });

    allReporting.forEach((item, index) => {
      const isYearAdded = years.includes(item.year);

      if (!isYearAdded) {
        years.push-(item.year);
      }
    });

    res.render("admin/reportings", {
      pageTitle: appName,
      years: years,
      reportingList: reportingByYear,
    });
  } catch (error) {}
};

exports.renderReportingDetails = async (req, res, next) => {
  const reportingId = new Types.ObjectId(req.params.reportId);
  console.log("REPORTING ID : " + reportingId);
  const reporting = await reportingService.findOneReporting({ _id: reportingId });
  const dbhBudget = await dbhBudgetService.findBudget({
    reportingId: reportingId,
  });

  res.render("admin/reporting-details", {
    pageTitle: reporting.title,    
    reporting: reporting,
    dbhBudgets: dbhBudget,
    userRole: 'admin'
  });
};

exports.renderCreateReporting = (req, res, next) => {
  res.render("admin/create-reporting", {
    pageTitle: "Buat Laporan Baru",
    apiRoute: "/api/laporan/add",
    selectedReporting: null,
  });
};

exports.renderUpdateReporting = async (req, res, next) => {
  const reportingId = new Types.ObjectId(req.params.reportingId);
  const reporting = await reportingService.findOneReporting({ _id: reportingId });

  if (!reporting) {
    res.redirect(`/admin/${reportingId}`);
  } else {
    res.render("admin/create-reporting", {
      pageTitle: "Update Data Anggaran",
      apiRoute: "/api/laporan/edit/" + reportingId,
      selectedReporting: reporting,
    });
  }
};

exports.getAllReporting = async (req, res, next) => {
  // const opd = req.session.user;
  const reportings = await reportingService.findManyReporting();
  return res.status(200).json(reportings);
};

exports.getReporting = async (req, res, next) => {
  // const opd = req.session.user;
  const reportingId = new Types.ObjectId(req.params.reportId);
  await dbhBudgetService.calculateBudget(reportingId);

  const reporting = await reportingService.findOneReporting({ _id: reportingId });
  return res.status(200).json(reporting);
};

exports.createReporting = async (req, res, next) => {
  const data = req.body;

  try {
    await reportingService.createReporting(data);
    res.redirect("/admin?tahun=" + data.year);    
  } catch (error) {
    return next(error);
  }
};

exports.updateReporting = async (req, res, next) => {
  const reportingId = new Types.ObjectId(req.params.reportId);
  const data = req.body;

  try {
    await reportingService.updateReporting(
      reportingId,
      data
    );
    res.redirect("/admin?tahun=" + data.year);
  } catch (error) {
    return next(error);
  }
};

exports.deleteReporting = async (req, res, next) => {
  const reportingId = new Types.ObjectId(req.params.reportId);

  try {
    const deletedReporting = await reportingService.deleteReporting(
      reportingId
    );
    return res.status(200).json(deletedReporting);
  } catch (error) {
    return next(error);
  }
};
