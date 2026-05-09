CREATE TABLE IF NOT EXISTS employers (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL UNIQUE,
  street TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  postal TEXT NOT NULL DEFAULT '',
  vat TEXT NOT NULL DEFAULT '',
  director TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  lastname TEXT NOT NULL DEFAULT '',
  street TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  postal TEXT NOT NULL DEFAULT '',
  personal_id TEXT NOT NULL UNIQUE,
  employer_names TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO employers (id, company_name, street, city, postal, vat, director)
VALUES
  ('emp_amz_gradnja', 'AMZ Gradnja d.o.o.', 'Kolodvrska 37', 'Stari Perkovci - Vrpolje', '35214', '72018608521', 'Josip Josipović'),
  ('emp_ad_solutions', 'A. D. Solutions j.d.o.o.', 'Topola 18', 'Bošnjaci', '32275', '93588155132', 'Ilija Dretvić');

INSERT OR IGNORE INTO employees (id, name, lastname, street, city, postal, personal_id, employer_names)
VALUES
  ('worker_amel_dedic', 'Amel', 'Dedić', 'Alije Hadžića 3', 'Kalesija - BiH', '75265', 'B1265547', '["AMZ Gradnja d.o.o."]'),
  ('worker_mirza_bjelic', 'Mirza', 'Bjelić', 'Barice BB', 'Živinice - BiH', '75270', 'B3333475', '["AMZ Gradnja d.o.o."]'),
  ('worker_mirsad_penjic', 'Mirsad', 'Penjić', '', 'Kakanj', '72240', 'B2260813', '["A. D. Solutions j.d.o.o."]'),
  ('worker_mirko_primorac', 'Mirko', 'Primorac', '', '', '', '31736872790', '["AMZ Gradnja d.o.o."]'),
  ('worker_adis_dzinic', 'Adis', 'Džinić', 'G. Petrovice BB', 'Kalesija - BiH', '75265', 'B2217638', '["AMZ Gradnja d.o.o."]'),
  ('worker_fahrudin_delalic', 'Fahrudin', 'Delalić', 'Barice BB', 'Živinice - BiH', '75270', '63687907915', '["AMZ Gradnja d.o.o."]');
