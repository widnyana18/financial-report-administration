$(document).ready(function () {
  let $period = $(".dropdown button#period-btn").text();
  let $year = $(".dropdown button#year-btn").text();

  // $("#period-btn").text($period);
  // $("#year-btn").text($year);
  
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
    $(".dropdown ul li a#parameter-list").removeClass("active");
    $(this).addClass("active");
    $("#parameter-btn").text($parameter);
    $(".dropdown input#parameter").val($parameter);

    if($parameter !== "Lembaga"){
      
    }
  });

  $("button a#filter-btn").click(function () {
    $(this).attr("href", `/?triwulan=${period}&tahun=${year}&edit=false`);
  });
});
