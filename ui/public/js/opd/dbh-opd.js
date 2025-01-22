const dbhRealizationDataJson = $("input#dbh-realization-data").val();
const parsedDbhRealizationData = JSON.parse(dbhRealizationDataJson);

$(".hide-input").hide();

const showParentParameter = (parentParam, parameter) => {  
  let parentParameterItem = [];

  console.log(parentParam + "|||" + parameter);

  $("#parent-parameter").empty();

  if (parameter !== "Program") {
    for (const item of parsedDbhRealizationData) {
      if (parentParam === item.parameter) {
        parentParameterItem.push(`<option class="parent-parameter-item" id="${item._id}" value="${item._id}">${item.name}</option>`);
      }
    }

    parentParameterItem.join(" ");

    const dropdownWidget = `
        <label for="parent-parameter" class="form-label">${parentParam} <span class="text-danger">*</span></label>
        <select name="dbhRealization[parentParamId]" id="parent-parameter" class="form-select parent-parameter-select" aria-label="Parent Parameter Select" required>
            <option class="parent-parameter-item" value="">Pilih ${parentParam}</option>                              
            ${parentParameterItem}                                    
        </select>`;

    $("#parent-parameter").append(dropdownWidget);
  }
};

$(".parameter-select").on("change", function () {
  const selectedParamVal = $(this).val(); 
  const parentParamVal = $(this).children("option.parameter-item:selected").prev().val();
  
  showParentParameter(
    parentParamVal,
    selectedParamVal
  );

  if (selectedParamVal != "Sub Kegiatan") {
    $(".hide-input").hide();
    $(".form-input").addClass("container w-50");
  } else {
    $(".hide-input").show();
    $(".form-input").removeClass("container w-50");
  }
});

$("button#clear-btn").click(function () {
  clearAllInputForm();
});

const clearAllInputForm = () => {
  $(".dropdown ul li a#parameter-item").removeClass("active");
  $("#parameter-btn").text("Pilih Parameter");
  $("#parent-parameter").empty();
  // $("form#dbh-realization-form")[0].reset();

  $("#dbh-realization-form").find("input").val("");

  // Option 1: Remove validation attributes
  $("#dbh-realization-form").find("input").removeAttr("required");
};

$("td#edit-btn").click(function () {
  const dbhId = $(this).parent().attr("id");
  const selectedBudget = parsedDbhRealizationData.find(
    (dbh) => dbh._id === dbhId
  );
  console.log("DBH ID : " + dbhId);

  // Get the current URL parameters
  const baseUrl = window.location.origin;
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("edit", "true");
  const pathname = window.location.pathname;
  const newUrl = `${baseUrl}${pathname}${dbhId}?${urlParams.toString()}`;
  window.history.pushState({ path: newUrl }, "", newUrl);

  $("#parameter-btn").text(selectedBudget.parameter);

  $("#name").val(selectedBudget.name);
  $("#no-rek").val(selectedBudget.noRek);
  $(".dropdown input#parameter").val(selectedBudget.parameter);
  $("#pagu").val(selectedBudget.pagu ?? 0);
  $("#pkb-budget").val(selectedBudget.dbh.pkb[0] ?? 0);
  $("#pkb-realization").val(selectedBudget.dbh.pkb[1] ?? 0);
  $("#bbnkb-budget").val(selectedBudget.dbh.bbnkb[0] ?? 0);
  $("#bbnkb-realization").val(selectedBudget.dbh.bbnkb[1] ?? 0);
  $("#pbbkb-budget").val(selectedBudget.dbh.pbbkb[0] ?? 0);
  $("#pbbkb-realization").val(selectedBudget.dbh.pbbkb[1] ?? 0);
  $("#pap-budget").val(selectedBudget.dbh.pap[0] ?? 0);
  $("#pap-realization").val(selectedBudget.dbh.pap[1] ?? 0);
  $("#pajak-rokok-budget").val(selectedBudget.dbh.pajakRokok[0] ?? 0);
  $("#pajak-rokok-realization").val(selectedBudget.dbh.pajakRokok[1] ?? 0);

  $("form#dbh-realization-form").attr(
    "action",
    `api/dbh/edit/${selectedBudget._id}`
  );
  $("#submit-form-btn").text("RUBAH DATA");
  $(".dropdown button#parameter-btn").prop("disabled", true);
});

$("button#send-report-btn").click(function () {
  fetch("/api/dbh/send-report/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((data) => {
      $(this).prop("disabled", true);
    })
    .catch((error) => console.error(error));
});

$("td#delete-btn").click(function () {
  const dbhId = $(this).parent().attr("id");

  console.log("DBH ID : " + dbhId);

  fetch("/api/dbh/delete/" + dbhId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: dbhId,
    }),
  })
    .then(function (response) {
      return $(`tbody tr#${dbhId}`).empty();
    })
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
});

// $("a#logout-btn").click(function () {
//   fetch("/api/auth/logout", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//   })
//     .then((data) => console.log(data))
//     .catch((error) => console.error(error));
// });
