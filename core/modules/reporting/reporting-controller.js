const excelJS = require("exceljs");

const opdService = require("../opd/opd-service");
const reportingService = require("./reporting-service");
const dbhRealizationService = require("../dbh-realization/dbh-realization-service");
const { createBudgetId } = require("../../common/utils/id_gen");
const { Types } = require("mongoose");

exports.renderIndex = async (req, res, next) => {
  const years = [];

  try {
    const allReporting = await reportingService.findManyReporting();
    const reportingByYear = await reportingService.findManyReporting({
      year: Number(req.query.tahun ?? 0),
    });

    allReporting.forEach((item, index) => {
      const isYearAdded = years.includes(item.year);

      if (!isYearAdded) {
        years.push(item.year);
      }
    });

    const totalDbhRecievedByYear = reportingByYear.reduce(
      (total, item) => parseInt(total) + parseInt(item.totalDbhRecieved),
      0
    );

    res.render("admin/admin-reporting", {
      pageTitle: "Portal Admin",
      years: years,
      reportingList: reportingByYear,
      totalDbhRecievedByYear,
    });
  } catch (error) {
    return next(error);
  }
};

exports.renderReportingDetails = async (req, res, next) => {
  const reportingId = req.params.reportId;
  const dbhOpdCompletedArray = await reportingService.findInstitutionBudget({
    reportingId,
    isCompleted: true,
  });
  const currentReporting = await reportingService.findOneReporting({
    _id: reportingId,
  });
  const opdIdArray = dbhOpdCompletedArray.map((dbhOpd) => dbhOpd.opdId);

  const dbhRealizationOpd = await dbhRealizationService.groupDbhByOpd({
    reportingId,
    opds: opdIdArray,
  });

  dbhRealizationOpd.forEach((dbh) => {
    console.log("GET DBH BY OPD : " + JSON.stringify(dbh.totalDbhOpd));
  });

  res.render("admin/reporting-details", {
    pageTitle: currentReporting.title,
    currentReporting,
    dbhRealizationOpd,
    userRole: "admin",
  });
};

exports.renderCreateReporting = async (req, res, next) => {
  const institutions = await opdService.findManyOpd({
    opdName: { $ne: "ADMIN" },
  });

  res.render("admin/create-reporting", {
    pageTitle: "Buat Laporan Baru",
    apiRoute: "/api/laporan/add",
    selectedReporting: null,
    institutions,
  });
};

exports.renderUpdateReporting = async (req, res, next) => {
  const reportingId = req.params.reportingId;

  try {
    const institutions = await opdService.findManyOpd({
      opdName: { $ne: "ADMIN" },
    });
    const selectedReporting = await reportingService.findOneReporting({
      _id: reportingId,
    });
    const selectedInstitutionBudget =
      await reportingService.findInstitutionBudget({
        reportingId: reportingId,
      });

    if (!selectedReporting) {
      res.redirect(`/admin/${reportingId}`);
    } else {
      res.render("admin/create-reporting", {
        pageTitle: "Update Data Anggaran",
        apiRoute: "/api/laporan/edit/" + reportingId,
        institutions,
        selectedReporting: {
          reporting: selectedReporting,
          institutionBudget: selectedInstitutionBudget,
        },
      });
    }
  } catch (error) {
    return next(error);
  }
};

exports.getAllReporting = async (req, res, next) => {
  // const opd = req.session.user;
  const reportings = await reportingService.findManyReporting();
  return res.status(200).json(reportings);
};

exports.getReporting = async (req, res, next) => {
  // const opd = req.session.user;
  const reportingId = req.params.reportId;

  const reporting = await reportingService.findOneReporting({
    _id: reportingId,
  });
  return res.status(200).json(reporting);
};

