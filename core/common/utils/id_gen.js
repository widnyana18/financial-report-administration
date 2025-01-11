const dbhRealization = require("../../modules/dbh-realization/models/dbh-realization");

exports.createBudgetId = async (data) => {
  let dbhId;

  const latestBudget = await dbhRealization.findOne({
    parameter: data.parameter,
  }).sort({ createdAt: -1 });

  console.log("parentId", data.parentId);
  console.log("latestBudget", latestBudget);

  switch (data.parameter) {
    case "Lembaga":
      dbhId = generatedId(latestLembaga) ?? "LM01";
      break;
    case "Program":
      dbhId = generatedId(latestBudget) ?? `${data.parentId}.PG01`;
      break;
    case "Kegiatan":
      dbhId = generatedId(latestBudget) ?? `${data.parentId}.KG01`;
      break;
    default:
      dbhId = generatedId(latestBudget) ?? `${data.parentId}.SK01`;
      break;
  }
  console.log("DBH ID", dbhId);
  return dbhId;
};

const generatedId = (budget) => {
  if (!budget) {
    return null;
  }
  
  const id = budget._id;
  const regex = /\d+$/;
  const match = id.match(regex);
  const lastNumber = match[0];
  const numberInt = parseInt(lastNumber);
  const newNumberInt = numberInt + 1;

  const newBudgetId = id.replace(
    regex,
    newNumberInt.toString().padStart(lastNumber.length, "0")
  );

  return newBudgetId;
};
