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
 const initialize = (root = document) => {
  root.querySelectorAll('[data-gallery]').forEach(gallery => {
   if (gallery.dataset.bound) return;
   gallery.dataset.bound = 'true';
   const main = gallery.querySelector('[data-gallery-main]');
   const error = gallery.querySelector('.image-error');
   const showError = () => { error.hidden = false; main.style.visibility = 'hidden'; };
   main.addEventListener('error', showError);
   main.addEventListener('load', () => { error.hidden = true; main.style.visibility = 'visible'; });
   if(main.complete && !main.naturalWidth) showError();
   gallery.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
    main.src = button.dataset.photo;
    gallery.querySelectorAll('[data-photo]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
   }));
  });
  root.querySelectorAll('[data-colors]').forEach(picker => {
   if (picker.dataset.bound) return;
   picker.dataset.bound = 'true';
   picker.addEventListener('change', event => {
    if(event.target.matches('input[type=radio]')) picker.querySelector('[data-color-name]').textContent = event.target.value;
   });
  });
 };
 initialize();
 document.addEventListener('shopify:section:load', event => initialize(event.target));
})();
