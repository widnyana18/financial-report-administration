const dbhRealizationDataJson = $("input#dbh-realization-data").val();
const parsedDbhRealizationData = JSON.parse(dbhRealizationDataJson);
const urlParams = new URLSearchParams(window.location.search);
const isEdit = urlParams.get("edit");

console.log(dbhRealizationDataJson);

$(".hide-input").hide();
$(".form-input").addClass("container w-50");

const parameterChanged = (elem) => {
  const selectedParamVal = $(elem).val();
  const parentParamVal = $(elem)
    .children("option.parameter-item:selected")
    .prev()
    .val();

  showParentParameter(parentParamVal, selectedParamVal);

  console.log("parent : " + +parentParamVal + " val" + selectedParamVal);

  if (selectedParamVal == "Sub Kegiatan") {
    $(".hide-input").show();
    $(".form-input").removeClass("container w-50");
  } else {
    $(".hide-input").hide();
    $(".form-input").addClass("container w-50");
  }
};

const showParentParameter = (parentParam, parameter) => {
  const urlParams = new URLSearchParams(window.location.search);
  const isEdit = urlParams.get("edit");
  let parentParameterItem = [];

  const selectedDbhId = $("#selected-dbh-id").val();
  const lastIdxStr = selectedDbhId.lastIndexOf(".");
  const selectedParentParamId = selectedDbhId.substring(0, lastIdxStr);

  console.log("SELECTED PARENT PARAM ID : " + selectedParentParamId);

  console.log(parentParam + "|||" + parameter);

  $("#parent-parameter").empty();

  if (parameter && parameter !== "Program") {
    for (const item of parsedDbhRealizationData) {
      if (parentParam === item.parameter) {
        parentParameterItem.push(
          `<option class="parent-parameter-item" id="${item.name.replace(
            /\s/g,
            "-"
          )}" value="${item._id}" ${
            selectedParentParamId == item._id ? "selected" : ""
          }>${item.name}</option>`
        );
      }
    }

    parentParameterItem.join(" ");

    const dropdownWidget = `
        <label for="parent-parameter" class="form-label">${parentParam} <span class="text-danger">*</span></label>
        <select name="dbhRealization[parentParamId]" id="parent-parameter" class="form-select parent-parameter-select" aria-label="Parent Parameter Select" required ${
          isEdit == "true" ? "disabled" : ""
        } >
            <option class="parent-parameter-item" value="">Pilih ${parentParam}</option>                              
            ${parentParameterItem}                                    
        </select>`;

    $("#parent-parameter").append(dropdownWidget);
  }
};

if (isEdit == "true") {
  parameterChanged(".parameter-select");
}

$(".parameter-select").on("change", function () {
  parameterChanged(this);
});

$("button#clear-btn").click(function () {
  $("form#dbh-realization-form")[0].reset();

  $("#parent-parameter").empty();
});

$("#send-report-btn").on("click", function () {
  const reportingId = $("input#reporting-id").val();
  console.log("REPORTING ID = " + reportingId);

  $.ajax({
    url: "/api/dbh/send-report", // Replace with your API endpoint
    type: "POST",
    data: JSON.stringify({ reportingId }),
    contentType: "application/json",
    success: function (response) {
      console.log("Success:", response);
      $("#send-report-modal").modal("hide");
      window.location.reload();
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
    },
  });

  $(this).prop("disabled", true);
});

$("button#delete-dbh-button").click(function () {
  const dbhId = $("#open-modal-btn").data("dbhId");  

  $.ajax({
    url: "/api/dbh/delete/" + dbhId,
    type: "DELETE",
    contentType: "application/json",
    success: function (response) {
      console.log("Success:", response);
      $("#delete-dbh-modal").modal("hide");
      window.location.reload();
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
    },
  });
});

$("button#delete-account-button").click(function () {
  const opdId = $("#opdId").val();
  $.ajax({
    url: "/api/opd/delete/" + opdId,
    type: "DELETE",
    contentType: "application/json",
    success: function (response) {
      console.log("Success:", response);
      $("#delete-dbh-modal").modal("hide");
      window.location.href = "/login";
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
    },
  });
});
