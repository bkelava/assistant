import { $, $$ } from "../core/constants.js";
import { escapeHtml, toast, formatAddress, createId, formToObject, objectToForm } from "../core/utils.js";
import { emptyTableRow, focusForm, removeRecord } from "./shared.js";
import { showView } from "./nav.js";
import { employerRepository } from "../core/repository.js";

export async function saveEmployer(event, refresh) {
  event.preventDefault();
  const form = event.currentTarget;
  const employer = formToObject(form);
  employer.id = employer.id || createId("employer", employer.company_name);
  await employerRepository.save(employer);
  form.reset();
  refresh();
  toast("Poslodavac je spremljen.");
}

export function editEmployer(id) {
  const employer = employerRepository.findById(id);
  if (!employer) return;
  objectToForm($("#employerForm"), employer);
  showView("employers");
}

export function renderEmployers(refresh) {
  const query = $("#employerSearch").value.trim().toLowerCase();
  const filtered = employerRepository.list()
    .filter((employer) => [employer.company_name, employer.city, employer.vat].join(" ").toLowerCase().includes(query));
  const rows = filtered.map((employer) => `
      <tr>
        <td><strong>${escapeHtml(employer.company_name)}</strong><br><small>${escapeHtml(formatAddress(employer))}</small></td>
        <td>${escapeHtml(employer.city)}</td>
        <td>${escapeHtml(employer.vat)}</td>
        <td>
          <div class="row-actions">
            <button class="ghost-button" data-edit-employer="${escapeHtml(employer.id)}" type="button">Uredi</button>
            <button class="danger-button" data-delete-employer="${escapeHtml(employer.id)}" type="button">Izbriši</button>
          </div>
        </td>
      </tr>
    `).join("");
  $("#employerRows").innerHTML = rows || emptyTableRow(4, {
    hasAny: employerRepository.list().length > 0,
    query,
    ctaId: "employerEmptyCta",
    ctaLabel: "Dodaj prvog poslodavca →",
    emptyLabel: "Još nema unesenih poslodavaca."
  });
  $("#employerEmptyCta")?.addEventListener("click", () => focusForm("employerForm", "company_name"));
  $$("[data-edit-employer]").forEach((button) => button.addEventListener("click", () => editEmployer(button.dataset.editEmployer)));
  $$("[data-delete-employer]").forEach((button) => button.addEventListener("click", () => removeRecord(employerRepository, button.dataset.deleteEmployer, refresh)));
}

export function bindEmployers(refresh) {
  $("#employerForm").addEventListener("submit", (event) => saveEmployer(event, refresh));
  $("#employerSearch").addEventListener("input", () => renderEmployers(refresh));
}
