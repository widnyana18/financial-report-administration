const Reporting = require("./models/reporting");
const dbhBudgetService = require("./../dbh-budget/dbh-budget-service");

exports.findOneReporting = async (filter) => {
  try {
    const reporting = await Reporting.findOne(filter);

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
      if (item.totalDbhOpdAdded == item.totalOpd) {
        reportStatus = "Sudah Selesai";
        await this.updateReporting({ _id: item._id }, { status: reportStatus });
      }
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

  const getReportingByYear = await Reporting.find({
    year: data.year,
  });

  let totalSumDbh = Object.values(dbhRecieved).reduce(
    (acc, value) => acc + value,
    0
  );

  getReportingByYear.forEach((item) => {
    totalSumDbh += item.totalDbhRecieved;
  });

  console.log("Total Sum:", totalSumDbh); // Output: Total Sum: 1000

  const reporting = new Reporting({
    title: data.title,
    period: data.period,
    year: data.year,
    dbhRecieved: dbhRecieved,
    totalOpd: data.totalOpd,
    totalDbhRecieved: totalSumDbh,
  });

  try {
    return await reporting.save();
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateReporting = async (filter, input) => {
  try {
    return await Reporting.findOneAndUpdate(filter, input);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteReporting = async (id) => {
  return await Reporting.deleteOne({ _id: id });
};

