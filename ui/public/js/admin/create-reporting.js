let totalOpd = $("input#total-opd").val() ?? 0;
let period = $(".dropdown input#period").val();
const periodId = period.trim().toLowerCase();
$(`.dropdown ul li a#y${periodId}`).addClass("active");

$(".dropdown ul li a.period-item").click(function () {
  period = $(this).text();

  $(".dropdown ul li a.period-item").removeClass("active");
  $(this).addClass("active");
  $("#period-btn").text(period);
  $(".dropdown input#period").val(period);
});

$("#add-institution-btn").click(function () {
    totalOpd++;
  
    const institutionBudgetField = `<div class="d-inline-flex my-2 align-items-center" id="institution-${totalOpd}">                          
                          <div class="me-2 w-50">                      
                              <label for="institutionName${totalOpd}" class="form-label">Nama Lembaga<span class="text-danger"> *</span></label>
                              <input type="text" class="form-control" name="institutionName${totalOpd}" id="institution-name-${totalOpd}" required>
                          </div>                
                          <div class="me-2">
                              <label for="pkbBudget${totalOpd}" class="form-label">PKB</label>
                              <input type="number" class="form-control" name="pkbBudget${totalOpd}" id="pkb-budget-${totalOpd}">
                          </div>                                                        
                          <div class="me-2">
                              <label for="pbbkbBudget${totalOpd}" class="form-label">PBBKB</label>
                              <input type="number" class="form-control" name="pbbkbBudget${totalOpd}" id="pbbkb-budget-${totalOpd}">
                          </div>                                                        
                          <div class="me-2">
                              <label for="pajakRokokBudget${totalOpd}" class="form-label">Pajak Rokok</label>
                              <input type="number" class="form-control" name="pajakRokokBudget${totalOpd}" id="pajakRokok-budget-${totalOpd}">
                          </div>    
                          <div class="me-2">
                              <label for="bbnkbBudget${totalOpd}" class="form-label">BBNKB</label>
                              <input type="number" class="form-control" name="bbnkbBudget${totalOpd}" id="bbnkb-budget-${totalOpd}">
                          </div> 
                          <div class="me-2">
                              <label for="papBudget${totalOpd}" class="form-label">PAP</label>
                              <input type="number" class="form-control" name="papBudget${totalOpd}" id="pap-budget-${totalOpd}">
                          </div>
                          <div class="px-2 pt-3 remove-institution-btn">
                              &#x274C;
                          </div>                                                     
                      </div>`;
  
    $("#institution-dbh-form").append(institutionBudgetField);
    $("input#total-opd").val(totalOpd);
    $("#total-opd-txt").text(totalOpd.toString());
  });
  
  $("#institution-dbh-form").on("click", ".remove-institution-btn", function () {
    totalOpd--;
  
    $(this).parent().remove();
    $("input#total-opd").val(totalOpd);
    $("#total-opd-txt").text(totalOpd.toString());
  });
  
  $("#clear-btn").click(function () {
    $("#dbh-realization-form").find("input").val("");
    $(".dropdown ul li a.period-item").removeClass("active");
    $("#period-btn").text("Pilih Triwulan");
    $("#institution-dbh-form").empty();

    
    for(let id=1; id<=totalOpd; id++){
      $(`#institution-${id}`).remove();
    }
    
    totalOpd=0;
    $("input#total-opd").val(totalOpd);
    $("#total-opd-txt").text(totalOpd.toString());
  });
  
  $("#dbh-realization-form").on("submit", function (event) {
    const periodVal = $("input#period").val();
  
    if (!periodVal) {
      event.preventDefault();
      alert("Mohon pilih triwulan terlebih dahulu");
    } else if (totalOpd == 0) {
      event.preventDefault();
      alert("Tambahkan data lembaga terlebih dahulu");
    } else {
      return;
    }
  });
  