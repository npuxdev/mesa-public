const $p = (selector, scope = document) => scope.querySelector(selector);
const $$p = (selector, scope = document) => [...scope.querySelectorAll(selector)];

$$p('.proto-sidebar nav a').forEach(link => {
  if (link.textContent.trim() === 'Home') link.href = 'simulate.html';
});

function portalToast(title, message) {
  const toast = $p('#portalToast');
  if (!toast) return;
  $p('#portalToastTitle').textContent = title;
  const messageNode = $p('#portalToastMessage') || $p('#portalToastDetail');
  if (messageNode) messageNode.textContent = message;
  toast.classList.add('show');
  clearTimeout(portalToast.timer);
  portalToast.timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

$$p('[data-toast]').forEach(button => button.addEventListener('click', () => portalToast(button.dataset.toast, button.dataset.message || button.dataset.toastDetail || 'This prototype action has been recorded.')));
$$p('[data-route]').forEach(button => button.addEventListener('click', () => { window.location.href = button.dataset.route; }));
$p('#portalToastClose')?.addEventListener('click', () => $p('#portalToast').classList.remove('show'));

$$p('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const group = button.closest('[data-filter-group]');
  $$p('[data-filter]', group).forEach(item => item.classList.toggle('active', item === button));
  const value = button.dataset.filter;
  $$p('[data-filter-item]').forEach(item => { item.hidden = value !== 'all' && item.dataset.filterItem !== value; });
}));

const catalogSearch = $p('#catalogSearch');
catalogSearch?.addEventListener('input', () => {
  const query = catalogSearch.value.trim().toLowerCase();
  const items = $$p('.catalog-card, [data-filter-item]');
  items.forEach(card => { card.hidden = Boolean(query && !card.textContent.toLowerCase().includes(query)); });
});

const teamSearch = $p('#teamSearch');
teamSearch?.addEventListener('input', () => {
  const query = teamSearch.value.trim().toLowerCase();
  $$p('.person-row').forEach(row => { row.hidden = query && !row.textContent.toLowerCase().includes(query); });
});

$$p('.library-tabs button').forEach(button => button.addEventListener('click', () => {
  $$p('.library-tabs button').forEach(item => item.classList.toggle('active', item === button));
  const type = button.dataset.library;
  $$p('.document-row').forEach(row => { row.hidden = type !== 'all' && row.dataset.library !== type; });
}));

$$p('.toggle').forEach(toggle => toggle.addEventListener('click', () => {
  const on = toggle.classList.toggle('on');
  toggle.setAttribute('aria-pressed', String(on));
  toggle.setAttribute('aria-checked', String(on));
  portalToast('Preference updated', `${toggle.dataset.label || 'Setting'} is now ${on ? 'enabled' : 'disabled'}.`);
}));

$$p('.settings-nav button').forEach(button => button.addEventListener('click', () => {
  $$p('.settings-nav button').forEach(item => item.classList.toggle('active', item === button));
  portalToast(button.textContent.trim(), 'This settings category is available in the beta administration workspace.');
}));

$$p('.status-select').forEach(select => select.addEventListener('change', () => portalToast('Action status updated', `Status changed to ${select.value}. Verification remains separately tracked.`)));
