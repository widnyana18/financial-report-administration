exports.addBudget = async (req, res, next) => {
    const reportingId = new Types.ObjectId(req.params.reportId);
    console.log("REEEEQQQ BOOODY: " + req.body[0]);
  
    try {
      const budgetData = await reportingService.addBudget(reportingId, req.body);
      return res.status(200).json(budgetData);
    } catch (error) {
      return next(error);
    }
  };
  
  exports.updateBudgetRecord = async (req, res, next) => {
    const budgetId = req.params.budgetId;
    const data = req.body;
  
    try {
      const budgetRecord = await reportingService.findBudget({ id: budgetId });
      if (!budgetRecord) {
        res.status(404).json({ message: "Reporting not found" });
      }
      const updatedBudget = await reportingService.updateBudget(budgetId, data);
      return res.status(200).json(updatedBudget);
    } catch (error) {
      return next(error);
    }
  };
  
  exports.deleteBudgetRecord = async (req, res, next) => {
    const budgetId = req.params.budgetId;
  
    try {
      const deletedBudget = await reportingService.deleteBudget(budgetId);
      return res.status(200).json(deletedBudget);
    } catch (error) {
      return next(error);
    }
  };