const reportingService = require("../reporting/reporting-service");
const opdService = require("../opd/opd-service");
const dbhRealizationService = require("./dbh-realization-service");

exports.renderDataDbhOpd = async (req, res, next) => {
  const dbhId = req.params?.dbhId;
  let dataDbhOpd = [];
  let periods = [];
  const query = req.query;

  try {
    const opd = await opdService.getOpdById(req.user._id);
    const reportings = await reportingService.findManyReporting();

    if (reportings.length != 0) {
      reportings.forEach((item, index) => {
        periods.push(`${item.period} | ${item.year}`);
      });
    }

    if (query.triwulan) {
      const filter = query.triwulan.split("%20");
      const selectedReporting = await reportingService.findOneReporting({
        period: filter[0],
        year: Number(filter[1]),
      });

      if (selectedReporting != null) {
        dataDbhOpd = await dbhRealizationService.findBudget({
          opdId: req.user._id,
          reportingId: selectedReporting._id,
        });
      }
    }

    if (query.edit && dbhId) {
      const selectedDbh = await dbhRealizationService.findBudget({
        _id: dbhId,
      });

      res.render("dbh-opd/dbh-realization", {
        pageTitle: "Update Data DBH OPD",
        userRole: "opd",
        apiUrl: `api/dbh/edit/${dbhId}`,
        opd: opd,
        selectedFilter: `${query.triwulan} | ${query.tahun}`,
        filters: periods,
        dbhRealizations: dataDbhOpd,
        selectedDbh: selectedDbh[0],
      });
    } else {
      res.render("dbh-opd/dbh-realization", {
        pageTitle: "Data Dbh Opd",
        userRole: "opd",
        apiUrl: "api/dbh/add",
        opd: opd,
        selectedDbh: null,
        selectedFilter: `${query.triwulan} | ${query.tahun}`,
        filters: periods,
        dbhRealizations: dataDbhOpd,
      });
    }
  } catch (error) {}
};

exports.findAll = async (req, res, next) => {
  const dbhRealization = await dbhRealizationService.findBudget();
  return res.status(200).json(dbhRealization);
};

exports.findDbhRealizationOpd = async (req, res, next) => {
  const query = req.query;
  let dataDbhOpd = [];

  try {
    const selectedReporting = await reportingService.findOneReporting({
      period: query.triwulan,
      year: Number(query.tahun),
    });

    if (selectedReporting !== null) {
      await dbhRealizationService.calculateBudget({
        opdId: req.user._id,
        reportingId: selectedReporting._id,
        parameter: "Program",
      });

      dataDbhOpd = await dbhRealizationService.findBudget({
        opdId: req.user._id,
        reportingId: selectedReporting._id,
      });
    }

    return res.status(200).json(dataDbhOpd);
  } catch (error) {}
};

exports.postAddBudget = async (req, res, next) => {
  const data = { opdId: req.user._id, ...req.body };

  try {
    //
    await dbhRealizationService.addDbhRealization(data);
    res.redirect(`/?triwulan=${data.period.trim()} ${data.year}&edit=false`);
    // return res.status(200).json(budgetData);
  } catch (error) {
    return next(error);
  }
};

exports.updateBudgetRecord = async (req, res, next) => {
  const data = req.body;

  try {
    const budgetRecord = await dbhRealizationService.findBudget({
      _id: req.params.dbhId,
    });

    if (!budgetRecord) {
      res.status(404).json({ message: "Reporting not found" });
    }
    await dbhRealizationService.updateBudget(req, data);

    // return res.status(200).json(updatedBudget);
    res.redirect(`/?triwulan=${data.period.trim()} ${data.year}&edit=false`);
  } catch (error) {
    return next(error);
  }
};

exports.deleteBudgetRecord = async (req, res, next) => {
  try {
    const deletedBudget = await dbhRealizationService.deleteBudget(req);
    return res.status(200).json(deletedBudget);
  } catch (error) {
    return next(error);
  }
};

exports.postSendDbhOpdReporting = async (req, res, next) => {
  const opdId = req.user._id;
  const reportingId = req.body.reportingId;
  let selectedReportingUpdated;

  try {
    const dbhOpdCompleted = await reportingService.updateInstitution([
      {
        opdId,
        isCompleted: true,
      },
    ]);

    selectedReportingUpdated = await reportingService.updateReporting(
      { _id: reportingId },
      { totalDbhOpdAdded: selectedReporting.totalDbhOpdAdded++ }
    );

    const selectedReporting = await reportingService.findOneReporting({
      _id: reportingId,
    });

    if (selectedReporting.totalDbhOpdAdded >= selectedReporting.totalOpd) {
      selectedReportingUpdated = await reportingService.updateReporting(
        { _id: reportingId },
        { isDone: true }
      );
    }

    return res.status(200).json([dbhOpdCompleted, selectedReportingUpdated]);
  } catch (error) {
    return next(error);
  }
};
