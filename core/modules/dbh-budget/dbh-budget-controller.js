const dbhBudgetService = require("./dbh-budget-service");

const { Types } = require("mongoose");

exports.renderDataDbhOpd = async (req, res, next) => {
  const opdId = req.opd._id;
  const dataDbhOpd = await dbhBudgetService.findBudget({ opdId: opdId });

  const dbhId = req.body.dbhId;
  const selectedDbh = await dbhBudgetService.findBudget({ _id: dbhId });

  if (req.query.edit === true) {
    res.render("dbh-budget/data-dbh", {
      pageTitle: req.opd.institution,
      path: "/",
      selectedDbh: selectedDbh,
      dbhBudget: dataDbhOpd,
    });
  } else {
    res.render("dbh-budget/data-dbh", {
      pageTitle: req.opd.institution,
      path: "/",
      dbhBudget: dataDbhOpd,
    });
  }
};

exports.findAll = async (req, res, next) => {      
  const dbhBudget = await dbhBudgetService.findBudget();
  return res.status(200).json(dbhBudget);
};

exports.findDbhBudgetOpd = async (req, res, next) => {    
  // const opdId = req.opd._id;
  const opdId = new Types.ObjectId(req.params.opdId);
  const dbhBudget = await dbhBudgetService.findBudget({opdId: opdId});
  return res.status(200).json(dbhBudget);
};

exports.findDbhBudgetAdmin = async (req, res, next) => {      
  const reportingId = new Types.ObjectId(req.params.reportId);
  const dbhBudget = await dbhBudgetService.findBudget({reportingId: reportingId});
  return res.status(200).json(dbhBudget);
};

exports.addBudget = async (req, res, next) => {  
  // const opdId = req.opd._id;  
  try {
    const budgetData = await dbhBudgetService.addBudget(req.body);
    return res.status(200).json(budgetData);
  } catch (error) {
    return next(error);
  }
};

exports.updateBudgetRecord = async (req, res, next) => {  
  const budgetId = req.params.budgetId;
  const data = req.body;

  try {
    const budgetRecord = await dbhBudgetService.findBudget({ id: budgetId });
    if (!budgetRecord) {
      res.status(404).json({ message: "Reporting not found" });
    }
    const updatedBudget = await dbhBudgetService.updateBudget(budgetId, data);
    return res.status(200).json(updatedBudget);
  } catch (error) {
    return next(error);
  }
};

exports.deleteBudgetRecord = async (req, res, next) => {
  const budgetId = req.params.budgetId;

  try {
    const deletedBudget = await dbhBudgetService.deleteBudget(budgetId);
    return res.status(200).json(deletedBudget);
  } catch (error) {
    return next(error);
  }
};
