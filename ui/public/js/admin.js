const queryString = window.location.search; // Get the query string (e.g., ?year=2025)
const urlParams = new URLSearchParams(queryString); // Parse the query string
let year = urlParams.get("tahun");
$(".dropdown ul li a#year-dropdown-item").removeClass("active");
$(`:contains('${year}')`).addClass("active");
$("#year-dropdown-btn").text(year);

// $('img#logo').each(function() {
//   let imgSrc = $(this).attr("src"); // Get the current src attribute
//   // Check if the src contains '/admin' and replace it
//   if (imgSrc.includes("/admin")) {
//     let newSrc = imgSrc.replace("/admin", ""); // Remove '/admin' from the URL
//     $(this).attr("src", newSrc); // Set the new src without '/admin'
//   }

//   alert("IMG URL : " + imgSrc);

// });

// sort table
// const subTotalRow = $('table tbody tr#sub-total').get();
// $('table tbody').append(subTotalRow);
// subTotalRow.empty();

$(".dropdown ul li a#year-dropdown-item").click(function () {
  year = $(this).text();
  $(".dropdown ul li a#year-dropdown-item").removeClass("active");
  $(this).addClass("active");
  $("#year-dropdown-btn").text(year);
  $(this).attr("href", `/admin?tahun=${year}`);
});
