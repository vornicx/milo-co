(() => {
  const bind = (root = document) => {
    root.querySelectorAll('[data-product]').forEach((product) => {
      const select = product.querySelector('[data-variant]');
      if (!select || select.dataset.bound) return;
      select.dataset.bound = 'true';
      const form = product.querySelector('form');
      const quantity = product.querySelector('[name="quantity"]');
      const choices = document.createElement('fieldset');
      choices.className = 'variant-choices';
      const legend = document.createElement('legend');
      legend.textContent = product.querySelector('[data-variant-label]')?.textContent || 'Elige una opción';
      choices.append(legend);
      [...select.options].forEach(option => {
        const label = document.createElement('label');
        label.className = 'variant-choice';
        const input = document.createElement('input');
        input.type = 'radio'; input.name = 'variant-choice-' + select.id;
        input.value = option.value; input.checked = option.selected;
        const name = document.createElement('span');
        name.textContent = option.dataset.title || option.textContent;
        if (option.dataset.available !== 'true') {
          const stock = document.createElement('small'); stock.textContent = 'Agotado'; name.append(stock);
        }
        const color = (option.dataset.title || '').toLowerCase();
        const swatch = document.createElement('i'); swatch.setAttribute('aria-hidden','true');
        if (/rosa|pink/.test(color)) swatch.style.background = '#e7b7ce';
        else if (/azul|blue/.test(color)) swatch.style.background = '#b6dce0';
        else if (/verde|green/.test(color)) swatch.style.background = '#a8b9a0';
        else swatch.hidden = true;
        label.append(input,swatch,name); choices.append(label);
        input.addEventListener('change', () => { select.value = input.value; select.dispatchEvent(new Event('change',{bubbles:true})); });
      });
      if (select.options.length > 1 || select.options[0]?.dataset.title !== 'Default Title') {
        select.before(choices);
      }
      select.hidden = true;
      const nativeLabel = product.querySelector('[data-variant-label]');
      if(nativeLabel) nativeLabel.hidden = true;
      if (quantity) {
        const control = document.createElement('div'); control.className = 'quantity-control';
        quantity.before(control);
        const less = document.createElement('button'); less.type='button';less.textContent='−';less.setAttribute('aria-label','Reducir cantidad');
        const more = document.createElement('button'); more.type='button';more.textContent='+';more.setAttribute('aria-label','Aumentar cantidad');
        control.append(less,quantity,more);
        const syncQuantity = () => { less.disabled = Number(quantity.value) <= Number(quantity.min || 1); more.disabled = Boolean(quantity.max) && Number(quantity.value) >= Number(quantity.max); };
        less.addEventListener('click', () => { quantity.stepDown(); syncQuantity(); });
        more.addEventListener('click', () => { quantity.stepUp(); syncQuantity(); });
        quantity.addEventListener('input',syncQuantity);
        select.addEventListener('change', () => queueMicrotask(syncQuantity));
        syncQuantity();
      }
      form?.addEventListener('submit', () => {
        const button = product.querySelector('[data-add]');
        button.disabled = true; button.textContent = 'Añadiendo…'; form.setAttribute('aria-busy','true');
      });
      window.addEventListener('pageshow', () => {
        const button = product.querySelector('[data-add]');
        button.disabled = select.selectedOptions[0].dataset.available !== 'true';
        button.textContent = button.disabled ? 'Agotado' : 'Añadir al carrito';
        form?.removeAttribute('aria-busy');
      });
      select.addEventListener('change', () => {
        const variant = select.selectedOptions[0];
        const button = product.querySelector('[data-add]');
        product.querySelector('[data-price]').textContent = variant.dataset.price;
        choices.querySelectorAll('input').forEach(input => {input.checked = input.value === select.value;});
        document.querySelectorAll('[data-mobile-price]').forEach(price => {price.textContent = variant.dataset.price;});
        button.disabled = variant.dataset.available !== 'true';
        button.textContent = button.disabled ? 'Agotado' : 'Añadir al carrito';
        const hero = product.closest('[data-product-page]')?.querySelector('[data-variant-image]');
        const gallery = product.closest('[data-product-page]')?.querySelector('[data-gallery]');
        if (gallery && variant.dataset.image) {
          gallery.dispatchEvent(new CustomEvent('milo:photo', {detail:{photo:variant.dataset.image,alt:variant.dataset.imageAlt || ''}}));
        } else if (hero && variant.dataset.image) {
          hero.removeAttribute('srcset');
          hero.src = variant.dataset.image;
          hero.alt = variant.dataset.imageAlt || '';
        }
        const quantity = product.querySelector('[name="quantity"]');
        if (quantity) {
          quantity.min = variant.dataset.min || '1';
          quantity.step = variant.dataset.step || '1';
          if (variant.dataset.max) quantity.max = variant.dataset.max;
          else quantity.removeAttribute('max');
          quantity.value = quantity.min;
        }
      });
    });
  };
  bind();
  document.addEventListener('shopify:section:load', (event) => bind(event.target));
})();