exports.createReporting = async (req, res, next) => {
  const institutionBudget = req.body.institutionBudget;
  const reportingData = req.body.reporting;
  const totalDbhRecieved = Object.values(reportingData.dbhRecieved).reduce(
    (total, value) => parseInt(total) + parseInt(value),
    0
  );

  console.log("REPORTING DATA = ", reportingData);

  try {
    const reportingAdded = await reportingService.createReporting({
      ...reportingData,
      totalDbhRecieved,
    });

    console.log("REPORTING ADDED : " + reportingAdded);

    const institutionBudgetData = institutionBudget.map((item, index) => {
      return { reportingId: reportingAdded._id, ...item };
    });

    console.log("institutionBudgetData = ", institutionBudgetData);

    const institutionBudgetAdded =
      await reportingService.insertInstitutionBudget(institutionBudgetData);

    if (institutionBudgetAdded) {
      const latestInstitutionInReport = await reportingService.findOneReporting(
        {
          parameter: "Lembaga",
        }
      );
      const lastNoRek = latestInstitutionInReport?.noRek ?? 1;

      for (let i = 0; i < institutionBudgetData.length; i++) {
        const dbhOpdObjData = {
          reportingId: institutionBudgetData[i].reportingId,
          opdId: new Types.ObjectId(institutionBudgetData[i].opdId),
          noRek: lastNoRek + 1,
          parameter: "Lembaga",
          name: institutionBudgetData[i].institutionName,
        };

        const dbhOpdId = await createBudgetId(dbhOpdObjData);

        await dbhRealizationService.addDbhRealization({
          _id: dbhOpdId,
          ...dbhOpdObjData,
        });
      }
    }

    res.redirect("/admin?tahun=" + reportingData.year);
  } catch (error) {
    return next(error);
  }
};

exports.updateReporting = async (req, res, next) => {
  const reportingId = req.params.reportId;
  const institutionBudget = req.body.institutionBudget;
  const reportingData = req.body.reporting;
  const totalDbhRecieved = Object.values(reportingData.dbhRecieved).reduce(
    (total, value) => parseInt(total) + parseInt(value),
    0
  );

  console.log("REPORTING DATA = ", reportingData);

  const institutionBudgetData = institutionBudget.map((item, index) => {
    return { reportingId, ...item };
  });

  console.log("institutionBudgetData = ", institutionBudgetData);

  try {
    const latestInstitutionInReport = await reportingService.findOneReporting({
      parameter: "Lembaga",
    });

    const lastNoRek = latestInstitutionInReport?.noRek ?? 1;

    for (let i = 0; i < institutionBudgetData.length; i++) {
      const dbhOpdObjData = {
        reportingId: institutionBudgetData[i].reportingId,
        opdId: new Types.ObjectId(institutionBudgetData[i].opdId),
        noRek: lastNoRek + 1,
        parameter: "Lembaga",
        name: institutionBudgetData[i].institutionName,
      };

      if (!dbhOpdObjData.opdId || !dbhOpdObjData.name) {
        const curretInstitutionBudget =
          await reportingService.getLastOneInstitutionBudget({
            _id: institutionBudgetData[i]._id,
          });

        await dbhRealizationService.deleteBudget({
          opdId: curretInstitutionBudget.opdId,
          reportingId: dbhOpdObjData.reportingId,
          parameter: "Lembaga",
        });
      } else if (!institutionBudgetData[i]._id) {
        const dbhOpdId = await createBudgetId(dbhOpdObjData);

        await dbhRealizationService.addDbhRealization({
          _id: dbhOpdId,
          ...dbhOpdObjData,
        });
      } else {
        await dbhRealizationService.updateBudget(
          {
            opdId: curretInstitutionBudget[i].opdId,
            reportingId: dbhOpdObjData.reportingId,
            parameter: "Lembaga",
          },
          dbhOpdObjData
        );
      }
    }

    await reportingService.updateInstitutionBudget(institutionBudgetData);

    await reportingService.updateReporting(
      { _id: reportingId },
      { ...reportingData, totalDbhRecieved }
    );

    res.redirect("/admin?tahun=" + reportingData.year);
  } catch (error) {
    return next(error);
  }
};

