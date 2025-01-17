const bcrypt = require("bcryptjs");

const opdService = require("./opd-service");
const reportingService = require("../reporting/reporting-service");

exports.renderUpdateOpd = async (req, res, next) => {
  const opdId = req.user._id;

  try {
    const selectedOpd = await opdService.getOpdById(opdId);

    if (!selectedOpd) {
      res.redirect("/login");
    } else {
      delete selectedOpd.password;

      res.render("auth/signup", {
        pageTitle: "Update OPD",
        domain: "opd",
        path: `/opd/edit/${opdId}`,
        selectedOpd,
      });
    }
  } catch (error) {
    return next(error);
  }
};

exports.findManyOpd = async (req, res, next) => {
  const opd = await opdService.findManyOpd();
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
    const hashedPassword = await bcrypt.hash(data.password, 12);

    if (!opd) {
      res.status(404).json({ message: "Opd not found" });
    }

    const successUpdateData = await opdService.updateOpd(
      { _id: opdId },
      { ...data, password: hashedPassword }
    );

    if (successUpdateData) {
      const lastDataDbhByOpd = await reportingService.findInstitutionBudget({
        opdId: opdId,
      });

      const lastReporting = await reportingService.findOneReporting({
        _id: lastDataDbhByOpd[lastDataDbhByOpd.length - 1]?.reportingId,
      });

      res.redirect(
        `/?triwulan=${lastReporting.period.trim()}&tahun=${
          lastReporting.year
        }&edit=false`
      );
    }
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
