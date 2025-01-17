const Opd = require("./models/opd");

exports.getOpdById = async (id) => {
  try {
    return await Opd.findOne({_id: id});
  } catch (error) {
    throw new Error(error);
  }
};

exports.findManyOpd = async (filter) => {
  return await Opd.find(filter);
};

exports.updateOpd = async (filter, data) => {
  const opd = await Opd.findOneAndUpdate(filter, data, {
    new: true,
  });
  return opd;
};

exports.deleteOpd = async (id) => {
  const opd = await Opd.findOneAndDelete({_id: id});
  return opd;
};
