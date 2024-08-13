const Opd = require("./opd");

exports.getOpdById = async (id) => {
  try {
    return await Opd.findOne({_id: id});
  } catch (error) {
    throw new Error(error);
  }
};

exports.getAllOpd = async () => {
  return await Opd.find();
};

exports.updateOpd = async (filter, input) => {
  const opd = await Opd.findOneAndUpdate(filter, input, {
    new: true,
  });
  return opd;
};

exports.deleteOpd = async (id) => {
  const opd = await Opd.findOneAndDelete({_id: id});
  return opd;
};
