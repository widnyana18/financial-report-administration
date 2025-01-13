const opdService = require("./opd-service");
const institutionService = require("../reporting/reporting-service");

exports.renderUpdateOpd = async (req, res, next) => {
  const opdId = req.user._id;
  const opd = await opdService.getOpdById(opdId);
  const institution = await institutionService.findInstitution({_id: opd.institutionId});

  try {
    if (!opd) {
      res.redirect("/login");
    } else {
      res.render("auth/signup", {
        pageTitle: "Update Opd",
        selectedOpd: opd,
        selectedInstitution: institution,
      });
    }
  } catch (error) {
    return next(error);
  }
};

exports.getAllOpd = async (req, res, next) => {
  const opd = await opdService.getAllOpd();
  return res.status(200).json(opd);
};

exports.getOpd = async (req, res, next) => {
  const opdId = req.params.id;
  try {
    const opd = await opdService.getOpdById(opdId);
    return res.status(200).json(opd);
  } catch (error) {
    return next(error);
  }
};

exports.updateOpd = async (req, res, next) => {
  const opdId = req.params.id;
  const data = req.body;

  try {
    const opd = await opdService.getOpdById(opdId);
    if (!opd) {
      res.status(404).json({ message: "Opd not found" });
    }
    await opdService.updateOpd({ _id: opdId }, data);

    const lastDataDbhByOpd = await dbhRealizationService.findBudget({
      opdId: opdId,
    });

    const lastReporting = await reportingService.findOneReporting({
      _id: lastDataDbhByOpd[lastDataDbhByOpd.length - 1]?.reportingId,
    });

    res.redirect(
      `/?triwulan=${lastReporting.period.trim()} ${
        lastReporting.year
      }&edit=false`
    );
  } catch (error) {
    return next(error);
  }
};

exports.deleteOpd = async (req, res, next) => {
  const opdId = req.params.id;

  try {
    const deletedOpd = await opdService.deleteOpd(opdId);
    return res.status(200).json(deletedOpd);
  } catch (error) {
    return next(error);
  }
};
