/**
 * Home Fit+ — Main JavaScript (retrofit24.pl)
 * Scroll observers, nav behavior, animated counters, FAQ accordion, form handling
 */
(function () {
  'use strict';

  // --- Navbar Scroll ---
  const navbar = document.querySelector('.navbar');
  const scrollThreshold = 60;

  function handleNavScroll() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // --- Mobile Nav ---
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      const isActive = mobileNav.classList.contains('active');
      document.body.style.overflow = isActive ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', isActive);
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Smooth Scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const y = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // --- Scroll Reveal ---
  const revealElements = document.querySelectorAll('.reveal, .benefit-card');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // --- Animated Counters ---
  const counterElements = document.querySelectorAll('[data-count]');
  let countersAnimated = false;

  function animateCounter(el) {
    const target = el.getAttribute('data-count');
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const isDecimal = target.includes('.');
    const targetNum = parseFloat(target.replace(/[^\d.]/g, ''));
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = targetNum * eased;

      if (isDecimal) {
        el.textContent = prefix + current.toFixed(0) + suffix;
      } else {
        // Format with spaces for thousands
        const formatted = Math.floor(current).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        el.textContent = prefix + formatted + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Set final value
        el.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          counterElements.forEach(animateCounter);
          counterObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  counterElements.forEach((el) => counterObserver.observe(el));

  // --- FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all
      faqItems.forEach((other) => {
        other.classList.remove('active');
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-answer').style.maxHeight = '0';
      });

      // Open clicked (if was closed)
      if (!isOpen) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // --- Contact Form ---
  const form = document.getElementById('contactForm');
  if (form) {
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('.form-submit .btn');
    const honeypot = form.querySelector('.ohnohoney input');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Honeypot check
      if (honeypot && honeypot.value) return;

      // Clear previous errors
      form.querySelectorAll('.form-group').forEach((g) => g.classList.remove('invalid'));
      statusEl.className = 'form-status';
      statusEl.style.display = 'none';

      // Validate required fields
      let valid = true;
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          field.closest('.form-group')?.classList.add('invalid');
          valid = false;
        }
      });

      // Email validation
      const emailField = form.querySelector('[name="email"]');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.closest('.form-group')?.classList.add('invalid');
        valid = false;
      }

      // RODO checkbox
      const rodoCheckbox = form.querySelector('[name="rodo"]');
      if (rodoCheckbox && !rodoCheckbox.checked) {
        rodoCheckbox.closest('.checkbox-group')?.classList.add('invalid');
        valid = false;
      }

      if (!valid) {
        statusEl.textContent = 'Uzupe\u0142nij wymagane pola.';
        statusEl.className = 'form-status error';
        statusEl.style.display = 'block';
        return;
      }

      // Prepare data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      delete data.website; // honeypot

      // Loading state
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '';
      const spinner = document.createElement('span');
      spinner.className = 'spinner';
      submitBtn.appendChild(spinner);
      submitBtn.appendChild(document.createTextNode(' Wysy\u0142anie...'));
      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          statusEl.textContent = 'Dzi\u0119kujemy! Wiadomo\u015B\u0107 zosta\u0142a wys\u0142ana. Skontaktujemy si\u0119 wkr\u00F3tce.';
          statusEl.className = 'form-status success';
          statusEl.style.display = 'block';
          form.reset();

          // Conversion tracking via GTM dataLayer
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            'event': 'form_submission',
            'form_type': 'contact'
          });
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        statusEl.textContent = 'Wyst\u0105pi\u0142 b\u0142\u0105d. Spr\u00F3buj ponownie lub skontaktuj si\u0119 telefonicznie.';
        statusEl.className = 'form-status error';
        statusEl.style.display = 'block';
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
})();
