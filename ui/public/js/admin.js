const queryString = window.location.search; // Get the query string (e.g., ?year=2025)
const urlParams = new URLSearchParams(queryString); // Parse the query string
let year = urlParams.get("tahun");
$(".dropdown ul li a#year-dropdown-item").removeClass("active");
$(`:contains('${year}')`).addClass("active");
$("#year-dropdown-btn").text(year);

$(".dropdown ul li a#year-dropdown-item").click(function () {
  year = $(this).text();
  $(".dropdown ul li a#year-dropdown-item").removeClass("active");
  $(this).addClass("active");
  $("#year-dropdown-btn").text(year);
  $(this).attr("href", `/admin?tahun=${year}`);
});
