const Reporting = require("./models/reporting");
const dbhBudgetService = require("./../dbh-budget/dbh-budget-service");

exports.getAllReporting = async () => {
  // if (user.role === "admin") {
    return await Reporting.find();         
  // }
  // return await Reporting.findOne({ opdId: id });
};

exports.findReporting = async (filter) => {
  let reportStatus;
  
  try {  
    const reportingData = await Reporting.find(filter);
    
    for(let item of reportingData) {      
      const dbh = await dbhBudgetService.findBudget({
        reportingId: item._id,
        parameter: "Lembaga",
      });
  
      if(dbh.length == item.totalOpd){
        reportStatus = "Sudah Selesai";
      }
  
      await Reporting.updateOne(
        { _id: item._id },
        { totalDbhOpdAdded: dbh.length, status: reportStatus }
      )        
    }

    return reportingData;
  } catch (error) {
    throw new Error(error);
  }
};

exports.createReporting = async (data) => {
  const reporting = new Reporting({
    title: data.title,
    period: data.period ?? "January - Maret",
    year: data.year ?? "2024",
    dbhRecieved: data.dbhRecieved,
    totalInstitutionDbh: data.totalInstitutionDbh,
    fileExcelUrl: data.fileExcelUrl,
    status: data.status,
    opdId: data.opdId,
    totalDbhBudget: data.totalDbhBudget,
    totalDbhRealization: data.totalDbhRealization,    
  });

  try {
    return await reporting.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateReporting = async (reportId, input) => {
  try {
    return await Reporting.findOneAndUpdate({ _id: reportId }, input);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteReporting = async (id) => {
  return await Reporting.deleteOne({ _id: id });
};
