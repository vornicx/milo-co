(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      if (!reducedMotion.matches) entry.target.classList.add('pupit-is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12 }) : null;
  const syncPreference = (value) => {
    document.querySelectorAll('[data-pupit-preference]').forEach((preference) => {
      preference.checked = preference.dataset.pupitPreference === value;
    });
  };
  const init = () => {
    document.querySelectorAll('[data-pupit-header]').forEach((header) => {
      if (header.dataset.pupitReady) return;
      header.dataset.pupitReady = 'true';
      const opener = header.querySelector('[data-pupit-menu-open]');
      const menu = header.querySelector('[data-pupit-menu]');
      if (!opener || !menu || typeof menu.showModal !== 'function') return;
      opener.hidden = false;
      const close = () => menu.close();
      opener.addEventListener('click', () => {
        menu.showModal();
        opener.setAttribute('aria-expanded', 'true');
        document.documentElement.classList.add('pupit-menu-is-open');
      });
      menu.querySelector('[data-pupit-menu-close]')?.addEventListener('click', close);
      menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
      menu.addEventListener('click', (event) => {
        if (event.target !== menu) return;
        const bounds = menu.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
      });
      menu.addEventListener('close', () => {
        opener.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('pupit-menu-is-open');
      });
      const resize = new ResizeObserver(() => { if (header.clientWidth >= 750 && menu.open) close(); });
      resize.observe(header);
    });
    document.querySelectorAll('[data-pupit-color]').forEach((input) => {
      if (input.dataset.pupitReady) return;
      input.dataset.pupitReady = 'true';
      input.addEventListener('change', () => {
        syncPreference(input.value);
        const status = input.closest('[data-pupit-product]')?.querySelector('[data-pupit-color-status]');
        if (status) status.textContent = input.closest('label').textContent.trim();
      });
    });
    document.querySelectorAll('[data-pupit-join]').forEach((link) => {
      if (link.dataset.pupitReady) return;
      link.dataset.pupitReady = 'true';
      link.addEventListener('click', () => {
        const selected = link.closest('[data-pupit-product]')?.querySelector('[data-pupit-color]:checked');
        if (selected) syncPreference(selected.value);
      });
    });
    document.querySelectorAll('[data-pupit-reveal]').forEach((element) => {
      if (element.dataset.pupitObserved) return;
      element.dataset.pupitObserved = 'true';
      observer?.observe(element);
    });
    document.querySelectorAll('[data-pupit-success]').forEach((success) => {
      if (window.location.search.includes('customer_posted=true')) success.focus({ preventScroll: false });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  document.addEventListener('shopify:section:load', init);
})();
