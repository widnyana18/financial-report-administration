const { Types } = require("mongoose");

const opdService = require("./opd-service");

exports.renderUpdateOpd = async (req, res, next) => {
  const opdId = req.user._id;
  const opd = await opdService.getOpdById(opdId);

  if (!opd) {
    res.redirect("/login");
  } else {
    res.render("dbh-opd/update-profile", {
      pageTitle: "Update Opd",
      path: "/opd",
      opd: opd,
    });
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

    res.redirect("/?triwulan=Triwulan%20II&tahun=2024&edit=false");
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
