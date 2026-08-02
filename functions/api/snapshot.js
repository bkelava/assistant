import { send } from "../_lib/http.js";
import { listEmployers } from "../_lib/employers.js";
import { listEmployees } from "../_lib/employees.js";

export async function onRequestGet(context) {
  const [employers, employees] = await Promise.all([
    listEmployers(context.env.CONTRACT_DB),
    listEmployees(context.env.CONTRACT_DB)
  ]);
  return send({ employers, employees });
}
