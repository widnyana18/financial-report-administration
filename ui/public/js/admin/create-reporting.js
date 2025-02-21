let idxArr = $("input#idx-arr").val() - 1 ?? 0;
let totalOpd = $("input#total-opd").val() ?? 0;

$("#add-institution-btn").click(function () {
  idxArr++;
  totalOpd++;

  let institutionDropdownItems = "";
  const institutions = $("#institutions-data").val();
  const institutionsArr = JSON.parse(institutions);
  console.log('istitutionsArr = ' + institutions);

  for (opd of institutionsArr) {
    institutionDropdownItems += `<option class="institution-item" value='${opd._id}' id="${opd.institutionName}">${opd.institutionName}</option>`;
  }

  const institutionBudgetField = `<div class="d-inline-flex my-2 align-items-center" id="institution-${idxArr}">                          
                          <div class="me-2 w-50">                              
                            <label for="opd-id-${idxArr}" class="form-label">Nama Lembaga <span class="text-danger"> *</span></label>
                            <select name="institutionBudget[${idxArr}][opdId]" id="opd-id-${idxArr}" class="form-select institution-select" aria-label="Institution Select" required>
                                <option class="institution-item" value="">Pilih Lembaga</option>                              
                                ${institutionDropdownItems}
                            </select>                               
                          </div>
                          <div class="me-2">
                            <label for="pkbBudget${idxArr}" class="form-label">PKB</label>
                            <input type="number" class="form-control" name="institutionBudget[${idxArr}][dbhBudget][pkb]" id="pkb-budget-${idxArr}">
                          </div>                                                        
                          <div class="me-2">
                            <label for="bbnkbBudget${idxArr}" class="form-label">BBNKB</label>
                            <input type="number" class="form-control" name="institutionBudget[${idxArr}][dbhBudget][bbnkb]" id="bbnkb-budget-${idxArr}">
                          </div> 
                          <div class="me-2">
                            <label for="pbbkbBudget${idxArr}" class="form-label">PBBKB</label>
                            <input type="number" class="form-control" name="institutionBudget[${idxArr}][dbhBudget][pbbkb]" id="pbbkb-budget-${idxArr}">
                          </div>                                                        
                          <div class="me-2">
                            <label for="papBudget${idxArr}" class="form-label">PAP</label>
                            <input type="number" class="form-control" name="institutionBudget[${idxArr}][dbhBudget][pap]" id="pap-budget-${idxArr}">
                          </div>
                          <div class="me-2">
                            <label for="pajakRokokBudget${idxArr}" class="form-label">Pajak Rokok</label>
                            <input type="number" class="form-control" name="institutionBudget[${idxArr}][dbhBudget][pajakRokok]" id="pajakRokok-budget-${idxArr}">
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
  const oldDataInstitution = $(this).parent().hasClass("old-data-institution");
  if (!oldDataInstitution) {
    idxArr--;
  }
  totalOpd--;

  $(this).parent().remove();
  $("input#total-opd").val(totalOpd);
  $("#total-opd-txt").text(totalOpd.toString());
});

$("#clear-btn").click(function () {
  $("form#create-reporting-form")[0].reset();

  for (let id = 1; id <= totalOpd; id++) {
    $(`#institution-${id}`).remove();
  }

  idxArr = $("input#idx-arr").val() - 1;

  totalOpd = 0;
  $("input#total-opd").val(totalOpd);
  $("#total-opd-txt").text(totalOpd.toString());
});

