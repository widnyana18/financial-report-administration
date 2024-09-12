const dbhListDatajsonString = $("input#dbh-budget-data").val();
const parseDbhBudgetList = JSON.parse(dbhListDatajsonString);
let $period = $(".dropdown button#period-btn").text();
let $year = $(".dropdown button#year-btn").text();

console.log("DBH LIST : " + parseDbhBudgetList);

const showParentParameter = (element, parameter) => {
  const prevParameter = $(element).parent().prev().children().text();
  let parameterTypeItem = [];

  console.log(element + "|||" + parameter);

  $("#parent-parameter").empty();

  if (parameter !== "Lembaga") {
    for (const item of parseDbhBudgetList) {
      if (prevParameter === item.parameter) {
        parameterTypeItem.push(`<li>
          <a class="dropdown-item parameter-type-item" id="${item._id}">${item.name}</a>
        </li>`);
      }
    }

    parameterTypeItem.join(" ");

    const dropdownWidget = `
        <label for="parameter-type" class="form-label">${prevParameter} <span class="text-danger">*</span></label>
        <div class="dropdown">
            <input type="hidden" name="parentId" id="parameter-type">
            <button id="parameter-type-btn" class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Pilih ${prevParameter}</button>
            <ul class="dropdown-menu" id="parameter-type-list">
              ${parameterTypeItem}
            </ul>
        </div>`;

    $("#parent-parameter").append(dropdownWidget);

    $("#parent-parameter > .dropdown ul li a.parameter-type-item").click(
      function () {
        const parameterType = $(this).text();
        const parameterTypeId = $(this).attr("id");

        $(".dropdown ul li a.parameter-type-item").removeClass("active");
        $(this).addClass("active");
        $("#parameter-type-btn").text(parameterType);
        $(".dropdown input#parameter-type").val(parameterTypeId);
      }
    );
  }
};

$(".dropdown ul li a#period-list").click(function () {
  $(".dropdown ul li a#period-list").removeClass("active");
  $(this).addClass("active");
  $period = $(this).text();
  $("#period-btn").text($period);
});

$(".dropdown ul li a#year-list").click(function () {
  $(".dropdown ul li a#year-list").removeClass("active");
  $(this).addClass("active");
  $year = $(this).text();
  $("#year-btn").text($year);
});

$(".dropdown-menu .parameter-item").click(function () {
  const parameter = $(this).text();
  console.log("TEXT: " + parameter);

  $(".dropdown ul li a.parameter-item").removeClass("active");
  $(this).addClass("active");
  $("#parameter-btn").text(parameter);
  $(".dropdown input#parameter").val(parameter);
  showParentParameter(this, parameter);
});

$("button#clear-btn").click(function () {
  clearAllInputForm();
});

const clearAllInputForm = () => {
  $(".dropdown ul li a#parameter-item").removeClass("active");
  $("#parameter-btn").text("Pilih Parameter");
  $("#parent-parameter").empty();
  // $("form#dbh-budget-form")[0].reset();

  $("#dbh-budget-form").find("input").val("");

  // Option 1: Remove validation attributes
  $("#dbh-budget-form").find("input").removeAttr("required");
};

$("button a#filter-btn").click(function () {
  $(this).attr("href", `/?triwulan=${$period}&tahun=${$year}&edit=false`);
});

$("td#edit-btn").click(function () {
  const dbhId = $(this).parent().attr("id");
  const selectedBudget = parseDbhBudgetList.find((dbh) => dbh._id === dbhId);
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

  $("form#dbh-budget-form").attr(
    "action",
    `api/dbh/edit/${selectedBudget._id}`
  );
  $("#submit-form-btn").text("RUBAH DATA");
  $(".dropdown button#parameter-btn").prop("disabled", true);
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
