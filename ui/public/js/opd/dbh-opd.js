const dbhRealizationDataJson = $("input#dbh-realization-data").val();
const parsedDbhRealizationData = JSON.parse(dbhRealizationDataJson);
const urlParams = new URLSearchParams(window.location.search);
const isEdit = urlParams.get("edit");

$(".hide-input").hide();
$(".form-input").addClass("container w-50");

$(".dropdown ul li a.report-item").click(function () {
  const reportTxt = $(this).text();
  const reportVal = $(this).attr("id");

  $(".dropdown ul li a.report-item").removeClass("active");
  $(this).addClass("active");
  $("#report-btn").text(reportTxt);
  $("input#reporting-id").val(reportVal);
});

const parameterChanged = (elem) => {
  const selectedParamVal = $(elem).val();
  const parentParamVal = $(elem)
    .children("option.parameter-item:selected")
    .prev()
    .val();

  showParentParameter(parentParamVal, selectedParamVal);

  console.log("SELECTED PARAM VAL : " + selectedParamVal);

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
          `<option class="parent-parameter-item" id="${item._id}" value="${
            item._id
          }" ${selectedParentParamId == item._id ? "selected" : ""}>${
            item.name
          }</option>`
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

$("td a#edit-btn").click(function () {
  const dbhId = $(this).parent().parent().prev();
  $("input#selected-dbh-id").val(dbhId);
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

$("td > a#delete-btn").click(function () {
  const dbhId = $(this).parent().parent().attr("id");
  const reportingId = $("input#reporting-id").val();
  const directLink = $("ul li a.report-item.active").attr("href");

  console.log("directLink : " + directLink);

  fetch("/api/dbh/delete/" + dbhId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dbhId,
      reportingId,
    }),
  })
    .then((data) => {
      console.log(data);
    })
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
