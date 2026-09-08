// The Research School — shared site behaviour

document.addEventListener("DOMContentLoaded", function () {
  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("open");
      });
    });
  }

  // Contact form (static hosting: no backend, so we open the visitor's
  // mail client pre-filled and show a confirmation note).
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#name").value.trim();
      var email = form.querySelector("#email").value.trim();
      var org = form.querySelector("#organisation").value.trim();
      var interest = form.querySelector("#interest").value;
      var message = form.querySelector("#message").value.trim();

      var body = "Name: " + name + "\nEmail: " + email +
        (org ? "\nOrganisation: " + org : "") +
        (interest ? "\nArea of interest: " + interest : "") +
        "\n\n" + message;

      var mailto = "mailto:info@theresearchschool.com" +
        "?subject=" + encodeURIComponent("Enquiry from theresearchschool.com — " + name) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      var success = document.getElementById("form-success");
      if (success) success.classList.add("show");
      form.reset();
    });
  }

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
