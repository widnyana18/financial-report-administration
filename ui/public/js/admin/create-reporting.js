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

  let institutionDropdownItems = "";
  const institutions = $("#institutions-data").val();
  const institutionsArr = JSON.parse(institutions);

  for (opd of institutionsArr) {
    institutionDropdownItems += `<li><a class="dropdown-item institution-item" id="${opd._id}">${opd.institutionName}</a></li>`;
  }

  const institutionBudgetField = `<div class="d-inline-flex my-2 align-items-center" id="institution-${totalOpd}">                          
                          <div class="me-2 w-50">
                              <label for="opdId${totalOpd}" class="form-label">Nama Lembaga <span class="text-danger"> *</span></label>
                              <div class="dropdown w-100">
                                  <input type="hidden" class="form-control opd-id-val" name="institutionBudget[${totalOpd}][opdId]" id="opd-id-${totalOpd}" required>                                
                                  <input type="hidden" class="form-control opd-name-val" name="institutionBudget[${totalOpd}][institutionName]" id="institution-name-${totalOpd}" required>                                
                                  <button id="institution-btn" class="btn btn-light dropdown-toggle w-100" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Pilih Lembaga
                                  </button>
                                  <ul class="dropdown-menu w-100">
                                      ${institutionDropdownItems}
                                  </ul>
                              </div>
                          </div>                
                          <div class="me-2">
                            <label for="pkbBudget${totalOpd}" class="form-label">PKB</label>
                            <input type="number" class="form-control" name="institutionBudget[${totalOpd}][dbhBudget][pkb]" id="pkb-budget-${totalOpd}">
                          </div>                                                        
                          <div class="me-2">
                            <label for="bbnkbBudget${totalOpd}" class="form-label">BBNKB</label>
                            <input type="number" class="form-control" name="institutionBudget[${totalOpd}][dbhBudget][bbnkb]" id="bbnkb-budget-${totalOpd}">
                          </div> 
                          <div class="me-2">
                            <label for="pbbkbBudget${totalOpd}" class="form-label">PBBKB</label>
                            <input type="number" class="form-control" name="institutionBudget[${totalOpd}][dbhBudget][pbbkb]" id="pbbkb-budget-${totalOpd}">
                          </div>                                                        
                          <div class="me-2">
                            <label for="papBudget${totalOpd}" class="form-label">PAP</label>
                            <input type="number" class="form-control" name="institutionBudget[${totalOpd}][dbhBudget][pap]" id="pap-budget-${totalOpd}">
                          </div>
                          <div class="me-2">
                            <label for="pajakRokokBudget${totalOpd}" class="form-label">Pajak Rokok</label>
                            <input type="number" class="form-control" name="institutionBudget[${totalOpd}][dbhBudget][pajakRokok]" id="pajakRokok-budget-${totalOpd}">
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

$("#institution-dbh-form").on(
  "click",
  ".dropdown ul li a.institution-item",
  function () {
    const institutionTxt = $(this).text();
    const institutionVal = $(this).attr("id");

    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    $(this)
      .parent()
      .parent()
      .siblings("button#institution-btn")
      .text(institutionTxt);
    $(this).parent().parent().siblings("input.opd-id-val").val(institutionVal);
    $(this)
      .parent()
      .parent()
      .siblings("input.opd-name-val")
      .val(institutionTxt);
  }
);

$("#clear-btn").click(function () {
  $("#dbh-realization-form").find("input").val("");
  $(".dropdown ul li a.period-item").removeClass("active");
  $("#period-btn").text("Pilih Triwulan");
  $("#institution-dbh-form").empty();

  for (let id = 1; id <= totalOpd; id++) {
    $(`#institution-${id}`).remove();
  }

  totalOpd = 0;
  $("input#total-opd").val(totalOpd);
  $("#total-opd-txt").text(totalOpd.toString());
});

$("#dbh-realization-form").on("submit", function (event) {
  const periodVal = $("input#period").val();
  let opdIdValIsValid = true;

  $("input.opd-val").each(function () {
    if ($(this).val().trim() === "") {
      opdIdValIsValid = false;
    } else {
      opdIdValIsValid = true;
    }
  });

  console.log("INPUT FIELD VALID : " + opdIdValIsValid);

  if (!periodVal) {
    event.preventDefault();
    alert("Mohon pilih triwulan terlebih dahulu");
  } else if (!opdIdValIsValid) {
    event.preventDefault();
    alert("Mohon Tambahkan lembaga terlebih dahulu");
  } else {
    return;
  }
});
