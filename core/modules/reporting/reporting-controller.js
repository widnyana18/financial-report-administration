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
  res.render("reporting/reporting", {
    pageTitle: "Reporting",
    path: "/reporting",
    reportings: reportings,
  });
};

exports.renderReportingDetails = async (req, res, next) => {
  const id = req.params.id;
  const reporting = await reportingService.getReportingById(id);
  res.render("reporting/reporting-data-table", {
    pageTitle: "Reporting Details",
    path: "/reporting",
    reporting: reporting,
  });
};

exports.renderCreateReporting = (req, res, next) => {
  res.render("reporting/createReporting");
};

exports.renderUpdateReporting = async (req, res, next) => {
  const id = req.params.id;
  const reporting = await reportingService.getEmployeeById(id);

  if (!reporting) {
    res.redirect("/reportings");
  } else {
    res.render("reportings/update-reporting", {
      pageTitle: "Update Reporting",
      path: "/reporting",
      reporting: reporting,
    });
  }
};

exports.getAllReporting = async (req, res, next) => {
  try {
    const reportings = await reportingService.getAllReporting();
    return res.status(200).json(reportings);
  } catch (error) {
    return next(error);
  }
};

exports.getReportingById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const reporting = await reportingService.findReporting(id);
    return res.status(200).json(reporting);
  } catch (error) {
    return next(error);
  }
};

exports.createReporting = async (req, res, next) => {
  const data = req.body;
  try {
    const reporting = await reportingService.createReporting(data);
    return res.status(200).json(reporting);
  } catch (error) {
    return next(error);
  }
};

exports.updateReporting = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const reporting = await reportingService.findReporting(id);
    if (!reporting) {
      res.status(404).json({ message: "Reporting not found" });
    }
    const updatedReporting = await reportingService.updateReporting(
      { _id: id },
      data
    );
    return res.status(200).json(updatedReporting);
  } catch (error) {
    return next(error);
  }
};

exports.deleteReporting = async (req, res, next) => {
  const id = req.params.id;

  try {
    const deletedReporting = await reportingService.deleteReporting(id);
    return res.status(200).json(deletedReporting);
  } catch (error) {
    return next(error);
  }
};
