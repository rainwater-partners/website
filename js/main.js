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
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxqyw1w8iBMlS76OTDaIlLLFHI39Rls1Og2HSUvS04EpRoqTB4NEtXuzU2C-JXYDCCkxQ/exec';

  var errorEl = document.getElementById('formError');
  var phoneNudge = document.getElementById('phoneNudge');

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.classList.add('show');
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }

  function isValidEmail(value) {
    // Requires something@domain.tld (TLD at least 2 chars)
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function isValidPhone(value) {
    // Strip non-digits; accept 10+ digits (handles US + international)
    var digits = value.replace(/\D/g, '');
    return digits.length >= 10;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    // Collect all form fields dynamically — extensible to any form shape
    var formData = {};
    var missingRequired = false;

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
        missingRequired = true;
      }

      formData[field.name] = field.value.trim();
    });

    if (missingRequired) {
      showError('Please fill in all required fields.');
      return;
    }

    // Blocking: email format
    var email = form.querySelector('#email');
    if (email && !isValidEmail(email.value)) {
      email.style.borderColor = '#e74c3c';
      showError('Please enter a valid email address.');
      return;
    }

    // Non-blocking: phone format (optional field)
    var phone = form.querySelector('#phone');
    if (phone && phone.value.trim() && !isValidPhone(phone.value)) {
      if (phoneNudge) phoneNudge.classList.add('show');
      // continue — do not block submission
    } else if (phoneNudge) {
      phoneNudge.classList.remove('show');
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting\u2026';

    // POST to Google Apps Script
    // Using text/plain to avoid CORS preflight on static sites
    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
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

  // Clear error styling + banner on input
  form.querySelectorAll('input, select, textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      field.style.borderColor = '';
      clearError();
      if (field.id === 'phone' && phoneNudge) {
        phoneNudge.classList.remove('show');
      }
    });
    field.addEventListener('change', function () {
      field.style.borderColor = '';
    });
  });

  // Validate on blur (when user leaves the field)
  var emailField = form.querySelector('#email');
  if (emailField) {
    emailField.addEventListener('blur', function () {
      if (emailField.value.trim() && !isValidEmail(emailField.value)) {
        emailField.style.borderColor = '#e74c3c';
      } else {
        emailField.style.borderColor = '';
      }
    });
  }

  var phoneField = form.querySelector('#phone');
  if (phoneField && phoneNudge) {
    phoneField.addEventListener('blur', function () {
      if (phoneField.value.trim() && !isValidPhone(phoneField.value)) {
        phoneNudge.classList.add('show');
      } else {
        phoneNudge.classList.remove('show');
      }
    });
  }
})();
