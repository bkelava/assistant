import { send, createId, firstParam } from "../../_lib/http.js";
import { mapEmployee, normalizeEmployee, listEmployees } from "../../_lib/employees.js";

export async function onRequestGet(context) {
  const db = context.env.CONTRACT_DB;
  const id = firstParam(context.params.id);
  if (!id) return send(await listEmployees(db));
  const employee = await db.prepare("SELECT * FROM employees WHERE id = ?").bind(id).first();
  return employee ? send(mapEmployee(employee)) : send({ error: "Employee not found." }, 404);
}

export async function onRequestPost(context) {
  const db = context.env.CONTRACT_DB;
  const input = await context.request.json();
  const employee = normalizeEmployee(input);
  employee.id = employee.id || createId("employee", `${employee.name}-${employee.lastname}-${employee.personal_id}`);
  await db.prepare(
    `INSERT INTO employees (id, name, lastname, street, city, postal, personal_id, employer_names, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  ).bind(
    employee.id,
    employee.name,
    employee.lastname,
    employee.street,
    employee.city,
    employee.postal,
    employee.personal_id,
    JSON.stringify(employee.employer_names)
  ).run();
  return send(employee, 201);
}

export async function onRequestPut(context) {
  const id = firstParam(context.params.id);
  if (!id) return send({ error: "Method not allowed." }, 405);
  const db = context.env.CONTRACT_DB;
  const employee = normalizeEmployee(await context.request.json());
  employee.id = id;
  await db.prepare(
    `UPDATE employees
     SET name = ?, lastname = ?, street = ?, city = ?, postal = ?, personal_id = ?, employer_names = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(
    employee.name,
    employee.lastname,
    employee.street,
    employee.city,
    employee.postal,
    employee.personal_id,
    JSON.stringify(employee.employer_names),
    id
  ).run();
  return send(employee);
}

export async function onRequestDelete(context) {
  const id = firstParam(context.params.id);
  if (!id) return send({ error: "Method not allowed." }, 405);
  const db = context.env.CONTRACT_DB;
  await db.prepare("DELETE FROM employees WHERE id = ?").bind(id).run();
  return send({ ok: true });
}
