$(".dropdown ul li a.institution-item").click(function () {
  const institutionVal = $(this).text();  

  $(".dropdown ul li a.institution-item").removeClass("active");
  $(this).addClass("active");
  $("#institution-btn").text(institutionVal);
  $(".dropdown input#institution-val").val(institutionVal);  
});