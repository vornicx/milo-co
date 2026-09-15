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
