(function () {
  const KEY = 'ohHappyTripContent';

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (error) {
      console.error('No se pudo leer el contenido personalizado.', error);
      return {};
    }
  }

  function write(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function selectorFor(element) {
    const parts = [];
    let current = element;
    while (current && current.parentElement && current.tagName.toLowerCase() !== 'main') {
      const siblings = Array.from(current.parentElement.children);
      parts.unshift(`${current.tagName.toLowerCase()}:nth-child(${siblings.indexOf(current) + 1})`);
      current = current.parentElement;
    }
    if (current && current.tagName.toLowerCase() === 'main') parts.unshift('main');
    return parts.join(' > ');
  }

  function collect(documentToScan) {
    const result = [];
    const root = documentToScan.querySelector('main');
    if (!root) return result;
    root.querySelectorAll('img, h1, h2, h3, h4, p, span, strong, small, li').forEach(element => {
      if (element.closest('script, nav, footer, form, button, .fuegos-artificiales')) return;
      const selector = selectorFor(element);
      if (!selector) return;
      if (element.tagName.toLowerCase() === 'img') {
        result.push({ type: 'image', selector, value: element.getAttribute('src') || '', alt: element.getAttribute('alt') || '' });
      } else if (element.children.length === 0 && element.textContent.trim().length > 1) {
        result.push({ type: 'text', selector, value: element.textContent.trim() });
      }
    });
    return result;
  }

  function apply(page) {
    const overrides = read()[page] || {};
    Object.keys(overrides).forEach(key => {
      const item = overrides[key];
      const element = document.querySelector(item.selector);
      if (!element) return;
      if (item.type === 'image') {
        element.src = item.value;
        if (item.alt !== undefined) element.alt = item.alt;
      } else {
        element.textContent = item.value;
      }
    });
  }

  window.OhHappyTripContent = {
    read,
    write,
    collect,
    apply,
    selectorFor
  };

  const page = window.location.pathname.split(/[\\/]/).pop();
  if (page && page !== 'admin.html' && page !== 'auth.html' && page !== 'cuenta.html' && page !== 'cotizar.html') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => apply(page));
    } else {
      apply(page);
    }
  }
})();
