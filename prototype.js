const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const sidebarRoutes = {
  Home: "simulate.html",
  Simulate: "simulate.html",
  Scenarios: "scenarios.html",
  Analytics: "analytics.html",
  Team: "team.html",
  Library: "library.html",
  Risks: "risks.html",
  Settings: "settings.html"
};

$$('.proto-sidebar nav a').forEach((link) => {
  const route = sidebarRoutes[link.textContent.trim()];
  if (route) link.href = route;
});

function showToast(title, message) {
  const toast = $("#protoToast");
  if (!toast) return;
  $("#protoToastTitle").textContent = title;
  $("#protoToastMessage").textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3500);
}

$$('[data-toast]').forEach((button) => button.addEventListener("click", () => {
  showToast(button.dataset.toast, button.dataset.message || "Your changes have been recorded in this prototype.");
}));

$$('[data-route]').forEach((button) => button.addEventListener("click", () => {
  window.location.href = button.dataset.route;
}));

$$('.setup-nav button').forEach((button) => button.addEventListener("click", () => {
  $$('.setup-nav button').forEach((item) => item.classList.toggle("active", item === button));
  showToast(button.textContent.trim(), "This setup section is ready for configuration.");
}));

$$('.choice').forEach((choice) => choice.addEventListener("click", () => {
  $$('.choice').forEach((item) => item.classList.toggle("selected", item === choice));
  choice.closest('[data-choice-group]')?.setAttribute('data-selected', choice.dataset.choice);
}));

$$('[data-submit-choice]').forEach((button) => button.addEventListener("click", () => {
  const group = $('[data-choice-group]');
  const selected = group?.dataset.selected || $('.choice.selected')?.dataset.choice || "Selected response";
  showToast("Decision submitted", `${selected} was recorded in the decision log.`);
}));

$$('.tabs button').forEach((button) => button.addEventListener("click", () => {
  $$('.tabs button').forEach((item) => item.classList.toggle("active", item === button));
  if (button.dataset.tabMessage) showToast(button.textContent.trim(), button.dataset.tabMessage);
}));

const guidance = $('#guidanceText');
$('#guidanceButton')?.addEventListener('click', () => {
  guidance.hidden = !guidance.hidden;
});

const commentInput = $('#commentInput');
$('#sendComment')?.addEventListener('click', () => {
  const value = commentInput.value.trim();
  if (!value) return commentInput.focus();
  const thread = $('#discussionThread');
  const message = document.createElement('div');
  message.className = 'message';
  message.innerHTML = `<span>YOU</span><p>${value}<small>Just now</small></p>`;
  thread.appendChild(message);
  commentInput.value = '';
  showToast('Comment added', 'Your note is now visible to the exercise team.');
});

const alertModal = $('#alertModal');
function closeAlert() { if (alertModal) alertModal.hidden = true; }
$('#alertClose')?.addEventListener('click', closeAlert);
$('#viewAlertDetails')?.addEventListener('click', () => {
  $('#alertExtra').hidden = false;
  $('#viewAlertDetails').textContent = 'Details shown';
});
$('#acknowledgeAlert')?.addEventListener('click', () => { window.location.href = 'screen-4.html'; });

$('#protoToastClose')?.addEventListener('click', () => $('#protoToast').classList.remove('show'));
