import { state } from "./constants.js";
import { persist, writeSessionData, saveStaticDataFile } from "./storage.js";

// Thin wrapper around a `state[resource]` array, grouping the id-based
// CRUD behavior that employers/accounting/employees all repeat identically.
export class Repository {
  constructor(resource) {
    this.resource = resource;
  }

  list() {
    return state[this.resource];
  }

  findById(id) {
    return state[this.resource].find((item) => item.id === id);
  }

  async save(record) {
    return persist(this.resource, record);
  }

  async remove(id) {
    state[this.resource] = state[this.resource].filter((item) => item.id !== id);
    writeSessionData();
    return saveStaticDataFile();
  }
}

export const employerRepository = new Repository("employers");
export const accountingRepository = new Repository("accounting");
export const employeeRepository = new Repository("employees");
