const bcrypt = require("bcryptjs");

const opdService = require("./opd-service");
const reportingService = require("../reporting/reporting-service");

exports.renderUpdateOpd = async (req, res, next) => {
  const opdId = req.user._id;  
  const institution = [];          

  try {
    const selectedOpd = await opdService.getOpdById(opdId);
    const selectedInstitution = await reportingService.findInstitution({
      _id: selectedOpd.reportingId[0],
    });

        const getAllInstitution = await reportingService.findInstitution({});        
    
        getAllInstitution.forEach((item) => {
          if (!institution.includes(item.institutionName)) {
            institution.push(item.institutionName);
          }
        });

    if (!selectedOpd) {
      res.redirect("/login");
    } else {
      delete selectedOpd.password;

      res.render("auth/signup", {
        pageTitle: "Update OPD",
        domain: "opd",
        path: `/opd/edit/${opdId}`,
        institution,
        selectedOpd,
        selectedInstitution: selectedInstitution[0].institutionName,
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
    const getManyReportInstitution = await reportingService.findInstitution({
      institutionName: req.body.institution,
    });
    const reportingIdArr = getManyReportInstitution.map((item) => {
      return item.reportingId;
    });
    const hashedPassword = await bcrypt.hash(data.password, 12);

    if (!opd) {
      res.status(404).json({ message: "Opd not found" });
    }

    const successUpdateData = await opdService.updateOpd(
      { _id: opdId },
      { ...data, reportingId: reportingIdArr, password: hashedPassword }
    );

    if(successUpdateData){
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
