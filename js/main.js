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

  // Contact Us pop-up form — submissions are emailed to Intellique Research School
  var CONTACT_TO = "intelliqueresearchschool@gmail.com";
  var openers = document.querySelectorAll("[data-open-contact]");
  if (openers.length) {
    var wrap = document.createElement("div");
    wrap.className = "modal";
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="modal-backdrop" data-close-contact></div>' +
      '<div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-title">' +
        '<button type="button" class="modal-close" aria-label="Close" data-close-contact>&times;</button>' +
        '<h2 id="contact-title">Contact us</h2>' +
        '<p class="modal-sub">Tell us a little about what you need and our team will get back to you.</p>' +
        '<form id="popup-contact-form" novalidate>' +
          '<label>Name<input type="text" name="name" required autocomplete="name"></label>' +
          '<label>Email<input type="email" name="email" required autocomplete="email"></label>' +
          '<label>Phone <span class="opt">(optional)</span><input type="tel" name="phone" autocomplete="tel"></label>' +
          '<label>I\'m interested in<select name="interest">' +
            '<option value="">Select an option</option>' +
            '<option>Academic Research</option>' +
            '<option>Business Research &amp; Consulting</option>' +
            '<option>Something else</option>' +
          '</select></label>' +
          '<label>Message<textarea name="message" rows="4" required></textarea></label>' +
          '<input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off">' +
          '<button type="submit" class="btn btn-primary btn-block">Send message</button>' +
          '<p class="form-status" role="status"></p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(wrap);

    var pform = wrap.querySelector("form");
    var status = wrap.querySelector(".form-status");
    var submitBtn = pform.querySelector('button[type="submit"]');
    var lastFocus = null;

    function openModal() {
      lastFocus = document.activeElement;
      wrap.hidden = false;
      document.body.classList.add("modal-open");
      status.textContent = ""; status.className = "form-status";
      pform.hidden = false;
      setTimeout(function () { pform.querySelector("input").focus(); }, 30);
    }
    function closeModal() {
      wrap.hidden = true;
      document.body.classList.remove("modal-open");
      if (lastFocus) lastFocus.focus();
    }
    openers.forEach(function (b) { b.addEventListener("click", openModal); });
    wrap.querySelectorAll("[data-close-contact]").forEach(function (el) { el.addEventListener("click", closeModal); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !wrap.hidden) closeModal(); });

    pform.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!pform.checkValidity()) {
        status.textContent = "Please fill in your name, a valid email, and a message.";
        status.className = "form-status error";
        return;
      }
      var data = new FormData(pform);
      data.append("_subject", "New enquiry from theresearchschool.com — " + data.get("name"));
      data.append("_template", "table");
      data.append("_captcha", "false");
      submitBtn.disabled = true; submitBtn.textContent = "Sending…";
      fetch("https://formsubmit.co/ajax/" + CONTACT_TO, {
        method: "POST", headers: { "Accept": "application/json" }, body: data
      }).then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) !== "true") throw j; }); })
        .then(function () {
          pform.reset();
          status.textContent = "Thank you — your message has been sent. We'll be in touch soon.";
          status.className = "form-status ok";
        })
        .catch(function () {
          status.innerHTML = 'Sorry, that didn\'t go through. Please email us at <a href="mailto:' + CONTACT_TO + '">' + CONTACT_TO + '</a>.';
          status.className = "form-status error";
        })
        .then(function () { submitBtn.disabled = false; submitBtn.textContent = "Send message"; });
    });
  }

  // Numbers band: count up once when scrolled into view
  var nums = document.querySelectorAll(".stat-num[data-count]");
  if (nums.length && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, target = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "", t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var k = Math.min((t - t0) / 1400, 1), e = 1 - Math.pow(1 - k, 3);
          el.textContent = pre + Math.round(target * e) + suf;
          if (k < 1) requestAnimationFrame(step);
        }
        el.textContent = pre + "0" + suf;
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
