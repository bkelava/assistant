import { $, $$ } from "../core/constants.js";
import { escapeHtml, toast, formatDate, normalizeTime24, syncDatePickerFromDisplay } from "../core/utils.js";

// --- Form helpers ---

export function clearFieldInvalid(event) {
  event.target.classList?.remove("field-invalid");
}

export async function withBusyButton(button, fn) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Priprema dokumenta...";
  try {
    await fn();
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

export function validateForm(form) {
  form.querySelectorAll(".field-invalid").forEach((el) => el.classList.remove("field-invalid"));
  const invalid = Array.from(form.querySelectorAll("[required]")).filter((el) => el.offsetParent !== null && !el.checkValidity());
  if (!invalid.length) return true;
  invalid.forEach((el) => el.classList.add("field-invalid"));
  invalid[0].scrollIntoView({ behavior: "smooth", block: "center" });
  invalid[0].focus();
  const fieldsPhrase = invalid.length === 1 ? "1 obavezno polje označeno" : `${invalid.length} obavezna polja označena`;
  toast(`Molimo popunite ${fieldsPhrase} crvenom bojom.`);
  return false;
}

// --- Form bindings ---

// --- Table / navigation helpers ---

export function emptyTableRow(colspan, { hasAny, query, ctaId, ctaLabel, emptyLabel }) {
  if (hasAny) {
    return `<tr><td colspan="${colspan}"><div class="table-empty-state"><p>Nema rezultata za „${escapeHtml(query)}”.</p></div></td></tr>`;
  }
  return `<tr><td colspan="${colspan}"><div class="table-empty-state"><p>${emptyLabel}</p><button class="ghost-button" type="button" id="${ctaId}">${ctaLabel}</button></div></td></tr>`;
}

export function focusForm(formId, fieldName) {
  const form = $(`#${formId}`);
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  form.elements[fieldName]?.focus();
}

// Generic delete-with-confirm for a Repository-backed entity list. `refresh` is the
// caller's full app re-render (counts, selects, drafts etc. all depend on the deleted entity).
export async function removeRecord(repository, id, refresh) {
  if (!confirm("Izbrisati zapis?")) return;
  const savedToFile = await repository.remove(id);
  refresh();
  toast(savedToFile ? "Zapis je izbrisan iz JSON datoteke." : "Zapis je izbrisan iz ove sesije.");
}

// --- Date / time pickers ---

export function enhanceCroatianDatePickers() {
  $$(".date-hr-input").forEach((displayInput) => {
    if (displayInput.dataset.enhanced === "true") return;
    displayInput.dataset.enhanced = "true";
    displayInput.readOnly = true;
    displayInput.classList.add("date-picker-display");

    const picker = document.createElement("input");
    picker.type = "date";
    picker.className = "native-date-picker";
    picker.tabIndex = -1;
    picker.setAttribute("aria-hidden", "true");
    displayInput.insertAdjacentElement("afterend", picker);

    const openPicker = () => {
      syncDatePickerFromDisplay(displayInput);
      if (typeof picker.showPicker === "function") picker.showPicker();
      else picker.click();
    };

    displayInput.addEventListener("click", openPicker);
    displayInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPicker(); }
    });
    picker.addEventListener("change", () => {
      if (picker.value) displayInput.value = formatDate(picker.value);
    });
  });
}

export function enhanceCroatianTimePickers() {
  $$(".time-hr-input").forEach((displayInput) => {
    if (displayInput.dataset.enhanced === "true") return;
    displayInput.dataset.enhanced = "true";
    displayInput.readOnly = true;
    displayInput.classList.add("time-picker-display");

    const picker = document.createElement("input");
    picker.type = "time";
    picker.className = "native-time-picker";
    picker.step = "60";
    picker.tabIndex = -1;
    picker.setAttribute("aria-hidden", "true");
    displayInput.insertAdjacentElement("afterend", picker);

    const openPicker = () => {
      picker.value = normalizeTime24(displayInput.value);
      if (typeof picker.showPicker === "function") picker.showPicker();
      else picker.click();
    };

    displayInput.addEventListener("click", openPicker);
    displayInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPicker(); }
    });
    picker.addEventListener("change", () => {
      if (picker.value) displayInput.value = normalizeTime24(picker.value);
    });
  });
}

// --- Contract control hydration ---
