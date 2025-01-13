$(".dropdown ul li a.institution-item").click(function () {
  const institutionName = $(this).text();
  const institutionId = $(this).attr("id");

  $(".dropdown ul li a.institution-item").removeClass("active");
  $(this).addClass("active");
  $("#institution-btn").text(institutionName);
  $(".dropdown input#institution").val(institutionId);
  console.log('INSTITUTION ID : ' + institutionId);
});