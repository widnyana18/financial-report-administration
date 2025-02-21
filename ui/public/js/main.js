// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  ("use strict");

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

(() => {
  let msg = JSON.parse($("#toast-msg").val());
  const toastSuccess = new bootstrap.Toast("#toast-success");
  const toastError = new bootstrap.Toast("#toast-error");
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Ambil CSRF token dari meta tag
  console.log("MSG = " + JSON.stringify(msg));

  if (msg.error) {
    toastError.show();
  }
  if (msg.success) {
    toastSuccess.show();    
  }

  // Set header CSRF token untuk semua request AJAX
  $.ajaxSetup({
    headers: {
      "Content-Type": "application/json",
      "csrf-token": csrfToken,
    },
  });
})();
