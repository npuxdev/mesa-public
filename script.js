const state = {
  seconds: (2 * 60 * 60) + (14 * 60) + 32,
  paused: false,
  activeFilter: "all",
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${remainder}`;
}

setInterval(() => {
  if (!state.paused) {
    state.seconds += 1;
    $("#simulationTime").textContent = formatTime(state.seconds);
  }
}, 1000);

function showToast(title, message) {
  $("#toastTitle").textContent = title;
  $("#toastMessage").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => $("#toast").classList.remove("show"), 3800);
}

function setPaused(paused) {
  state.paused = paused;
  $("#livePill").classList.toggle("paused", paused);
  $("#livePillText").textContent = paused ? "Simulation Paused" : "Live Simulation";
  $("#livePill span").textContent = paused ? "Ⅱ" : "✓";
  $("#statusText").textContent = paused ? "Paused" : "On Track";
  $("#statusSubtext").textContent = paused ? "Scenario progression on hold" : "Responding to Inject 3";
  $("#pauseMenuItem").innerHTML = paused
    ? '<svg><use href="#play"></use></svg><span>Resume simulation</span>'
    : '<svg><use href="#pause"></use></svg><span>Pause simulation</span>';
  showToast(paused ? "Simulation paused" : "Simulation resumed", paused ? "The exercise clock and scenario progression are on hold." : "The live exercise clock is running again.");
}

$("#livePill").addEventListener("click", () => setPaused(!state.paused));
$("#pauseMenuItem").addEventListener("click", () => setPaused(!state.paused));

const menu = $("#sessionMenu");
$("#sessionMenuButton").addEventListener("click", (event) => {
  event.stopPropagation();
  menu.hidden = !menu.hidden;
  event.currentTarget.setAttribute("aria-expanded", String(!menu.hidden));
});
menu.addEventListener("click", (event) => event.stopPropagation());
document.addEventListener("click", () => {
  menu.hidden = true;
  $("#sessionMenuButton").setAttribute("aria-expanded", "false");
});

$$('[data-menu-action]').forEach((button) => button.addEventListener("click", () => {
  showToast(button.dataset.menuAction, "This session action is available in the interactive prototype.");
  menu.hidden = true;
}));

function applyFeedFilter(filter) {
  state.activeFilter = filter;
  $$('.feed-filters [data-filter]').forEach((button) => button.classList.toggle("active", button.dataset.filter === filter));
  let visible = 0;
  $$('#activityList article').forEach((item) => {
    const show = filter === "all" || item.dataset.feedType === filter;
    item.hidden = !show;
    if (show) visible += 1;
  });
  $('.inject-alert').hidden = !(filter === "all" || filter === "inject");
  $('#emptyFilter').hidden = visible > 0 || filter === "inject";
}

$$('.feed-filters [data-filter]').forEach((button) => button.addEventListener("click", () => applyFeedFilter(button.dataset.filter)));

const detailsBackdrop = $("#detailsBackdrop");
let lastFocused = null;

function openDrawer() {
  lastFocused = document.activeElement;
  detailsBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
  $("#drawerClose").focus();
}

function closeDrawer() {
  detailsBackdrop.hidden = true;
  document.body.style.overflow = "";
  lastFocused?.focus();
}

$("#injectDetailsButton").addEventListener("click", openDrawer);
$("#drawerClose").addEventListener("click", closeDrawer);
detailsBackdrop.addEventListener("click", (event) => { if (event.target === detailsBackdrop) closeDrawer(); });
$("#acknowledgeInject").addEventListener("click", () => {
  closeDrawer();
  showToast("Inject acknowledged", "The acknowledgement was recorded in recent activity.");
});

$("#viewImpact").addEventListener("click", () => showToast("Impact details", "All affected systems and modeled consequences are now available for review."));
$$('.impact-item').forEach((item) => item.addEventListener("click", () => showToast(item.querySelector('strong').textContent, item.dataset.impact)));
const navRoutes = {
  Simulate: "simulate.html",
  Simulator: "simulate.html",
  Scenarios: "scenarios.html",
  Analytics: "analytics.html",
  Team: "team.html",
  Library: "library.html",
  Risks: "risks.html",
  Settings: "settings.html"
};

$$('[data-nav]').forEach((item) => item.addEventListener("click", () => {
  const route = navRoutes[item.dataset.nav];
  if (route) window.location.href = route;
}));
$("#toastClose").addEventListener("click", () => $("#toast").classList.remove("show"));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!detailsBackdrop.hidden) closeDrawer();
    menu.hidden = true;
    $("#sessionMenuButton").setAttribute("aria-expanded", "false");
  }
});
