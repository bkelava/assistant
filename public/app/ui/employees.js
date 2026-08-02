import { $, $$ } from "../core/constants.js";
import { escapeHtml, toast, formatAddress, createId, formToObject, objectToForm } from "../core/utils.js";
import { emptyTableRow, focusForm, removeRecord } from "./shared.js";
import { showView } from "./nav.js";
import { employeeRepository } from "../core/repository.js";

export async function saveEmployee(event, refresh) {
  event.preventDefault();
  const form = event.currentTarget;
  const employee = formToObject(form);
  employee.employer_names = Array.from(form.elements.employer_names.selectedOptions).map((option) => option.value);
  employee.id = employee.id || createId("employee", `${employee.name}-${employee.lastname}-${employee.personal_id}`);
  const savedToFile = await employeeRepository.save(employee);
  form.reset();
  refresh();
  toast(savedToFile ? "Radnik je spremljen u JSON datoteku." : "Radnik je spremljen u ovu sesiju.");
}

export function editEmployee(id) {
  const employee = employeeRepository.findById(id);
  if (!employee) return;
  objectToForm($("#employeeForm"), employee);
  Array.from($("#employeeEmployers").options).forEach((option) => {
    option.selected = employee.employer_names.includes(option.value);
  });
  showView("employees");
}

export function renderEmployees(refresh) {
  const query = $("#employeeSearch").value.trim().toLowerCase();
  const filtered = employeeRepository.list()
    .filter((employee) => [employee.name, employee.lastname, employee.personal_id, employee.employer_names.join(" ")].join(" ").toLowerCase().includes(query));
  const rows = filtered.map((employee) => `
      <tr>
        <td><strong>${escapeHtml(employee.name)} ${escapeHtml(employee.lastname)}</strong><br><small>${escapeHtml(formatAddress(employee))}</small></td>
        <td>${escapeHtml(employee.personal_id)}</td>
        <td>${escapeHtml(employee.employer_names.join(", "))}</td>
        <td>
          <div class="row-actions">
            <button class="ghost-button" data-edit-employee="${escapeHtml(employee.id)}" type="button">Uredi</button>
            <button class="danger-button" data-delete-employee="${escapeHtml(employee.id)}" type="button">Izbriši</button>
          </div>
        </td>
      </tr>
    `).join("");
  $("#employeeRows").innerHTML = rows || emptyTableRow(4, {
    hasAny: employeeRepository.list().length > 0,
    query,
    ctaId: "employeeEmptyCta",
    ctaLabel: "Dodaj prvog radnika →",
    emptyLabel: "Još nema unesenih radnika."
  });
  $("#employeeEmptyCta")?.addEventListener("click", () => focusForm("employeeForm", "name"));
  $$("[data-edit-employee]").forEach((button) => button.addEventListener("click", () => editEmployee(button.dataset.editEmployee)));
  $$("[data-delete-employee]").forEach((button) => button.addEventListener("click", () => removeRecord(employeeRepository, button.dataset.deleteEmployee, refresh)));
}

export function bindEmployees(refresh) {
  $("#employeeForm").addEventListener("submit", (event) => saveEmployee(event, refresh));
  $("#employeeSearch").addEventListener("input", () => renderEmployees(refresh));
}
