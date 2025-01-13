const opdService = require("./opd-service");
const reportingService = require("../reporting/reporting-service");

exports.renderUpdateOpd = async (req, res, next) => {
  const opdId = req.user._id;
  const institutionData = [];
  
  try {
    const selectedOpd = await opdService.getOpdById(opdId);
    const selectedInstitution = await reportingService.findInstitution({
      _id: selectedOpd.institutionId,
    });

    const allInstitution = await reportingService.findInstitution({});    

    allInstitution.forEach((item) => {
      if (!institutionData.includes(item.institutionName)) {
        institutionData.push(item);
      }
    });

    if (!selectedOpd) {
      res.redirect("/login");
    } else {
      delete selectedOpd.password;
      res.render("auth/signup", {
        pageTitle: "Update OPD",  
        domain: 'opd',      
        path: `/opd/edit/${opdId}`,
        institutionData,
        selectedOpd,
        selectedInstitution: selectedInstitution[0],
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
