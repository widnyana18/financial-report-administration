const reportingService = require("../reporting/reporting-service");
const dbhRealizationService = require("./dbh-realization-service");
const { createBudgetId } = require("../../common/utils/id_gen");

exports.renderDataDbhOpd = async (req, res, next) => {
  let dbhName = req.params?.dbhName;
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

    // console.log("DBH REALIAZATION OPD", dbhRealizationOpd);

    if (query.edit && dbhName) {
      const dbhNameOri = dbhName.replace(/-/g, " ");
      const selectedDbh = await dbhRealizationService.getLastOneDbh({
        name: { $regex: dbhNameOri, $options: "i" },
      });

      console.log("SELECTED DBH ID = " + selectedDbh);

      res.render("dbh-opd/dbh-realization", {
        pageTitle: "Update Data DBH OPD",
        userRole: "opd",
        apiUrl: `edit/${selectedDbh._id}`,
        opd: req.user,
        opdReportingData,
        dbhRealizationOpd,
        currentReporting,
        selectedDbhRealization: selectedDbh,
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
      ...formData,
    };

    const currentReporting = await reportingService.findOneReporting({
      _id: formData.reportingId,
    });

    console.log("CURRENT REPORTING = " + currentReporting);

    const dbhAdded = await dbhRealizationService.addDbhRealization(dbhObjData);

    console.log(
      "FORM DATA = " + JSON.stringify(formData) + " DBH ADDED = " + dbhAdded
    );

    if (dbhAdded && dbhObjData.parameter == "Sub Kegiatan") {
      delete dbhObjData.selectedDbhId;
      const calculate = await dbhRealizationService.calculateTotalDbhOpd(
        dbhObjData
      );

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
  const formData = req.body.dbhRealization;

  try {
    const currentReporting = await reportingService.findOneReporting({
      _id: formData.reportingId,
    });

    const dbhUpdated = await dbhRealizationService.updateBudget(
      {
        _id: formData.selectedDbhId,
        opdId: req.user._id,
        reportingId: formData.reportingId,
      },
      formData
    );

    console.log(
      "FORM DATA = " + JSON.stringify(formData) + " DBH UPDATED = " + dbhUpdated
    );

    if (dbhUpdated && dbhUpdated.parameter == "Sub Kegiatan") {
      const calculateResult = await dbhRealizationService.calculateTotalDbhOpd({
        _id: formData.selectedDbhId,
        opdId: req.user._id,
        ...formData,
      });

      console.log("CALCULATE = " + calculateResult);
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

exports.deleteBudgetRecord = async (req, res, next) => {
  const formData = req.body;

  try {
    const deletedBudget = await dbhRealizationService.deleteBudget({
      _id: { $regex: new RegExp(`^${formData.dbhId}(\\..*)?$`) },
    });

    if (deletedBudget) {
      const calculateResult = await dbhRealizationService.calculateTotalDbhOpd({
        _id: formData.dbhId,
        opdId: req.user._id,
        reportingId: formData.reportingId,
      });
      console.log("CALCULATE = " + calculateResult);
    }

    // return res.status(200).json(deletedBudget);
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
