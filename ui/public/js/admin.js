const queryString = window.location.search; // Get the query string (e.g., ?year=2025)
const urlParams = new URLSearchParams(queryString);

let totalOpd = $("input#total-opd").val() ?? 0;
let period = $(".dropdown input#period").val();
const periodId = period.trim().toLowerCase();
$(`.dropdown ul li a#y${periodId}`).addClass("active");

let year = urlParams.get("tahun");
$(`:contains('${year}')`).addClass("active");
$("#year-dropdown-btn").text(year);

$(".dropdown ul li a.period-item").click(function () {
  period = $(this).text();

  $(".dropdown ul li a.period-item").removeClass("active");
  $(this).addClass("active");
  $("#period-btn").text(period);
  $(".dropdown input#period").val(period);
});

$(".dropdown ul li a#year-dropdown-item").click(function () {
  year = $(this).text();
  $(".dropdown ul li a#year-dropdown-item").removeClass("active");
  $(this).addClass("active");
  $("#year-dropdown-btn").text(year);
  $(this).attr("href", `/admin?tahun=${year}`);
});

$("#add-institution-btn").click(function () {
  const increTotalOpd = totalOpd++;
  totalOpd = increTotalOpd;

  const institutionBudgetField = `<div class="row my-2" id="institution-${totalOpd}">
                        <div class="col-4 me-2">                      
                            <label for="institutionName${totalOpd}" class="form-label">Nama Lembaga<span class="text-danger"> *</span></label>
                            <input type="text" class="form-control" name="institutionName${totalOpd}" id="institution-name-${totalOpd}" required>
                        </div>                
                        <div class="col me-2">
                            <label for="pkbBudget${totalOpd}" class="form-label">PKB</label>
                            <input type="number" class="form-control" name="pkbBudget${totalOpd}" id="pkb-budget-${totalOpd}">
                        </div>                                                        
                        <div class="col me-2">
                            <label for="pbbkbBudget${totalOpd}" class="form-label">PBBKB</label>
                            <input type="number" class="form-control" name="pbbkbBudget${totalOpd}" id="pbbkb-budget-${totalOpd}">
                        </div>                                                        
                        <div class="col me-2">
                            <label for="pajakRokokBudget${totalOpd}" class="form-label">Pajak Rokok</label>
                            <input type="number" class="form-control" name="pajakRokokBudget${totalOpd}" id="pajakRokok-budget-${totalOpd}">
                        </div>    
                        <div class="col me-2">
                            <label for="bbnkbBudget${totalOpd}" class="form-label">BBNKB</label>
                            <input type="number" class="form-control" name="bbnkbBudget${totalOpd}" id="bbnkb-budget-${totalOpd}">
                        </div> 
                        <div class="col me-2">
                            <label for="papBudget${totalOpd}" class="form-label">PAP</label>
                            <input type="number" class="form-control" name="papBudget${totalOpd}" id="pap-budget-${totalOpd}">
                        </div>
                        <div class="col p-2" id="remove-institution-btn">
                            <i class="bi bi-x w-25"></i>
                        </div>                                                     
                    </div>`;

  $("#institution-dbh-form").append(institutionBudgetField);
  $("input#total-opd").val(totalOpd);
  $("#total-opd-txt").text(totalOpd.toString());
});

$("#remove-institution-btn").click(function () {
  const decreTotalOpd = totalOpd - 1;
  totalOpd = decreTotalOpd;

  $(this).parent().remove();
  $("input#total-opd").val(totalOpd);
  $("#total-opd-txt").text(totalOpd.toString());
});

$("#clear-btn").click(function () {
  $("#dbh-realization-form").find("input").val("");
  $(".dropdown ul li a.period-item").removeClass("active");
  $("#period-btn").text("Pilih Triwulan");
  $("#institution-dbh-form").empty();
});
