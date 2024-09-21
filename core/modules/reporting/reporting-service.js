const Reporting = require("./models/reporting");
const dbhBudgetService = require("./../dbh-budget/dbh-budget-service");

exports.findOneReporting = async (filter) => {
  let reportStatus;

  try {
    const reporting = await Reporting.findOne(filter);
    
      const dbh = await dbhBudgetService.findBudget({
        reportingId: reporting._id,
        parameter: "Lembaga",
      });

      if (dbh.length == reporting.totalOpd) {
        reportStatus = "Sudah Selesai";
      }

      await Reporting.updateOne(
        { _id: reporting._id },
        { totalDbhOpdAdded: dbh.length, status: reportStatus }
      );    

    return reporting;
  } catch (error) {
    throw new Error(error);
  }
};

exports.findManyReporting = async (filter) => {
  let reportStatus;

  try {
    const reportingData = await Reporting.find(filter);

    for (let item of reportingData) {
      const dbh = await dbhBudgetService.findBudget({
        reportingId: item._id,
        parameter: "Lembaga",
      });

      if (dbh.length == item.totalOpd) {
        reportStatus = "Sudah Selesai";
      }

      await Reporting.updateOne(
        { _id: item._id },
        { totalDbhOpdAdded: dbh.length, status: reportStatus }
      );
    }

    return reportingData;
  } catch (error) {
    throw new Error(error);
  }
};

exports.createReporting = async (data) => {
  const dbhRecieved = {
    pkb: data.pkb,
    pbbkb: data.pbbkb,
    pajakRokok: data.pajakRokok,
    bbnkb: data.bbnkb,
    pap: data.pap,
  };

  const totalSumDbh = Object.values(dbhRecieved).reduce(
    (acc, value) => acc + value,
    0
  );

  console.log("Total Sum:", totalSumDbh); // Output: Total Sum: 1000

  const reporting = new Reporting({
    title: data.title,
    period: data.period ?? "January - Maret",
    year: data.year ?? "2024",
    dbhRecieved: dbhRecieved,
    totalInstitutionDbh: data.totalInstitutionDbh,
    fileExcelUrl: data.fileExcelUrl,
    status: data.status,
    opdId: data.opdId,
    totalDbhBudget: data.totalDbhBudget,
    totalDbhRealization: data.totalDbhRealization,
    totalOpd: data.totalOpd,
    totalDbhRecieved: totalSumDbh,
  });

  try {
    return await reporting.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateReporting = async (reportId, input) => {
  const dbhRecieved = {
    pkb: data.pkb,
    pbbkb: data.pbbkb,
    pajakRokok: data.pajakRokok,
    bbnkb: data.bbnkb,
    pap: data.pap,
  };

  const totalSumDbh = Object.values(dbhRecieved).reduce(
    (acc, value) => acc + value,
    0
  );

  console.log("Total Sum:", totalSumDbh); // Output: Total Sum: 1000

  try {
    return await Reporting.findOneAndUpdate(
      { _id: reportId },
      { ...input, totalDbhRecieved: totalSumDbh }
    );
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteReporting = async (id) => {
  return await Reporting.deleteOne({ _id: id });
};
