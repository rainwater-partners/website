// ===== Mobile Navigation =====
(function () {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');

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

  // Close on nav link click (mobile)
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

      // Close all items
      items.forEach(function (other) {
        other.classList.remove('open');
        var btn = other.querySelector('.faq__question');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked item
      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


// ===== Sign-Up Form =====
(function () {
  var form = document.getElementById('signupForm');
  var success = document.getElementById('formSuccess');

  if (!form || !success) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic validation
    var companyName = form.querySelector('#companyName');
    var contactName = form.querySelector('#contactName');
    var email = form.querySelector('#email');
    var annualSpend = form.querySelector('#annualSpend');

    var valid = true;

    [companyName, contactName, email, annualSpend].forEach(function (field) {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        valid = false;
      }
    });

    // Email format check
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#e74c3c';
      valid = false;
    }

    if (!valid) return;

    // Show success message
    form.style.display = 'none';
    success.classList.add('show');

    // Scroll to success message
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