// Shopify customer events are routed to configured web pixels, which apply
// Shopify's visitor consent settings. No email, IP or customer ID is published.
(() => {
 const publish = (name, data) => {
  if (window.Shopify?.analytics?.publish) window.Shopify.analytics.publish(`milo:${name}`, data);
 };
 const init = (root = document) => {
  root.querySelectorAll('[data-milo-product-landing]').forEach(node => {
   if (node.dataset.miloVisitBound) return;
   node.dataset.miloVisitBound = 'true';
   if (node.matches('[data-product-page]')) publish('product_landing_view', {path: window.location.pathname});
  });
  root.querySelectorAll('[data-milo-success]').forEach(node => {
   if (node.dataset.miloSuccessBound) return;
   node.dataset.miloSuccessBound = 'true';
   publish('waitlist_success', {placement: node.dataset.miloSource || 'unknown'});
  });
 };
 init();
 document.addEventListener('shopify:section:load', event => init(event.target));
 document.addEventListener('click', event => {
  const link = event.target.closest?.('a');
  if (!link) return;
  const guide = link.closest('.journal-article[data-milo-guide]');
  if (guide && link.closest('.journal-body') && /^\/(pages\/dispensador|products\/)/.test(link.pathname)) {
   publish('product_click', {placement:'guide_body', guide:guide.dataset.miloGuide, path:window.location.pathname});
  } else if (link.dataset.miloEvent) {
   publish(link.dataset.miloEvent, {placement:link.dataset.miloSource || 'unknown', guide:link.dataset.miloGuide || undefined, path:window.location.pathname});
  }
 });
 document.addEventListener('toggle', event => {
  if (event.target.matches?.('.faq details') && event.target.open) {
   publish('faq_open', {question:event.target.querySelector('summary')?.textContent?.trim()?.slice(0,100),path:window.location.pathname});
  }
 }, true);
})();

