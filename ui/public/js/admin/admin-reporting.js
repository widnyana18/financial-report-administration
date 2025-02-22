const queryString = window.location.search; // Get the query string (e.g., ?year=2025)
const urlParams = new URLSearchParams(queryString);

let year = urlParams.get("tahun");
console.log("YEAR : " + year);
$(`.dropdown ul li a#${year}`).addClass("active");
$("#year-dropdown-btn").text(year);

$("button#delete-report-button").click(function () {
  const reportId = window.location.href.split("/").pop();
  const year = $("#data-report").data("year");

  console.log(reportId);

  $.ajax({
    url: "/api/laporan/delete/" + reportId,
    type: "DELETE",
    contentType: "application/json",
    success: function (response) {
      console.log("Success:", response);
      $("#delete-report-modal").modal("hide");
      window.location.href = "/admin?tahun=" + year;
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
    },
  });
});
