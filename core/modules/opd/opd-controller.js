const { Types } = require("mongoose");

const opdService = require("./opd-service");

exports.renderUpdateOpd = async (req, res, next) => {
  const opdId = new Types.ObjectId(req.params.id);
  const opd = await opdService.getOpdById(opdId);

  if (!opd) {
    res.redirect("/login");
  } else {
    res.render("opd/create-opd", {
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
  const opdId = new Types.ObjectId(req.params.id);
  try {
    const opd = await opdService.getOpdById(opdId);
    return res.status(200).json(opd);
  } catch (error) {
    return next(error);
  }
};

exports.updateOpd = async (req, res, next) => {
  const opdId = new Types.ObjectId(req.params.id);
  const data = req.body;

  try {
    const opd = await opdService.getOpdById(opdId);
    if (!opd) {
      res.status(404).json({ message: "Opd not found" });
    }
    const updatedOpd = await opdService.updateOpd({ _id: opdId }, data);
    return res.status(200).json(updatedOpd);
  } catch (error) {
    return next(error);
  }
};

exports.deleteOpd = async (req, res, next) => {
  const opdId = new Types.ObjectId(req.params.id);

  try {
    const deletedOpd = await opdService.deleteOpd(opdId);
    return res.status(200).json(deletedOpd);
  } catch (error) {
    return next(error);
  }
};
