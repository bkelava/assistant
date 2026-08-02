import { $, state, templateDocumentFieldSets, employmentDocumentDefinitions } from "../core/constants.js";
import { formatDate, formatAddress, normalizeTime24, formToObject } from "../core/utils.js";
import { buildFullTimeContractExact, buildPartTimeContractExact, buildStandardAnnex, buildAnnexA1Exact, buildErvDocument } from "./contracts.js";
import { buildAccountingServicesDocument } from "./services.js";
import { buildTemplateDocument } from "./templates.js";
import { buildEmploymentDocument } from "./employment.js";

export { buildGfiDocument } from "../gfi/document.js";
export { buildBlankDocument, buildBlankDocumentFromForm } from "./blank.js";

// --- Main document entry point ---

export function buildDocument() {
  const form = $("#documentForm");
  const data = formToObject(form);
  if (data.type === "accounting_services") return buildAccountingServicesDocument(data);
  if (templateDocumentFieldSets[data.type]) return buildTemplateDocument(data);
  if (employmentDocumentDefinitions[data.type]) return buildEmploymentDocument(data);
  const isAnnex = data.type === "annex_a1" || data.type === "annex_standard";
  const employerId = isAnnex ? data.a1_employer_id : data.type === "erv" ? data.erv_employer_id : data.employer_id;
  const employeeId = isAnnex ? data.a1_employee_id : data.type === "erv" ? data.erv_employee_id : data.employee_id;
  const employer = state.employers.find((item) => item.id === employerId) || state.employers[0] || {};
  const employee = state.employees.find((item) => item.id === employeeId) || state.employees[0] || {};
  const employeeName = `${employee.name || ""} ${employee.lastname || ""}`.trim();
  const employerInfo = `${formatAddress(employer)}${employer.vat ? `, OIB: ${employer.vat}` : ""}`;
  const context = {
    ...data,
    contract_date: formatDate(data.contract_date),
    end_job_date: data.end_job_use_date ? formatDate(data.end_job_date) : "",
    end_job_description: data.end_job_use_description ? data.end_job_description : "",
    start_date: data.start_use_date ? formatDate(data.start_date) : "",
    start_date_description: data.start_use_description ? data.start_date_description : "",
    contract_starting_with: data.contract_start_use_date ? formatDate(data.contract_starting_with) : "",
    contract_start_with_description: data.contract_start_use_description ? data.contract_start_with_description : "",
    working_time_start: normalizeTime24(data.working_time_start),
    working_time_end: normalizeTime24(data.working_time_end),
    employer,
    employee,
    employeeName,
    employerInfo,
    employeePersonalId: employee.personal_id || "",
    director: employer.director || ""
  };
  const parties = [employer.company_name, employeeName].filter(Boolean);
  if (data.type === "annex_standard") return { ...buildStandardAnnex(context), parties };
  if (data.type === "annex_a1") return { ...buildAnnexA1Exact(context), parties };
  if (data.type === "erv") return { ...buildErvDocument(context), parties };
  return { ...(data.type === "part_time" ? buildPartTimeContractExact(context) : buildFullTimeContractExact(context)), parties };
}
