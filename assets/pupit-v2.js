(() => {
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
      menu.querySelector('[data-pupit-menu-close]').addEventListener('click', close);
      menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
      menu.addEventListener('click', (event) => {
        if (event.target === menu) {
          const bounds = menu.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
        }
      });
      menu.addEventListener('close', () => {
        opener.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('pupit-menu-is-open');
      });
      const wide = window.matchMedia('(min-width: 750px)');
      wide.addEventListener('change', () => { if (wide.matches && menu.open) close(); });
    });
    document.querySelectorAll('[data-pupit-color]').forEach((input) => {
      if (input.dataset.pupitReady) return;
      input.dataset.pupitReady = 'true';
      input.addEventListener('change', () => {
        document.querySelectorAll('[data-pupit-preference]').forEach((preference) => {
          preference.checked = preference.dataset.pupitPreference === input.value;
        });
      });
    });
    document.querySelectorAll('[data-pupit-join]').forEach((link) => {
      if (link.dataset.pupitReady) return;
      link.dataset.pupitReady = 'true';
      link.addEventListener('click', () => {
        const selected = link.closest('[data-pupit-product]')?.querySelector('[data-pupit-color]:checked');
        if (selected) document.querySelectorAll('[data-pupit-preference]').forEach((radio) => {
          radio.checked = radio.dataset.pupitPreference === selected.value;
        });
      });
    });
    document.querySelectorAll('[data-pupit-success]').forEach((success) => {
      if (window.location.search.includes('customer_posted=true')) success.focus({ preventScroll: false });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  document.addEventListener('shopify:section:load', init);
})();
