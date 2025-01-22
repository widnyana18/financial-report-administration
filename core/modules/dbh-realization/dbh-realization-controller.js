const { Types } = require("mongoose");

const reportingService = require("../reporting/reporting-service");
const dbhRealizationService = require("./dbh-realization-service");
const { createBudgetId } = require("../../common/utils/id_gen");

exports.renderDataDbhOpd = async (req, res, next) => {
  const dbhId = req.params?.dbhId;
  const query = req.query;
  let dbhRealizationOpd = [];

  try {
    const opdInstitutionData = await reportingService.findInstitutionBudget({
      opdId: req.user._id,
    });
    const currentReporting = await reportingService.findOneReporting({
      period: query.triwulan,
      year: query.tahun,
    });
    const opdReportingData = await reportingService.findManyReporting({
      _id: { $in: opdInstitutionData.map((item) => item.reportingId) },
    });

    if (opdReportingData.length > 0) {
      dbhRealizationOpd = await Promise.all(
        opdReportingData.map(async (item) => {
          const dataDbhOpd = await dbhRealizationService.findBudget({
            opdId: req.user._id,
            reportingId: item._id,
          });

          return {
            reportingId: item._id.toString(),
            data: dataDbhOpd,
          };
        })
      ).then((result) => result);
    }

    if (query.edit && dbhId) {
      const selectedDbh = await dbhRealizationService.findBudget({
        _id: dbhId,
      });

      res.render("dbh-opd/dbh-realization", {
        pageTitle: "Update Data DBH OPD",
        userRole: "opd",
        apiUrl: `edit/${dbhId}`,
        opd: req.user,
        opdReportingData,
        dbhRealizationOpd,
        currentReporting,
        selectedDbhRealization: selectedDbh[0],
      });
    } else {
      res.render("dbh-opd/dbh-realization", {
        pageTitle: "Data Dbh Opd",
        userRole: "opd",
        apiUrl: "add",
        opd: req.user,
        opdReportingData,
        dbhRealizationOpd,
        currentReporting,
        selectedDbhRealization: null,
      });
    }
  } catch (error) {
    return next(error);
  }
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
      dataDbhOpd = await dbhRealizationService.findBudget({
        opdId: req.user._id,
        reportingId: selectedReporting._id,
      });
    }

    return res.status(200).json(dataDbhOpd);
  } catch (error) {
    return next(error);
  }
};

exports.postAddBudget = async (req, res, next) => {
  const formData = req.body.dbhRealization;

  console.log("CURRENT REPORTING = " + Object.keys(formData));

  try {
    const dbhId = await createBudgetId({ opdId: req.user._id, ...formData });
    const dbhObjData = {
      _id: dbhId,
      opdId: req.user._id,
      reportingId: formData.reportingId,
      ...formData,
    };

    const currentReporting = await reportingService.findOneReporting({
      _id: formData.reportingId,
    });

    console.log("CURRENT REPORTING = " + currentReporting);

    const dbhAdded = await dbhRealizationService.addDbhRealization(dbhObjData);

    if (dbhAdded && dbhObjData.parameter == "Sub Kegiatan") {
      const calculate = await dbhRealizationService.calculateTotalDbhOpd({
        selectedSkId: dbhId,
        ...dbhObjData,
      });

      console.log("CALCULATE : " + calculate);
    }

    res.redirect(
      `/?triwulan=${currentReporting.period.trim()}&tahun=${
        currentReporting.year
      }&edit=false`
    );
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
    const dbhOpdCompleted = await reportingService.updateInstitutionBudget([
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