exports.deleteReporting = async (req, res, next) => {
  const reportingId = req.params.reportId;

  try {
    const deletedReporting = await reportingService.deleteReporting(
      reportingId
    );
    const deleteManyInstitutionBudget =
      await reportingService.deleteInstitutionBudget(reportingId);

    return res
      .status(200)
      .json({ deletedReporting, deleteManyInstitutionBudget });
  } catch (error) {
    return next(error);
  }
};

exports.exportToExcel = async (req, res, next) => {
  const reportingId = req.params.reportId;

  const workbook = new excelJS.Workbook();
  const reportingData = await Reporting.findOne({ _id: reportingId });
  const dbhReportingData = await dbhRealizationService.findBudget({
    reportingId: reportingId,
  });
  const worksheet = workbook.addWorksheet(
    `Rincian DBH Provinsi ${reportingData.year}`,
    {
      pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 },
    }
  );
  const getReportingByYear = await Reporting.find({
    year: reportingData.year,
    createdAt: reportingData.createdAt,
  });

  // Apply styling (bold, font size, alignment, border, etc.)
  const titleStyle = {
    font: { bold: true, size: 11 },
    alignment: { horizontal: "center", vertical: "middle" },
  };

  // Optional: Apply style to the header (e.g., bold and background color)
  const headerStyle = {
    font: { size: 10, bold: true },
    alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const contentStyle = {
    font: { size: 10 },
    alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  // Define and set the width of the columns
  worksheet.columns = [
    { key: "noRek", width: 20 },
    { key: "name", width: 70 },
    { key: "pagu", width: 20 },
    { key: "pkbBudget", width: 20 },
    { key: "pkbRealization", width: 20 },
    { key: "bbnkbBudget", width: 20 },
    { key: "bbnkbRealization", width: 20 },
    { key: "pbbkbBudget", width: 20 },
    { key: "pbbkbRealization", width: 20 },
    { key: "papBudget", width: 20 },
    { key: "papRealization", width: 20 },
    { key: "rokokBudget", width: 20 },
    { key: "rokokRealization", width: 20 },
    { key: "description", width: 12 },
  ];

  // Merge cells for the title (rows 1, 2, and 3)
  worksheet.mergeCells("A1:N1");
  worksheet.mergeCells("A2:N2");
  worksheet.mergeCells("A3:N3");

  // Set the title text
  worksheet.getCell("A1").value =
    "LAPORAN REALISASI PENGGUNAAN DANA BAGI HASIL PAJAK PROVINSI BALI";
  worksheet.getCell(
    "A2"
  ).value = `PADA APBD KABUPATEN KARANGASEM TAHUN ANGGARAN ${reportingData.year}`;
  worksheet.getCell(
    "A3"
  ).value = `REALISASI SAMPAI BULAN JUNI (${reportingData.period.toUpperCase()})`;

  // Apply the style to the title cells
  worksheet.getCell("A1").style = titleStyle;
  worksheet.getCell("A2").style = titleStyle;
  worksheet.getCell("A3").style = titleStyle;

  // Merging cells to simulate colspan and rowspan
  worksheet.mergeCells("A5:A7"); // Merges No Rek for 3 rows
  worksheet.mergeCells("B5:B7"); // Merges Program/Kegiatan for 3 rows
  worksheet.mergeCells("C5:C7"); // Merges Jumlah Pagu Anggaran for 3 rows
  worksheet.mergeCells("D5:M5"); // Merges Dana Bagi Hasil header
  worksheet.mergeCells("D6:E6"); // PKB Anggaran and Realisasi
  worksheet.mergeCells("F6:G6"); // BBNKB Anggaran and Realisasi
  worksheet.mergeCells("H6:I6"); // PBBKB Anggaran and Realisasi
  worksheet.mergeCells("J6:K6"); // PAP Anggaran and Realisasi
  worksheet.mergeCells("L6:M6"); // Rokok Anggaran and Realisasi
  worksheet.mergeCells("N5:N7"); // Keterangan

  // Adding data for the headers (top-level row)
  worksheet.getCell("A5").value = "No Rek";
  worksheet.getCell("B5").value = "Program/Kegiatan";
  worksheet.getCell("C5").value = "Jumlah Pagu Anggaran";
  worksheet.getCell("D5").value = "DANA BAGI HASIL";
  worksheet.getCell("N5").value = "KET";

  // Second row with subheaders
  worksheet.getCell("D6").value =
    "Pendapatan Bagi Hasil Pajak Kendaraan Bermotor (PKB)";
  worksheet.getCell("F6").value =
    "Pendapatan Bagi Hasil Bea Balik Nama Kendaraan Bermotor (BBNKB)";
  worksheet.getCell("H6").value =
    "Pendapatan Bagi Hasil Pajak Bahan Bakar Kendaraan Bermotor (PBBKB)";
  worksheet.getCell("J6").value =
    "Pendapatan Bagi Hasil Pajak Air Permukaan (PAP)";
  worksheet.getCell("L6").value = "Pendapatan Bagi Hasil Pajak Rokok";

  // Third row (the last row in the header)
  worksheet.getCell("D7").value = "Anggaran";
  worksheet.getCell("E7").value = "Realisasi";
  worksheet.getCell("F7").value = "Anggaran";
  worksheet.getCell("G7").value = "Realisasi";
  worksheet.getCell("H7").value = "Anggaran";
  worksheet.getCell("I7").value = "Realisasi";
  worksheet.getCell("J7").value = "Anggaran";
  worksheet.getCell("K7").value = "Realisasi";
  worksheet.getCell("L7").value = "Anggaran";
  worksheet.getCell("M7").value = "Realisasi";

  // header style
  worksheet.getRow(5).eachCell((cell) => (cell.style = headerStyle));
  worksheet.getRow(6).eachCell((cell) => (cell.style = headerStyle));
  worksheet.getRow(7).eachCell((cell) => (cell.style = headerStyle));

  worksheet.getRow(6).height = 40;

  // Content Rows
  let prevOpdId = null;
  dbhReportingData.forEach((data) => {
    const dbhItems = data.dbh;

    const estimateRowHeight = (text, columnWidth) => {
      const approxCharPerLine = columnWidth * 1.2; // Adjust this factor based on font size
      const lineCount = Math.ceil(text.length / approxCharPerLine);
      return lineCount * 15; // Assuming 15 points per line of text
    };

    const estimatedHeight = estimateRowHeight(
      data.name,
      worksheet.columns[1].width
    );

    if (data.parameter === "Lembaga") {
      if (data.opdId !== prevOpdId) {
        const rowAdded = worksheet.addRow([
          "",
          "Sub Total",
          data.pagu,
          dbhItems.pkb[0],
          dbhItems.pkb[1],
          dbhItems.bbnkb[0],
          dbhItems.bbnkb[1],
          dbhItems.pbbkb[0],
          dbhItems.pbbkb[1],
          dbhItems.pap[0],
          dbhItems.pap[1],
          dbhItems.pajakRokok[0],
          dbhItems.pajakRokok[1],
          data.description ?? "",
        ]);

        rowAdded.eachCell((cell) => (cell.style = headerStyle));
      }

      const rowAdded = worksheet.addRow([
        data.noRek,
        data.name.toUpperCase(),
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      rowAdded.eachCell(
        (cell) =>
          (cell.style = {
            ...headerStyle,
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF168AAD" },
            },
          })
      );

      rowAdded.height = estimatedHeight;
    } else {
      const rowAdded = worksheet.addRow([
        data.noRek,
        data.name,
        data.pagu,
        dbhItems.pkb[0],
        dbhItems.pkb[1],
        dbhItems.bbnkb[0],
        dbhItems.bbnkb[1],
        dbhItems.pbbkb[0],
        dbhItems.pbbkb[1],
        dbhItems.pap[0],
        dbhItems.pap[1],
        dbhItems.pajakRokok[0],
        dbhItems.pajakRokok[1],
        data.description ?? "",
      ]);

      if (data.parameter === "Program") {
        data.name = data.name.toUpperCase();

        rowAdded.eachCell(
          (cell) =>
            (cell.style = {
              ...headerStyle,
              fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9ED92" },
              },
            })
        );
      }

      rowAdded.eachCell((cell) => {
        cell.style = contentStyle;
      });

      rowAdded.getCell(2).alignment = {
        vertical: "middle",
        horizontal: "left",
        wrapText: true,
        indent: 1,
      };

      rowAdded.height = estimatedHeight;
    }

    prevOpdId = data.opdId;
  });

  const totalDbhItems = reportingData.totalInstitutionDbh;
  const totalDbh = [
    "",
    "TOTAL",
    totalDbhItems.pagu,
    totalDbhItems.pkb[0],
    totalDbhItems.pkb[1],
    totalDbhItems.bbnkb[0],
    totalDbhItems.bbnkb[1],
    totalDbhItems.pbbkb[0],
    totalDbhItems.pbbkb[1],
    totalDbhItems.pap[0],
    totalDbhItems.pap[1],
    totalDbhItems.pajakRokok[0],
    totalDbhItems.pajakRokok[1],
    "",
  ];

  const totalDbhBudget = [
    "",
    "DANA DBH PROPINSI",
    reportingData.totalDbhBudget,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];
  const totalDbhRealization = [
    "",
    "REALISASI S/D BULAN JUNI (TRIWULAN II)",
    reportingData.totalDbhRealization,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];

  finalRowsData = [totalDbh, totalDbhBudget, totalDbhRealization];
  finalRowsData.forEach((row) => {
    worksheet.addRow(row).eachCell(
      (cell) =>
        (cell.style = {
          font: { size: 10, bold: true },
          alignment: {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          },
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          },
        })
    );
  });

  const lastRowNumber = worksheet.lastRow.number;
  worksheet.insertRow(lastRowNumber + 2, [
    `Pagu Yang sudah di transfer (Diterima) dari Provinsi untuk DBH Provinsi TA ${reportingData.year}`,
  ]).font = { bold: true };

  const totalDbhRecieved = reportingData.totalDbhRecieved;

  const rowsData = getReportingByYear.map((report, idx) => [
    [`${idx + 1}. Penerimaan DBH ${report.period}`],
    [
      "  - Bagi Hasil Pajak Kendaraan Bermotor (PKB)",
      null,
      report.dbhRecieved.pkb,
    ],
    [
      "  - Bagi Hasil Bea Balik Nama Kendaraan Bermotor (BBNKB)",
      null,
      report.dbhRecieved.bbnkb,
    ],
    [
      "  - Bagi Hasil Pajak Bahan Bakar Kendaraan Bermotor (PBBKB)",
      null,
      report.dbhRecieved.pbbkb,
    ],
    ["  - Bagi Hasil Pajak Air Tanah Permukaan", null, report.dbhRecieved.pap],
    ["  - Bagi Hasil Pajak Rokok", null, report.dbhRecieved.pajakRokok],
  ]);

  console.log("ROWS DATA : " + rowsData);

  rowsData[0].forEach((row, idx) => {
    const rowAdded = worksheet.addRow(row);
    if (idx == 0) {
      rowAdded.font = { bold: true };
    }
  });

  worksheet.addRow(["JUMLAH", "", totalDbhRecieved]).font = { bold: true };

  try {
    const fileName = `${new Date().toISOString()}-laporan-dbh-${reportingData.period.trim()}.xlsx`;
    // Write to the response directly as a download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition",
      "attachment; filename=" + fileName
    );

    // Write the Excel file to the response stream
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error creating or sending Excel file:", err);
    res.status(500).send("Error generating Excel file");
  }
};
