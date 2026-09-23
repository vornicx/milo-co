(() => {
  const normalizePrelaunchCopy = (root = document) => {
    root.querySelectorAll('.prelaunch-success, .prelaunch-consent').forEach((node) => {
      if (node.textContent.includes('Objeto 01')) {
        node.innerHTML = node.innerHTML.replaceAll('Objeto 01', 'dispensador 3 en 1');
      }
    });
    root.querySelectorAll('.prelaunch-form button[type="submit"]').forEach((button) => {
      if (!/^Avisadme/i.test(button.textContent.trim())) return;
      const arrow = button.querySelector('.arrow');
      button.textContent = 'Apuntarme ';
      if (arrow) button.append(arrow);
    });
  };

  normalizePrelaunchCopy();
  document.addEventListener('shopify:section:load', (event) => normalizePrelaunchCopy(event.target));
})();
