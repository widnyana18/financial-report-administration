const DbhRealization = require("../../modules/dbh-realization/models/dbh-realization");

exports.createBudgetId = async (data) => {
  let dbhId;

  const selectedInstitution = await DbhRealization.findOne({
    opdId: data.opdId,
    reportingId: data.reportingId,
    parameter: "Lembaga",
  }).sort({ createdAt: -1 });

  const latestDbh = await DbhRealization.findOne({
    _id: { $regex: new RegExp(data.parentParamId) },
    parameter: data.parameter,
    opdId: data.opdId,
    reportingId: data.reportingId,
  }).sort({ createdAt: -1 });

  console.log("parentParamId", data.parentParamId);

  if (latestDbh) {
    dbhId = generatedId(latestDbh._id);
    console.log("LATEST BUDGET ID = ", latestDbh._id);
  } else {
    switch (data.parameter) {
      case "Lembaga":
        dbhId = selectedInstitution
          ? generatedId(selectedInstitution._id)
          : "LM01";
        break;
      case "Program":
        dbhId = `${selectedInstitution._id}/PG01`;
        break;
      case "Kegiatan":
        dbhId = `${data.parentParamId}/KG01`;
        break;
      default:
        dbhId = `${data.parentParamId}/SK01`;
        break;
    }
  }
  console.log("DBH ID", dbhId);
  return dbhId;
};

const generatedId = (lastDbhId) => {
  if (!lastDbhId) {
    return null;
  }

  const id = lastDbhId;
  const regex = /\d+$/;
  const match = id.match(regex);
  const lastNumber = match[0];
  const numberInt = parseInt(lastNumber);
  const newNumberInt = numberInt + 1;

  const newDbhId = id.replace(
    regex,
    newNumberInt.toString().padStart(lastNumber.length, "0")
  );

  return newDbhId;
};
