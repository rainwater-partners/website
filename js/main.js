// ===== Mobile Navigation =====
(function () {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var overlay = document.getElementById('navOverlay');

  if (!toggle || !links) return;

  function openNav() {
    links.classList.add('open');
    if (overlay) overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeNav() {
    links.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    if (links.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  if (overlay) {
    overlay.addEventListener('click', closeNav);
  }

  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });
})();


// ===== FAQ Accordion =====
(function () {
  var items = document.querySelectorAll('.faq__item');

  items.forEach(function (item) {
    var question = item.querySelector('.faq__question');
    if (!question) return;

    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      items.forEach(function (other) {
        other.classList.remove('open');
        var btn = other.querySelector('.faq__question');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


// ===== Sign-Up Form → Google Sheets + Zoho Confirmation Email =====
(function () {
  var form = document.getElementById('signupForm');
  var success = document.getElementById('formSuccess');

  if (!form || !success) return;

  // ---------------------------------------------------------------
  // Replace this with your deployed Google Apps Script Web App URL.
  // See setup/google-apps-script.js for the server-side code.
  // ---------------------------------------------------------------
  var SCRIPT_URL = 'REPLACE_WITH_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Collect all form fields dynamically — extensible to any form shape
    var formData = {};
    var valid = true;

    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      if (!field.name) return;

      // Checkboxes: collect checked values as comma-separated string
      if (field.type === 'checkbox') {
        if (field.checked) {
          formData[field.name] = formData[field.name]
            ? formData[field.name] + ', ' + field.value
            : field.value;
        }
        return;
      }

      field.style.borderColor = '';

      if (field.required && !field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        valid = false;
      }

      formData[field.name] = field.value.trim();
    });

    // Email format check
    var email = form.querySelector('#email');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#e74c3c';
      valid = false;
    }

    if (!valid) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting\u2026';

    // POST to Google Apps Script (no-cors for GitHub Pages compatibility)
    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(function () {
      form.style.display = 'none';
      success.classList.add('show');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    })
    .catch(function () {
      form.style.display = 'none';
      success.classList.add('show');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    })
    .finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
  });

  // Clear error styling on input
  form.querySelectorAll('input, select, textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      field.style.borderColor = '';
    });
    field.addEventListener('change', function () {
      field.style.borderColor = '';
    });
  });
})();
