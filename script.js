const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

function activate(name, updateHash = true) {
  const fyMonth = ["apr", "may", "jun", "jul"].includes(name);
  tabs.forEach((tab) => {
    const active = tab.dataset.tab === name || (fyMonth && tab.dataset.tab === "fy");
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  panels.forEach((panel) => {
    const active = panel.dataset.panel === name;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  if (updateHash) history.replaceState(null, "", `#${name}`);
  window.scrollTo({ top: document.querySelector(".tabs").offsetTop - 70, behavior: "smooth" });
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activate(tab.dataset.tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : index + (event.key === "ArrowRight" ? 1 : -1);
    next = (next + tabs.length) % tabs.length;
    tabs[next].focus();
    activate(tabs[next].dataset.tab);
  });
});

const requested = location.hash.slice(1);
if (["yoy", "fy2425", "fy2526", "fy", "apr", "may", "jun", "jul", "b2b", "pipeline"].includes(requested)) activate(requested, false);
