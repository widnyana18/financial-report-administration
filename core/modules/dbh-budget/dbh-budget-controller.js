const { Types } = require("mongoose");

const dbhBudgetService = require("./dbh-budget-service");


exports.renderDataDbhOpd = async (req, res, next) => {
  const opdId = req.opd._id;
  const dataDbhOpd = await dbhBudgetService.findBudget({ opdId: opdId });
  if (req.query['edit'] === true) {
    const dbhId = req.body.dbhId;
    const selectedDbh = await dbhBudgetService.findBudget({ _id: dbhId });

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

exports.findDbhBudgetOpd = async (req, res, next) => {    
  const opdId = req.opd._id;  
  const dbhBudget = await dbhBudgetService.findBudget({opdId: opdId});
  return res.status(200).json(dbhBudget);
};

exports.findDbhBudgetAdmin = async (req, res, next) => {      
  const reportingId = new Types.ObjectId(req.params.reportId);
  const dbhBudget = await dbhBudgetService.findBudget({reportId: reportingId});
  return res.status(200).json(dbhBudget);
};

exports.addBudget = async (req, res, next) => {
  const opdId = req.opd._id;
  const reportingId = new Types.ObjectId(req.params.reportId);  
  
  try {
    const budgetData = await dbhBudgetService.addBudget(reportingId, opdId, req.body);
    return res.status(200).json(budgetData);
  } catch (error) {
    return next(error);
  }
};

exports.updateBudgetRecord = async (req, res, next) => {  
  const data = req.body;

  try {
    const budgetRecord = await dbhBudgetService.findBudget({ id: data.budgetId });
    if (!budgetRecord) {
      res.status(404).json({ message: "Reporting not found" });
    }
    const updatedBudget = await dbhBudgetService.updateBudget(data.budgetId, data);
    return res.status(200).json(updatedBudget);
  } catch (error) {
    return next(error);
  }
};

exports.deleteBudgetRecord = async (req, res, next) => {
  const budgetId = req.body.budgetId;

  try {
    const deletedBudget = await dbhBudgetService.deleteBudget(budgetId);
    return res.status(200).json(deletedBudget);
  } catch (error) {
    return next(error);
  }
};
