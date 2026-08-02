import { $, $$ } from "../core/constants.js";
import { escapeHtml, toast, formatAddress, createId, formToObject, objectToForm } from "../core/utils.js";
import { emptyTableRow, focusForm, removeRecord } from "./shared.js";
import { showView } from "./nav.js";
import { accountingRepository } from "../core/repository.js";

export async function saveAccounting(event, refresh) {
  event.preventDefault();
  const form = event.currentTarget;
  const office = formToObject(form);
  office.id = office.id || createId("accounting", office.company_name);
  const savedToFile = await accountingRepository.save(office);
  form.reset();
  refresh();
  toast(savedToFile ? "Knjigovodstveni ured je spremljen u JSON datoteku." : "Knjigovodstveni ured je spremljen u ovu sesiju.");
}

export function editAccounting(id) {
  const office = accountingRepository.findById(id);
  if (!office) return;
  objectToForm($("#accountingForm"), office);
  showView("accounting");
}

export function renderAccounting(refresh) {
  const query = $("#accountingSearch").value.trim().toLowerCase();
  const filtered = accountingRepository.list()
    .filter((office) => [office.company_name, office.city, office.vat, office.email].join(" ").toLowerCase().includes(query));
  const rows = filtered.map((office) => `
      <tr>
        <td><strong>${escapeHtml(office.company_name)}</strong><br><small>${escapeHtml(formatAddress(office))}</small></td>
        <td>${escapeHtml(office.city)}</td>
        <td>${escapeHtml(office.vat)}</td>
        <td>
          <div class="row-actions">
            <button class="ghost-button" data-edit-accounting="${escapeHtml(office.id)}" type="button">Uredi</button>
            <button class="danger-button" data-delete-accounting="${escapeHtml(office.id)}" type="button">Izbriši</button>
          </div>
        </td>
      </tr>
    `).join("");
  $("#accountingRows").innerHTML = rows || emptyTableRow(4, {
    hasAny: accountingRepository.list().length > 0,
    query,
    ctaId: "accountingEmptyCta",
    ctaLabel: "Dodaj prvi knjigovodstveni ured →",
    emptyLabel: "Još nema unesenih knjigovodstvenih ureda."
  });
  $("#accountingEmptyCta")?.addEventListener("click", () => focusForm("accountingForm", "company_name"));
  $$("[data-edit-accounting]").forEach((button) => button.addEventListener("click", () => editAccounting(button.dataset.editAccounting)));
  $$("[data-delete-accounting]").forEach((button) => button.addEventListener("click", () => removeRecord(accountingRepository, button.dataset.deleteAccounting, refresh)));
}

export function bindAccounting(refresh) {
  $("#accountingForm").addEventListener("submit", (event) => saveAccounting(event, refresh));
  $("#accountingSearch").addEventListener("input", () => renderAccounting(refresh));
}
