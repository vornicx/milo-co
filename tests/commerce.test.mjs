import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const code = readFileSync('assets/milo.js', 'utf8');
function fixture() {
 const handlers = {};
 const element = () => ({
  children: [], style: {}, dataset: {},
  append(...children) { this.children.push(...children); },
  before() {}, setAttribute() {}, addEventListener() {},
  querySelectorAll() { return this.children.flatMap(child => [child, ...(child.children || [])]).filter(child => child.type === 'radio'); },
 });
 const variant = { dataset: { price: '24,90 €', available: 'true', min: '2', step: '2', max: '8' } };
 const select = { ...element(), options: [variant], selectedOptions: [variant], addEventListener: (name, fn) => {
  const previous = handlers[name];
  handlers[name] = (...args) => { previous?.(...args); fn(...args); };
 } };
 const price = {}, button = {}, quantity = { ...element(), removeAttribute(name) { delete this[name]; } };
 const product = { querySelector: selector => ({ '[data-variant]': select, '[data-price]': price, '[data-add]': button, '[name="quantity"]': quantity }[selector]), closest: () => null };
 const document = { createElement: element, querySelectorAll: selector => selector === '[data-product]' ? [product] : [], addEventListener() {} };
 vm.runInNewContext(code, { document, window: { location: { pathname: '/' }, addEventListener() {}, matchMedia: () => ({ matches: true }) }, URL, queueMicrotask });
 return { variant, handlers, price, button, quantity };
}
test('Variant changes update price and enforce quantity rules', () => {
 const f = fixture(); f.handlers.change();
 assert.equal(f.price.textContent, '24,90 €'); assert.equal(f.button.disabled, false);
 assert.equal(f.quantity.min, '2'); assert.equal(f.quantity.step, '2'); assert.equal(f.quantity.max, '8'); assert.equal(f.quantity.value, '2');
});
test('Sold-out variant cannot be submitted and stale maximum is removed', () => {
 const f = fixture(); f.handlers.change(); f.variant.dataset = { price: '19,90 €', available: 'false' }; f.handlers.change();
 assert.equal(f.button.disabled, true); assert.equal(f.button.textContent, 'Agotado');
 assert.equal(f.quantity.max, undefined); assert.equal(f.quantity.min, '1');
});
test('Variant labels are inserted as text, never interpreted as markup', () => {
 const f = fixture(); f.variant.dataset.price = '<img src=x onerror=alert(1)>'; f.handlers.change();
 assert.equal(f.price.textContent, '<img src=x onerror=alert(1)>'); assert.equal(f.price.innerHTML, undefined);
});
