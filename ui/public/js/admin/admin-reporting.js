const queryString = window.location.search; // Get the query string (e.g., ?year=2025)
const urlParams = new URLSearchParams(queryString);

let year = urlParams.get("tahun");
console.log('YEAR : ' + year);
$(`.dropdown ul li a#${year}`).addClass("active");
$("#year-dropdown-btn").text(year);
