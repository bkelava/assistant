import { $, $$, state, views } from "../core/constants.js";
// Intentional circular import: ui-documents.js needs showView() (e.g. the
// "back to picker" button, loadDraft), and this module needs showDocumentPicker()
// for the nav-item re-click special case. Both are only referenced inside
// function bodies (never at module-eval time), so the ESM circular import is safe.
import { showDocumentPicker } from "./documents.js";

export function bindNavigation() {
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.view === "documents" && state.currentView === "documents") {
        showDocumentPicker();
      } else {
        showView(button.dataset.view);
      }
    });
  });
}

export function showView(name) {
  state.currentView = name;
  $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  $$(".view").forEach((view) => view.classList.remove("active"));
  $(`#${name}View`).classList.add("active");
  $("#viewTitle").textContent = views[name][0];
  $("#viewSubtitle").textContent = views[name][1];
  if (name === "documents") showDocumentPicker();
}
