(() => {
  'use strict';
  const find = selector => document.querySelector(selector);
  const node = (tag, text, className) => { const element = document.createElement(tag); if (text !== undefined) element.textContent = text; if (className) element.className = className; return element; };
  let secret = '', page = 1, busy = false, session = 0, idleTimer;
  const message = text => { find('#message').textContent = text; };
  function logout() {
    session++; secret = ''; page = 1; clearTimeout(idleTimer); find('#list').replaceChildren();
    find('#workspace').hidden = true; find('#login').hidden = false; find('#secret').value = ''; message(''); find('#secret').focus();
  }
  function touch() { if (secret) { clearTimeout(idleTimer); idleTimer = setTimeout(logout, 15 * 60 * 1000); } }
  document.addEventListener('pointerdown', touch); document.addEventListener('keydown', touch);
  async function request(action, data) {
    const url = new URL('/api/reviews', location.origin); url.searchParams.set('action', action);
    if (!data) { url.searchParams.set('status', find('#status').value); url.searchParams.set('page', page); }
    const response = await fetch(url, { method: data ? 'POST' : 'GET', credentials: 'omit', cache: 'no-store',
      headers: { Authorization: `Bearer ${secret}`, ...(data ? { 'Content-Type': 'application/json' } : {}) },
      body: data ? JSON.stringify(data) : undefined, signal: AbortSignal.timeout(30000) });
    const result = await response.json();
    if (!response.ok) { if (response.status === 401) logout(); throw new Error(result.error || 'No se ha podido completar la operación.'); }
    return result;
  }
  function render(review) {
    const card = node('article'), title = node('h2', review.title || 'Sin título');
    card.append(node('p', `${review.author} · ${new Date(review.date).toLocaleDateString('es-ES')}`, 'meta'), title,
      node('p', `${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} · ${review.product}`, 'rating'), node('p', review.body, 'body'), node('p', `Referencia: ${review.id}`, 'meta'));
    const gallery = node('div', undefined, 'gallery');
    for (const media of review.media) {
      if (!['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'].includes(media.type)) continue;
      let url; try { url = new URL(media.url); if (url.protocol !== 'https:') continue; } catch { continue; }
      const video = media.type.startsWith('video/'), element = node(video ? 'video' : 'img'); element.src = url.href;
      if (video) { element.controls = true; element.preload = 'metadata'; element.playsInline = true; }
      else { element.alt = `Foto enviada por ${review.author}`; element.loading = 'lazy'; }
      const wrapper = node('div'), error = node('p', 'No se puede abrir el archivo. Pulsa Actualizar para renovar el enlace.'); error.hidden = true;
      element.addEventListener('error', () => { error.hidden = false; }); wrapper.append(element, error); gallery.append(wrapper);
    }
    card.append(gallery);
    if (review.reason) card.append(node('p', `Motivo registrado: ${review.reason}`, 'meta'));
    const actions = node('fieldset'); actions.append(node('legend', 'Decisión sobre esta opinión'));
    const label = node('label', 'Motivo de retirada o rechazo'), reason = node('textarea'); reason.id = `reason-${review.id}`; reason.maxLength = 300; reason.minLength = 5; reason.rows = 2; label.htmlFor = reason.id;
    const buttons = node('div', undefined, 'actions');
    const save = async decision => {
      if (busy) return;
      if (decision === 'rejected' && reason.value.trim().length < 5) { reason.setCustomValidity('Escribe un motivo de al menos 5 caracteres.'); reason.reportValidity(); reason.focus(); return; }
      reason.setCustomValidity(''); busy = true; actions.disabled = true; message('Guardando la decisión…'); const current = session;
      try { await request('admin-moderate', { id: review.id, decision, reason: reason.value.trim() }); if (current === session) { busy = false; await load(); message('Decisión guardada.'); } }
      catch (error) { if (current === session) message(error.message); }
      finally { busy = false; actions.disabled = false; }
    };
    reason.addEventListener('input', () => reason.setCustomValidity(''));
    if (review.status !== 'approved') { const approve = node('button', 'Publicar opinión'); approve.type = 'button'; approve.addEventListener('click', () => save('approved')); buttons.append(approve); }
    if (review.status !== 'rejected') { const reject = node('button', review.status === 'approved' ? 'Retirar opinión' : 'Rechazar opinión', 'secondary'); reject.type = 'button'; reject.addEventListener('click', () => save('rejected')); buttons.append(reject); }
    actions.append(label, reason, buttons); card.append(actions); return card;
  }
  async function load() {
    if (busy || !secret) return;
    busy = true; message('Cargando opiniones…'); const current = session;
    find('#status').disabled = true; find('#refresh').disabled = true;
    try {
      const result = await request('admin-list'); if (current !== session) return;
      find('#list').replaceChildren(...result.reviews.map(render));
      find('#workspace').hidden = false; find('#login').hidden = true; touch();
      find('#page').textContent = `Página ${page} · ${result.total} opiniones`;
      find('#previous').disabled = page === 1; find('#next').disabled = !result.hasMore;
      message(result.total ? '' : 'No hay opiniones en este estado.');
    } catch (error) { if (current === session || !secret) message(error.message); }
    finally { busy = false; find('#status').disabled = false; find('#refresh').disabled = false; }
  }
  find('#login-form').addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return;
    secret = find('#secret').value; find('#secret').value = ''; session++; await load();
  });
  find('#logout').addEventListener('click', logout);
  find('#refresh').addEventListener('click', () => load());
  find('#status').addEventListener('change', () => { page = 1; load(); });
  find('#previous').addEventListener('click', () => { if (!busy && page > 1) { page--; load(); } });
  find('#next').addEventListener('click', () => { if (!busy) { page++; load(); } });
})();
