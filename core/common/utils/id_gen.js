const dbhRealizationService = require("../../modules/dbh-realization/dbh-realization-service");

exports.createBudgetId = async (data) => {
  let dbhId;

  const latestDbh = await dbhRealizationService.getLastOneDbh({
    _id: { $regex: new RegExp(data.parentParamId) },
    parameter: data.parameter,
    opdId: data.opdId,
    reportingId: data.reportingId,
  });

  console.log("LATEST DBH : " + latestDbh);

  if (latestDbh) {
    dbhId = generatedId(latestDbh._id);
  } else {
    switch (data.parameter) {
      case "Lembaga":
        const latestInstitution = await dbhRealizationService.getLastOneDbh({
          parameter: "Lembaga",
        });

        console.log("LATEST INSTITUTION : " + latestInstitution);
        dbhId = latestInstitution ? generatedId(latestInstitution._id) : "LM01";
        break;
      case "Program":
        const selectedInstitution = await dbhRealizationService.getLastOneDbh({
          opdId: data.opdId,
          reportingId: data.reportingId,
          parameter: "Lembaga",
        });

        dbhId = `${selectedInstitution._id}.PG01`;
        break;
      case "Kegiatan":
        dbhId = `${data.parentParamId}.KG01`;
        break;
      default:
        dbhId = `${data.parentParamId}.SK01`;
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
