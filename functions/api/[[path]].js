const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type"
};

export async function onRequest(context) {
  const { request, env, params } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: jsonHeaders });
  }

  if (!env.CONTRACT_DB) {
    return send({ error: "D1 binding CONTRACT_DB is not configured." }, 500);
  }

  const parts = normalizePath(params.path);
  const resource = parts[0] || "";
  const id = parts[1] || "";

  try {
    if (resource === "health") {
      return send({ ok: true, storage: "d1" });
    }

    if (resource === "employers") {
      return handleEmployers(env.CONTRACT_DB, request, id);
    }

    if (resource === "employees") {
      return handleEmployees(env.CONTRACT_DB, request, id);
    }

    if (resource === "snapshot" && request.method === "GET") {
      const [employers, employees] = await Promise.all([
        listEmployers(env.CONTRACT_DB),
        listEmployees(env.CONTRACT_DB)
      ]);
      return send({ employers, employees });
    }

    return send({ error: "Route not found." }, 404);
  } catch (error) {
    return send({ error: error.message || "Unexpected API error." }, 500);
  }
}

async function handleEmployers(db, request, id) {
  if (request.method === "GET") {
    if (!id) return send(await listEmployers(db));
    const employer = await db.prepare("SELECT * FROM employers WHERE id = ?").bind(id).first();
    return employer ? send(mapEmployer(employer)) : send({ error: "Employer not found." }, 404);
  }

  if (request.method === "POST") {
    const input = await request.json();
    const employer = normalizeEmployer(input);
    employer.id = employer.id || createId("employer", employer.company_name || crypto.randomUUID());
    await db.prepare(
      `INSERT INTO employers (id, company_name, street, city, postal, vat, director, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(employer.id, employer.company_name, employer.street, employer.city, employer.postal, employer.vat, employer.director).run();
    return send(employer, 201);
  }

  if (request.method === "PUT" && id) {
    const employer = normalizeEmployer(await request.json());
    employer.id = id;
    await db.prepare(
      `UPDATE employers
       SET company_name = ?, street = ?, city = ?, postal = ?, vat = ?, director = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(employer.company_name, employer.street, employer.city, employer.postal, employer.vat, employer.director, id).run();
    return send(employer);
  }

  if (request.method === "DELETE" && id) {
    await db.prepare("DELETE FROM employers WHERE id = ?").bind(id).run();
    return send({ ok: true });
  }

  return send({ error: "Method not allowed." }, 405);
}

async function handleEmployees(db, request, id) {
  if (request.method === "GET") {
    if (!id) return send(await listEmployees(db));
    const employee = await db.prepare("SELECT * FROM employees WHERE id = ?").bind(id).first();
    return employee ? send(mapEmployee(employee)) : send({ error: "Employee not found." }, 404);
  }

  if (request.method === "POST") {
    const input = await request.json();
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

  if (request.method === "PUT" && id) {
    const employee = normalizeEmployee(await request.json());
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

  if (request.method === "DELETE" && id) {
    await db.prepare("DELETE FROM employees WHERE id = ?").bind(id).run();
    return send({ ok: true });
  }

  return send({ error: "Method not allowed." }, 405);
}

async function listEmployers(db) {
  const { results } = await db.prepare("SELECT * FROM employers ORDER BY company_name COLLATE NOCASE").all();
  return results.map(mapEmployer);
}

async function listEmployees(db) {
  const { results } = await db.prepare("SELECT * FROM employees ORDER BY lastname COLLATE NOCASE, name COLLATE NOCASE").all();
  return results.map(mapEmployee);
}

function mapEmployer(row) {
  return {
    id: row.id,
    company_name: row.company_name,
    street: row.street,
    city: row.city,
    postal: String(row.postal || ""),
    vat: row.vat,
    director: row.director
  };
}

function mapEmployee(row) {
  return {
    id: row.id,
    name: row.name,
    lastname: row.lastname,
    street: row.street,
    city: row.city,
    postal: String(row.postal || ""),
    personal_id: row.personal_id,
    employer_names: safeJsonArray(row.employer_names)
  };
}

function normalizeEmployer(input) {
  return {
    id: text(input.id),
    company_name: required(input.company_name, "Company name"),
    street: text(input.street),
    city: text(input.city),
    postal: text(input.postal),
    vat: text(input.vat),
    director: text(input.director)
  };
}

function normalizeEmployee(input) {
  return {
    id: text(input.id),
    name: required(input.name, "Name"),
    lastname: required(input.lastname, "Last name"),
    street: text(input.street),
    city: text(input.city),
    postal: text(input.postal),
    personal_id: required(input.personal_id, "Personal ID"),
    employer_names: Array.isArray(input.employer_names) ? input.employer_names.map(text).filter(Boolean) : []
  };
}

function normalizePath(path) {
  if (!path) return [];
  return Array.isArray(path) ? path : String(path).split("/");
}

function safeJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function text(value) {
  return value == null ? "" : String(value).trim();
}

function required(value, label) {
  const normalized = text(value);
  if (!normalized) throw new Error(`${label} is required.`);
  return normalized;
}

function createId(prefix, value) {
  const slug = String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return `${prefix}_${slug || crypto.randomUUID()}`;
}

function send(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: jsonHeaders
  });
}
