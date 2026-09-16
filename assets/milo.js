(() => {
  const bind = (root = document) => {
    root.querySelectorAll('[data-product]').forEach((product) => {
      const select = product.querySelector('[data-variant]');
      if (!select || select.dataset.bound) return;
      select.dataset.bound = 'true';
      select.addEventListener('change', () => {
        const variant = select.selectedOptions[0];
        const button = product.querySelector('[data-add]');
        product.querySelector('[data-price]').textContent = variant.dataset.price;
        button.disabled = variant.dataset.available !== 'true';
        button.textContent = button.disabled ? 'Agotado' : 'Añadir al carrito';
      });
    });
  };
  bind();
  document.addEventListener('shopify:section:load', (event) => bind(event.target));
})();

(() => {
 const setGalleryPhoto = (gallery, photo, alt = '') => {
  if (!gallery || !photo) return;
  const main = gallery.querySelector('[data-gallery-main]');
  const error = gallery.querySelector('.image-error');
  if (!main) return;
  main.src = photo;
  main.alt = alt;
  if (error) error.hidden = true;
  main.style.visibility = 'visible';
  gallery.querySelectorAll('[data-photo]').forEach(button => {
   button.setAttribute('aria-pressed', String(button.dataset.photo === photo));
  });
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
   const main = gallery.querySelector('[data-gallery-main]');
   const error = gallery.querySelector('.image-error');
   const showError = () => { if (error) error.hidden = false; main.style.visibility = 'hidden'; };
   main.addEventListener('error', showError);
   main.addEventListener('load', () => { if (error) error.hidden = true; main.style.visibility = 'visible'; });
   if(main.complete && !main.naturalWidth) showError();
   gallery.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
    setGalleryPhoto(gallery, button.dataset.photo, button.dataset.alt || '');
    syncPicker(gallery.closest('section'), button.dataset.color);
   }));
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
