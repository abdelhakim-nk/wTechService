/* ==========================================================================
   Wtech Service — JavaScript principal
   Fonctionnel sans framework, progressivement amélioré
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------
     1. HEADER — ombre au scroll
     -------------------------------------------------------------------- */
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('header--scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------------------
     2. MENU BURGER (mobile)
     -------------------------------------------------------------------- */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (burger && mobileMenu) {
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function openMenu() {
      burger.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // Focus first link
      const first = mobileMenu.querySelector(focusableSelector);
      if (first) first.focus();
    }

    function closeMenu() {
      burger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      burger.focus();
    }

    burger.addEventListener('click', () => {
      const isOpen = burger.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    // Fermer avec Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });

    // Fermer au clic sur l'overlay
    const overlay = document.querySelector('.mobile-menu__overlay');
    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    // Fermer au clic sur un lien du menu
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* --------------------------------------------------------------------
     3. SOUS-MENU MOBILE (Nos services)
     -------------------------------------------------------------------- */
  const subToggles = document.querySelectorAll('.mobile-menu__sub-toggle');
  subToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      const submenu = toggle.nextElementSibling;
      toggle.setAttribute('aria-expanded', String(!expanded));
      if (submenu) {
        submenu.setAttribute('aria-hidden', String(expanded));
      }
    });
  });

  /* --------------------------------------------------------------------
     4. SOUS-MENU DESKTOP (hover + focus + click)
     -------------------------------------------------------------------- */
  const dropdownToggles = document.querySelectorAll('.nav__dropdown-toggle');
  dropdownToggles.forEach((toggle) => {
    const parent = toggle.closest('.nav__item--dropdown');
    const dropdown = parent ? parent.querySelector('.nav__dropdown') : null;

    if (!parent || !dropdown) return;

    // Toggle au clic
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      closeAllDropdowns();
      if (!expanded) {
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Fermer quand on quitte la zone
    parent.addEventListener('mouseleave', () => {
      toggle.setAttribute('aria-expanded', 'false');
    });

    // Fermer avec Échap
    parent.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  });

  function closeAllDropdowns() {
    dropdownToggles.forEach((t) => t.setAttribute('aria-expanded', 'false'));
  }

  // Fermer si clic en dehors
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav__item--dropdown')) {
      closeAllDropdowns();
    }
  });

  /* --------------------------------------------------------------------
     5. ANIMATIONS AU SCROLL (IntersectionObserver)
     -------------------------------------------------------------------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced) {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length > 0 && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal--visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );
      reveals.forEach((el) => observer.observe(el));
    }
  }

  /* --------------------------------------------------------------------
     6. ANNEE DYNAMIQUE (footer)
     -------------------------------------------------------------------- */
  const yearEl = document.querySelector('.js-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------------------------
     7. FORMULAIRE DE CONTACT — validation + envoi AJAX
     -------------------------------------------------------------------- */
  const form = document.querySelector('.js-contact-form');
  if (form) {
    const successMsg = form.querySelector('.form__success');
    const honeyField = form.querySelector('.form__honey input');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Anti-spam : honeypot rempli = bot
      if (honeyField && honeyField.value) return;

      // Validation
      let valid = true;
      const groups = form.querySelectorAll('.form__group[data-required]');

      groups.forEach((group) => {
        const input = group.querySelector('input, select, textarea');
        const error = group.querySelector('.form__error');
        group.classList.remove('form__group--error');

        if (!input) return;

        let hasError = false;

        if (input.type === 'email' && input.value.trim()) {
          // Vérifier format email
          const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRe.test(input.value.trim())) {
            hasError = true;
            if (error) error.textContent = 'Veuillez entrer une adresse email valide.';
          }
        } else if (input.type === 'tel' && input.value.trim()) {
          // Vérifier format téléphone (français)
          const telRe = /^(?:(?:\+33|0)\s?[1-9])(?:[\s.-]?\d{2}){4}$/;
          if (!telRe.test(input.value.trim())) {
            hasError = true;
            if (error) error.textContent = 'Veuillez entrer un numéro de téléphone valide.';
          }
        } else if (!input.value.trim()) {
          hasError = true;
          if (error) error.textContent = 'Ce champ est requis.';
        }

        if (hasError) {
          group.classList.add('form__group--error');
          valid = false;
        }
      });

      if (!valid) {
        // Focus le premier champ en erreur
        const firstErr = form.querySelector('.form__group--error input, .form__group--error select, .form__group--error textarea');
        if (firstErr) firstErr.focus();
        return;
      }

      // Envoi AJAX (Web3Forms / Formspree)
      const submitBtn = form.querySelector('button[type="submit"]');
      const btnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours…';
      }

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          form.reset();
          form.style.display = 'none';
          if (successMsg) successMsg.classList.add('form__success--visible');
        } else {
          throw new Error('Erreur serveur');
        }
      } catch {
        alert('Une erreur est survenue. Veuillez réessayer ou nous contacter par téléphone.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = btnText;
        }
      }
    });

    // Retirer l'erreur en temps réel quand l'utilisateur corrige
    form.querySelectorAll('.form__group[data-required]').forEach((group) => {
      const input = group.querySelector('input, select, textarea');
      if (input) {
        input.addEventListener('input', () => {
          group.classList.remove('form__group--error');
        });
      }
    });
  }

  /* --------------------------------------------------------------------
     8. SMOOTH SCROLL pour les ancres (fallback)
     -------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
