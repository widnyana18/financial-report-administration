const bcrypt = require("bcryptjs");

const opdService = require("./opd-service");
const reportingService = require("../reporting/reporting-service");
const dbhRealizationService = require("../dbh-realization/dbh-realization-service");
const { encrypt } = require("../../common/utils/crypto-helper");

exports.renderUpdateOpd = async (req, res, next) => {
  const opdId = req.user._id.toString();

  try {
    const selectedOpd = await opdService.getOneOpd({ _id: opdId });

    if (!selectedOpd) {
      res.redirect("/login");
    } else {
      res.render("auth/signup", {
        pageTitle: "Update OPD",
        domain: "opd",
        path: `/opd/edit/${encrypt(opdId)}`,
        selectedOpd,
        message: req.flash(),
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
  const opdId = req.user._id;
  try {
    const opd = await opdService.getOneOpd({ _id: opdId });
    return res.status(200).json(opd);
  } catch (error) {
    return next(error);
  }
};

exports.updateOpd = async (req, res, next) => {
  const opd = req.user;
  const data = req.body;

  try {
    const pswIsMatch = await bcrypt.compare(data.password, opd.password);

    if (data.username == opd.username && pswIsMatch) {
      req.flash("error", "Data sudah pernah digunakan");
      res.redirect(`/${opd._id}/edit-profile`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const successUpdateData = await opdService.updateOpd(
      { _id: opd._id },
      { ...data, password: hashedPassword }
    );

    if (successUpdateData) {
      const lastDataDbhByOpd = await reportingService.findInstitutionBudget({
        opdId: opd._id,
      });

      const lastReporting = await reportingService.findOneReporting({
        _id: lastDataDbhByOpd[lastDataDbhByOpd.length - 1]?.reportingId,
      });

      req.flash("success", "Berhasil rubah profile");
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
  const opdId = req.user._id;

  try {
    const selectedInstitutionBudget =
      await reportingService.findInstitutionBudget({
        opdId,
      });

    for (data of selectedInstitutionBudget) {
      const currentReport = await reportingService.findOneReporting({
        _id: reportId,
      });
      await reportingService.updateReporting(
        { _id: currentReport?._id },
        {
          totalDbhOpdAdded: data.isCompleted
            ? currentReport.totalDbhOpdAdded - 1
            : currentReport.totalDbhOpdAdded,
          totalOpd: currentReport.totalOpd - 1,
        }
      );
    }

    await reportingService.deleteManyInstitutionBudget({
      opdId,
    });

    await dbhRealizationService.deleteBudget({
      opdId,
    });

    await opdService.deleteOpd(opdId);

    // req.flash("success", "Berhasil hapus akun");

    req.session.destroy((err) => {
      if (err) {
        return next(err); // <-- This might send another response in error handling middleware
      }
      res.status(200).json({ message: "Berhasil hapus akun" });
    });
  } catch (error) {
    return next(error);
  }
};