(() => {
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 const setGalleryPhoto = async (gallery, photo, alt = '') => {
  if (!gallery || !photo) return;
  const main = gallery.querySelector('[data-gallery-main]');
  if (!main) return;
  const request = Symbol();
  gallery.photoRequest = request;
  gallery.setAttribute('aria-busy', 'true');
  const status = gallery.querySelector('[data-gallery-status]');
  try {
   const next = new Image();
   next.src = photo;
   await next.decode();
   if (gallery.photoRequest !== request) return;
   main.removeAttribute('srcset');
   main.src = photo;
   main.alt = alt;
   main.style.visibility = 'visible';
   const error = gallery.querySelector('.image-error');
   if (error) error.hidden = true;
   const buttons = [...gallery.querySelectorAll('[data-photo]')];
   buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.photo === photo)));
   const index = buttons.findIndex(button => button.dataset.photo === photo);
   if (status) status.textContent = index < 0 ? 'Color seleccionado' : `${index + 1} / ${buttons.length}`;
   if (!reducedMotion.matches) main.animate([{opacity:.35, transform:'scale(1.015)'},{opacity:1, transform:'scale(1)'}], {duration:260, easing:'ease-out'});
  } catch {
   if (gallery.photoRequest === request && status) status.textContent = 'No se pudo cargar. Prueba otra foto.';
  } finally {
   if (gallery.photoRequest === request) gallery.setAttribute('aria-busy', 'false');
  }
 };

 const syncPicker = (section, color) => {
  const picker = section?.querySelector('[data-colors]');
  if (!picker || !color) return;
  const input = [...picker.querySelectorAll('input[type=radio]')].find(item => item.value === color);
  if (input) input.checked = true;
  const name = picker.querySelector('[data-color-name]');
  if (name) name.textContent = color;
 };

 const initialize = (root = document) => {
  root.querySelectorAll('[data-gallery]').forEach(gallery => {
   if (gallery.dataset.bound) return;
   gallery.dataset.bound = 'true';
   gallery.addEventListener('milo:photo', event => setGalleryPhoto(gallery,event.detail.photo,event.detail.alt));
   const main = gallery.querySelector('[data-gallery-main]');
   const error = gallery.querySelector('.image-error');
   const stage = gallery.querySelector('.gallery-stage');
   const controls = document.createElement('div');
   controls.className = 'gallery-controls';
   controls.innerHTML = '<button type="button" data-gallery-prev aria-label="Fotografía anterior">←</button><span data-gallery-status role="status" aria-live="polite" aria-atomic="true">1 / ' + gallery.querySelectorAll('[data-photo]').length + '</span><button type="button" data-gallery-next aria-label="Fotografía siguiente">→</button>';
   stage.append(controls);
   const initialButtons = [...gallery.querySelectorAll('[data-photo]')];
   controls.querySelector('[data-gallery-status]').textContent = `${Math.max(0, initialButtons.findIndex(button => button.getAttribute('aria-pressed') === 'true')) + 1} / ${initialButtons.length}`;
   const advance = step => {
    const buttons = [...gallery.querySelectorAll('[data-photo]')];
    const current = buttons.findIndex(button => button.getAttribute('aria-pressed') === 'true');
    buttons[(current + step + buttons.length) % buttons.length].click();
   };
   controls.querySelector('[data-gallery-prev]').addEventListener('click', () => advance(-1));
   controls.querySelector('[data-gallery-next]').addEventListener('click', () => advance(1));
   let start;
   stage.addEventListener('touchstart', event => { if(event.touches.length === 1) start = {x:event.touches[0].clientX,y:event.touches[0].clientY}; }, {passive:true});
   stage.addEventListener('touchend', event => {
    if (!start || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)*1.5) advance(dx < 0 ? 1 : -1);
    start = null;
   }, {passive:true});
   stage.addEventListener('touchcancel', () => {start = null;}, {passive:true});
   const showError = () => { if (error) error.hidden = false; main.style.visibility = 'hidden'; };
   main.addEventListener('error', showError);
   main.addEventListener('load', () => { if (error) error.hidden = true; main.style.visibility = 'visible'; });
   if(main.complete && main.currentSrc && !main.naturalWidth) showError();
   gallery.querySelectorAll('[data-photo]').forEach(button => {
    button.addEventListener('keydown', event => {
      const buttons = [...gallery.querySelectorAll('[data-photo]')];
      const index = buttons.indexOf(button);
      const step = {ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1}[event.key];
      if (!step && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length-1 : (index+step+buttons.length)%buttons.length;
      buttons[next].focus(); buttons[next].click();
    });
    button.addEventListener('click', () => {
    setGalleryPhoto(gallery, button.dataset.photo, button.dataset.alt || '');
    syncPicker(gallery.closest('section'), button.dataset.color);
   }); });
  });

  root.querySelectorAll('[data-colors]').forEach(picker => {
   if (picker.dataset.bound) return;
   picker.dataset.bound = 'true';
   picker.addEventListener('change', event => {
    if(!event.target.matches('input[type=radio]')) return;
    picker.querySelector('[data-color-name]').textContent = event.target.value;
    const gallery = picker.closest('section')?.querySelector('[data-gallery]');
    setGalleryPhoto(gallery, event.target.dataset.photo, event.target.dataset.alt || '');
   });
  });
 };
 initialize();
 document.addEventListener('shopify:section:load', event => initialize(event.target));
})();

(() => {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const path = currentPath.startsWith('/products/') ? '/pages/dispensador' : currentPath;
  document.querySelectorAll('.header nav a').forEach(link => {
    if (!link.hash && (new URL(link.href).pathname.replace(/\/$/, '') || '/') === path) link.setAttribute('aria-current', 'page');
  });
})();

// Progressive motion: content remains visible without JavaScript or observers.
(() => {
 const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
 if (preference.matches || !('IntersectionObserver' in window)) return;
 const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
   if (!entry.isIntersecting) return;
   observer.unobserve(entry.target);
   if (!preference.matches) entry.target.animate([{opacity:.4,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}], {duration:480,easing:'cubic-bezier(.2,.7,.2,1)'});
  });
 }, {threshold:.12});
 document.querySelectorAll('.home-product-grid,.home-brand-grid,.brand-principles,.brand-closing,.walk-v2-moments,.walk-v2-gallery,.product-story-intro,.product-details-head,.faq-heading').forEach(section => observer.observe(section));
 preference.addEventListener('change', event => { if(event.matches) {observer.disconnect(); document.getAnimations().forEach(animation => animation.cancel());} });
})();

// Public-copy guard: Shopify can briefly serve an older form snippet while a GitHub theme sync is settling.
(() => {
 const normalizePrelaunchCopy = (root = document) => {
  root.querySelectorAll('.prelaunch-success, .prelaunch-consent').forEach(node => {
   if (node.textContent.includes('Objeto 01')) node.innerHTML = node.innerHTML.replaceAll('Objeto 01','dispensador 3 en 1');
  });
  root.querySelectorAll('.prelaunch-form button[type="submit"]').forEach(button => {
   const text = button.textContent.trim();
   if (/^Avisadme/i.test(text)) {
    const arrow = button.querySelector('.arrow');
    button.textContent = 'Apuntarme ';
    if (arrow) button.append(arrow);
   }
  });
 };
 normalizePrelaunchCopy();
 document.addEventListener('shopify:section:load', event => normalizePrelaunchCopy(event.target));
})();
