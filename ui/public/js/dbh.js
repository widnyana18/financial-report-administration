$(document).ready(function () {
  let $period = $(".dropdown button#period-btn").text();
  let $year = $(".dropdown button#year-btn").text();

  $(".dropdown ul li a#period-list").click(function (e) {
    $(".dropdown ul li a#period-list").removeClass("active");
    $(this).addClass("active");
    $period = $(this).text();
    $("#period-btn").text($period);
  });

  $(".dropdown ul li a#year-list").click(function (e) {
    $(".dropdown ul li a#year-list").removeClass("active");
    $(this).addClass("active");
    $year = $(this).text();
    $("#year-btn").text($year);
  });

  $(".dropdown ul li a#parameter-list").click(function (e) {
    const $parameter = $(this).text();
    const $prevParameter = $(this).parent().prev().children().text();
    const $jsonString = $("input#data-dbh").val();
    const $parseDbhBudget = JSON.parse($jsonString);
    let $parameterTypeItem = [];

    $(".dropdown ul li a#parameter-list").removeClass("active");
    $(this).addClass("active");
    $("#parameter-btn").text($parameter);
    $(".dropdown input#parameter").val($parameter);

    $("#parent-parameter").html("");

    if ($parameter !== "Lembaga") {
      for (const item of $parseDbhBudget) {
        if ($prevParameter === item.parameter) {
          $parameterTypeItem.push(`<li>
            <a id="parameter-type-item" class="dropdown-item">${item.name}</a>
          </li>`);
        }
      }

      $parameterTypeItem.join(" ");

      const $dropdownWidget = `
          <label for="parameter-type" class="form-label">${$prevParameter} <span class="text-danger">*</span></label>
          <div class="dropdown">
              <input type="hidden" name="parentId" id="parameter-type" required>
              <button id="parameter-type-btn" class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Pilih ${$prevParameter}</button>
              <ul class="dropdown-menu" id="parameter-type-list">
                ${$parameterTypeItem}
              </ul>
          </div>`;

      $("#parent-parameter").append($dropdownWidget);

      $("#parent-parameter > .dropdown ul li a#parameter-type-item").click(
        function (e) {
          const $parameterType = $(this).text();
          $(".dropdown ul li a#parameter-type-item").removeClass("active");
          $(this).addClass("active");
          $("#parameter-type-btn").text($parameterType);
          $(".dropdown input#parameter-type").val($parameterType);
        }
      );
    }
  });

  $("button a#filter-btn").click(function () {
    $(this).attr("href", `/?triwulan=${$period}&tahun=${$year}&edit=false`);
  });

  $("button#clear-btn").click(function () {
    $(".dropdown ul li a#parameter-list").removeClass("active");
    $("#parameter-btn").text("Pilih Parameter");
    $(".dropdown input#parameter").val("");
    $("#parent-parameter").html("");
    $("#dbh-budget-form").find("input").val("");
    $("#dbh-budget-form").find("input[type='number']").val("0");
  });
});
