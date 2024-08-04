const Reporting = require("./models/reporting");
const Budget = require("./models/budget");
const { generatedId } = require("../../common/utils/id_gen");

exports.getAllReporting = async () => {
  // if (user.role === "admin") {
  return await Reporting.find();
  // }
  // return await Reporting.findOne({ opdId: id });
};

exports.findBudget = async (filter) => {
  try {
    return await Budget.find(filter);
  } catch (error) {
    throw new Error(error);
  }
};

exports.createReporting = async (data) => {
  const reporting = new Reporting({
    title: data.title,
    opdId: data.opdId,
    period: data.period ?? "January - Maret",
    year: data.year ?? "2024",
  });

  try {
    return await reporting.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateReporting = async (reportId, input) => {
  try {
    return await Reporting.findOneAndUpdate({ _id: reportId }, input, {
      new: true,
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteReporting = async (id) => {
  return await Reporting.deleteOne({ _id: id });
};

exports.addBudget = async (reportingId, data) => {
  try {
    const budgetData = await createBudgetId(reportingId, data);
    console.log("BUDGET DATA : " + budgetData[0]);
    return await Budget.insertMany(budgetData);
  } catch (error) {
    throw new Error(error);
  }
};

const createBudgetId = async (reportingId, data) => {
  let budgetId;
  const budgetData = [];

  const lembaga = await Budget.findOne({
    parameter: "Lembaga",
  }).sort({ createdAt: -1 });
  const program = await Budget.findOne({
    parameter: "Program",
  }).sort({ createdAt: -1 });
  const kegiatan = await Budget.findOne({
    parameter: "Kegiatan",
  }).sort({ createdAt: -1 });
  const subKegiatan = await Budget.findOne({
    parameter: "Sub Kegiatan",
  }).sort({ createdAt: -1 });

  let institutionId = lembaga.id ?? "LM01";
  let programId = program.id ?? `${institutionId}PG01`;
  let activityId = kegiatan.id ?? `${programId}KG01`;
  let subActivityId = subKegiatan.id ?? `${activityId}SK001`;

  for (const item of data) {
    switch (item.parameter) {
      case "Lembaga":
        budgetId = generatedId(institutionId);
        institutionId = budgetId;
        programId = `${institutionId}PG01`;
        activityId = `${programId}KG01`;
        subActivityId = `${activityId}SK001`;
        break;
      case "Program":
        budgetId = generatedId(programId);
        programId = budgetId;
        activityId = `${programId}KG01`;
        subActivityId = `${activityId}SK001`;
        break;
      case "Kegiatan":
        budgetId = generatedId(activityId);
        activityId = budgetId;
        subActivityId = `${activityId}SK001`;
        break;
      default:
        budgetId = generatedId(subActivityId);
        subActivityId = budgetId;
        break;
    }

    console.log("CHECK BUDGET ID: " + budgetId);
    console.log("CHECK BUDGET ROW: " + item);

    budgetData.push({
      id: budgetId,
      reportingId: reportingId,
      ...item,
    });
  }
  console.log("CHECK BUDGET DATA: " + budgetData[1]);

  return budgetData;
};

exports.calculateBudget = async (budgetId) => {
  try {
    Budget.createIndexes({ id: "input" });
    const subTotalLembaga = await Budget.find({
      $input: { $search: budgetId },
      parameter: "Lembaga",
    });
    const newBudget = await subTotalLembaga.map((item) => {
      const paguInduk = item.reduce((total, obj) => total + obj.paguInduk, 0);
      const paguPerubahan = item.reduce(
        (total, obj) => total + obj.paguPerubahan,
        0
      );
      return Budget.findOneAndUpdate(
        { id: budgetId },
        { paguInduk, paguPerubahan },
        {
          new: true,
        }
      );
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateBudget = async (budgetId, input) => {
  try {
    return await Budget.findOneAndUpdate({ id: budgetId }, input, {
      new: true,
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteBudget = async (id) => {
  return await Budget.deleteOne({ id: id });
};
