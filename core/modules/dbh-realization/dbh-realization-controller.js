const reportingService = require("../reporting/reporting-service");
const dbhRealizationService = require("./dbh-realization-service");
const { createBudgetId } = require("../../common/utils/id_gen");
const { encrypt, decrypt } = require("../../common/utils/crypto-helper");

exports.renderDataDbhOpd = async (req, res, next) => {
  let dbhId = req.params.dbhId ? decrypt(req.params.dbhId) : null;
  const query = req.query;
  let currentReporting = null;
  let opdReporting = [];
  let currentDataDbhOpd = [];

  const userData = { ...req.user, _id: encrypt(req.user._id.toString()) };

  try {
    const opdInstitutionData = await reportingService.findInstitutionBudget({
      opdId: req.user?._id,
    });
    // console.log("opdInstitutionData = " + JSON.stringify(opdInstitutionData));

    const currentReportingData = await reportingService.findOneReporting({
      period: query?.triwulan,
      year: query?.tahun,
    });

    if (currentReportingData) {
      currentReporting = {
        _id: encrypt(currentReportingData._id.toString()),
        period: currentReportingData.period,
        year: currentReportingData.year,
        title: currentReportingData.title,
      };
    }

    console.log("currentReportingData = " + JSON.stringify(currentReporting));

    const opdReportingData = await reportingService.findManyReporting({
      _id: { $in: opdInstitutionData.map((item) => item.reportingId) },
    });
    // console.log("opdReportingData = " + JSON.stringify(opdReportingData));

    if (opdReportingData) {
      opdReporting = opdReportingData.map((item) => {
        const { _id, period, year, title } = item;
        return {
          _id: encrypt(_id.toString()),
          period,
          year,
          title,
        };
      });
    }

    // console.log("opdReporting = " + JSON.stringify(opdReporting));

    const dataDbhOpd = await dbhRealizationService.findBudget({
      opdId: req.user?._id,
      reportingId: currentReportingData?._id,
    });

    if (dataDbhOpd) {
      currentDataDbhOpd = dataDbhOpd.map((item) => {
        const newItem = item.toObject();
        const { opdId, reportingId, ...others } = newItem;
        others._id = encrypt(others._id.toString());

        return others;
      });
    }

    // console.log(
    //   "currentDataDbhOpd = " + JSON.stringify(dataDbhOpd, null, 2)
    // );

    if (query.edit && dbhId) {
      const selectedDbh = await dbhRealizationService.getLastOneDbh({
        _id: dbhId,
      });

      const { opdId, reportingId, ...others } = selectedDbh;
      others._id = encrypt(others._id.toString());

      console.log("SELECTED DBH ID = " + selectedDbh);

      res.render("dbh-opd/dbh-realization", {
        pageTitle: "Update Data DBH OPD",
        userRole: "opd",
        apiUrl: `edit/${selectedDbh.name}`,
        opd: userData,
        opdReporting,
        currentDataDbhOpd,
        currentReporting,
        selectedDbhRealization: others,
        message: req.flash(),
      });
    } else {
      res.render("dbh-opd/dbh-realization", {
        pageTitle: "Data Dbh Opd",
        userRole: "opd",
        apiUrl: "add",
        opd: userData,
        opdReporting,
        currentDataDbhOpd,
        currentReporting,
        selectedDbhRealization: null,
        message: req.flash(),
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
  formData.parentParamId = decrypt(formData.parentParamId);
  formData.reportingId = decrypt(formData.reportingId);

  console.log("FORM DATA = " + JSON.stringify(formData));

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

    const dbhAdded = await dbhRealizationService.addOneDbh(dbhObjData);

    console.log(
      "FORM DATA = " + JSON.stringify(formData) + " DBH ADDED = " + dbhAdded
    );

    if (dbhAdded && dbhObjData.parameter == "Sub Kegiatan") {
      const calculate = await dbhRealizationService.calculateTotalDbhOpd(
        dbhObjData
      );

      console.log("CALCULATE : " + calculate);
    }

    req.flash("success", "Berhasil menambahkan data DBH");

    res.redirect(
      `/?triwulan=${currentReporting.period.trim()}&tahun=${
        currentReporting.year
      }&edit=false`
    );
  } catch (error) {
    req.flash("error", "Gagal menambah dbh, Error: " + error);
  }
};

exports.updateBudgetRecord = async (req, res, next) => {
  const dbhId = decrypt(req.params.dbhId);
  const formData = req.body.dbhRealization;
  formData.reportingId = decrypt(formData.reportingId);

  try {
    const currentReporting = await reportingService.findOneReporting({
      _id: formData.reportingId,
    });

    const dbhUpdated = await dbhRealizationService.updateBudget(
      {
        _id: dbhId,
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
        _id: dbhId,
        opdId: req.user._id,
        ...formData,
      });

      console.log("CALCULATE = " + calculateResult);
    }

    req.flash("success", "Berhasil update data DBH");

    res.redirect(
      `/?triwulan=${currentReporting.period.trim()}&tahun=${
        currentReporting.year
      }&edit=false`
    );
  } catch (error) {
    req.flash("error", "Gagal mengubah dbh, Error: " + error);
  }
};

exports.deleteBudgetRecord = async (req, res, next) => {
  const dbhId = decrypt(req.params.dbhId);

  try {
    const currentDbh = await dbhRealizationService.getLastOneDbh({
      _id: dbhId,
    });
    const deletedBudget = await dbhRealizationService.deleteBudget({
      _id: { $regex: new RegExp(`^${currentDbh._id}(\\..*)?$`) },
    });

    if (deletedBudget) {
      const calculateResult = await dbhRealizationService.calculateTotalDbhOpd({
        _id: dbhId,
        opdId: req.user._id,
        reportingId: currentDbh.reportingId,
      });
      console.log("CALCULATE = " + calculateResult);
    }

    req.flash("success", "Berhasil hapus data DBH");
    return res.status(200).json({ message: "Berhasil hapus dbh" });
  } catch (error) {
    req.flash("error", "Gagal hapus dbh, Error: " + error);
  }
};

exports.postSendDbhOpdReporting = async (req, res, next) => {
  const opdId = req.user._id;
  const reportingId = decrypt(req.body.reportingId);

  console.log("current reporting id = " + reportingId);

  try {
    const currentInstitutionDbh =
      await reportingService.getLastOneInstitutionBudget({
        opdId,
        reportingId,
      });

    const currentReporting = await reportingService.findOneReporting({
      _id: reportingId,
    });

    if (
      !currentInstitutionDbh.isCompleted &&
      currentReporting.totalDbhOpdAdded < currentReporting.totalOpd
    ) {
      await reportingService.updateReporting(
        { _id: reportingId },
        { totalDbhOpdAdded: currentReporting.totalDbhOpdAdded + 1 }
      );
    }

    const reportingAfterUpdate = await reportingService.findOneReporting({
      _id: reportingId,
    });

    console.log("REPORTING UPDATED = " + reportingAfterUpdate);

    if (
      reportingAfterUpdate.totalDbhOpdAdded >= reportingAfterUpdate.totalOpd
    ) {
      const reportingUpdated = await reportingService.updateReporting(
        { _id: reportingId },
        { isDone: true }
      );

      console.log("REPORTING UPDATED 2 = " + reportingUpdated);
    }

    await reportingService.updateInstitutionBudget(
      {
        opdId,
        reportingId,
      },
      { isCompleted: true }
    );

    return res.status(200).json({ message: "Berhasil kirim laporan" });
  } catch (error) {
    req.flash("error", "Gagal kirim laporan, Error: " + error);
  }
};
