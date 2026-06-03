export const emptySessionData = {
  employers: [],
  accounting: [],
  employees: []
};

export const state = {
  employers: [],
  accounting: [],
  employees: [],
  drafts: [],
  currentView: "dashboard"
};

export const sessionDataKey = "contract-office-session-data-v2";
export const draftsKey = "contract-office-drafts-v1";
export const defaultStaticDataUrl = "static-data.json";

export const numbers1To30 = Array.from({ length: 31 }, (_, index) => String(index + 1));
export const numbers1To12 = Array.from({ length: 12 }, (_, index) => String(index + 1));
export const vacationOptions = Array.from({ length: 50 }, (_, index) => String(index + 1));
export const courtOptions = [
  "Bjelovaru", "Dubrovniku", "Karlovcu", "Osijeku", "Puli", "Rijeci", "Sisku",
  "Slavonskom Brodu", "Splitu", "Šibeniku", "Varaždinu", "Velikoj Gorici",
  "Vukovaru", "Zadru", "Zagrebu"
];

export const documentTypeLabels = {
  full_time: "Ugovor o radu na neodređeno vrijeme",
  part_time: "Ugovor o radu na određeno vrijeme",
  annex_standard: "Aneks ugovora o radu",
  annex_a1: "Aneks ugovora o radu za A1",
  erv: "Evidencija radnog vremena",
  accounting_services: "Ugovor o knjigovodstveno-računovodstvenim uslugama",
  business_cooperation: "Ugovor o poslovnoj suradnji",
  vehicle_power_of_attorney: "Punomoć za vozilo",
  work_order: "Radni nalog",
  virtual_address_lease: "Ugovor o najmu virtualne adrese",
  confirmation_indefinite: "Potvrda o sklopljenom ugovoru o radu na neodređeno",
  mutual_termination: "Sporazum o prestanku ugovora o radu",
  probation_unsatisfactory: "Otkaz zbog nezadovoljavanja na probnom radu",
  work_obligation_warning: "Upozorenje na obveze iz radnog odnosa",
  misconduct_notice: "Otkaz zbog skrivljenog ponašanja",
  personal_notice: "Osobno uvjetovani otkaz",
  business_economic_notice: "Poslovno uvjetovani otkaz – gospodarski razlozi",
  business_organizational_notice: "Poslovno uvjetovani otkaz – organizacijski razlozi",
  business_technological_notice: "Poslovno uvjetovani otkaz – tehnološki razlozi",
  changed_contract_offer: "Otkaz s ponudom izmijenjenog ugovora",
  employee_regular_notice: "Redoviti otkaz zaposlenika",
  employer_extraordinary_notice: "Izvanredni otkaz poslodavca",
  employee_extraordinary_notice: "Izvanredni otkaz zaposlenika",
  fixed_term_expiry_notice: "Obavijest o isteku ugovora na određeno",
  retirement_65_15_notice: "Obavijest o prestanku – 65 god. / 15 god. staža",
  housing_statement: "Izjava o stanovanju"
};

export const documentCategories = [
  { title: "Ugovori o radu", types: ["full_time", "part_time"] },
  { title: "Aneksi", types: ["annex_standard", "annex_a1"] },
  { title: "Evidencija radnog vremena", types: ["erv"] },
  { title: "Ugovori o uslugama i suradnji", types: ["accounting_services", "business_cooperation", "virtual_address_lease"] },
  { title: "Punomoći i nalozi", types: ["vehicle_power_of_attorney", "work_order"] },
  { title: "Potvrde i izjave", types: ["confirmation_indefinite", "housing_statement"] },
  {
    title: "Sporazumi i otkazi",
    types: [
      "mutual_termination", "probation_unsatisfactory", "work_obligation_warning",
      "misconduct_notice", "personal_notice",
      "business_economic_notice", "business_organizational_notice", "business_technological_notice",
      "changed_contract_offer", "employee_regular_notice",
      "employer_extraordinary_notice", "employee_extraordinary_notice",
      "fixed_term_expiry_notice", "retirement_65_15_notice"
    ]
  }
];

export const monthNamesHr = [
  "siječanj", "veljača", "ožujak", "travanj", "svibanj", "lipanj",
  "srpanj", "kolovoz", "rujan", "listopad", "studeni", "prosinac"
];
export const dayNamesHr = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];
export const ervColumns = ["Datum", "Dut", "Dol", "Odl", "Uks", "RR", "B-DP", "GO", "BOL-PO", "BOL-HZZO", "P", "SP", "PD", "SR", "DR", "RuK", "RnD"];
export const ervColumnDescriptions = {
  Dut: "Dan u tjednu",
  Dol: "Dolazak sati",
  Odl: "Odlazak sati",
  Uks: "Ukupno sati",
  RR: "Redovni rad",
  "B-DP": "Blagdan, državni praznik",
  GO: "Godišnji odmor",
  "BOL-PO": "Bolovanje na teret poslodavca",
  "BOL-HZZO": "Bolovanje na teret HZZO-a",
  P: "Prekovremeni rad",
  SP: "Službeni put",
  PD: "Plaćeni dopust",
  SR: "Smjenski rad",
  DR: "Dvokratni rad",
  RuK: "Rad u kombinaciji",
  RnD: "Rad na daljinu"
};

export const labels = {
  full_time: {
    title: "UGOVOR O RADU NA NEODREĐENO VRIJEME",
    l1: "Između", l2: "kojeg zastupa", l3: "(dalje: Poslodavac) i", l4: "(dalje: Radnik) dana", l5: "sklopljen je",
    s1: "I. Opće odredbe",
    p1: "1. Ovim se Ugovorom utvrđuju međusobna prava, obveze i odgovornosti na radu između Poslodavca i Radnika.",
    p2: "2. Ovim Ugovorom Radnik zasniva radni odnos na neodređeno vrijeme za obavljanje poslova",
    p3: "3. Ugovorne stranke ugovaraju probni rad Radnika u trajanju od",
    p4: "4. Mjesto rada Radnika je u",
    p4b: ", a u slučaju potrebe Poslodavca i u nekom drugom mjestu na području Republike Hrvatske.",
    p5: "5. Pored poslova navedenih u točki 2. ovog Ugovora, Radnik će obavljati i druge poslove prema nalogu Poslodavca, a koji su u skladu naravi i vrsti posla za koje je zasnovan radni odnos.",
    p6: "6. Radnik počinje s radom",
    salaryCopies: "4 jednaka primjerka od kojih Poslodavac zadržava tri, a Radnik jedan primjerak."
  },
  part_time: {
    title: "UGOVOR O RADU NA ODREĐENO VRIJEME",
    l1: "Između", l2: "kojeg zastupa", l3: "(dalje: Poslodavac) i", l4: "(dalje: Radnik) dana", l5: "sklopljen je",
    s1: "I. Opće odredbe",
    p1: "1. Ovim se Ugovorom utvrđuju međusobna prava, obveze i odgovornosti na radu između Poslodavca i Radnika.",
    p2: "2. Ovim Ugovorom Radnik zasniva radni odnos na određeno vrijeme do",
    p2b: "za obavljanje poslova",
    p3: "3. Ugovorne stranke ugovaraju probni rad Radnika u trajanju od",
    p4: "4. Mjesto rada Radnika je u",
    p4b: ", a u slučaju potrebe Poslodavca i u nekom drugom mjestu na području Republike Hrvatske.",
    p5: "5. Pored poslova navedenih u točki 2. ovog Ugovora, Radnik će obavljati i druge poslove prema nalogu Poslodavca, a koji su u skladu naravi i vrsti posla za koje je zasnovan radni odnos.",
    p6: "6. Radnik počinje s radom",
    salaryCopies: "3 jednaka primjerka od kojih Poslodavac zadržava dva, a Radnik jedan primjerak."
  }
};

export const employmentDocumentDefinitions = {
  confirmation_indefinite: { title: "POTVRDA O SKLOPLJENOM UGOVORU O RADU NA NEODREĐENO VRIJEME", category: "confirmation" },
  mutual_termination: { title: "SPORAZUM O PRESTANKU UGOVORA O RADU", category: "mutual" },
  probation_unsatisfactory: { title: "OTKAZ ZBOG NEZADOVOLJAVANJA RADNIKA NA PROBNOM RADU", category: "probation" },
  work_obligation_warning: { title: "UPOZORENJE NA OBVEZE IZ RADNOG ODNOSA", category: "warning" },
  misconduct_notice: { title: "REDOVITI OTKAZ UGOVORA O RADU ZBOG SKRIVLJENOG PONAŠANJA", category: "misconduct" },
  personal_notice: { title: "REDOVITI OSOBNO UVJETOVANI OTKAZ UGOVORA O RADU", category: "personal" },
  business_economic_notice: { title: "REDOVITI POSLOVNO UVJETOVANI OTKAZ ZBOG GOSPODARSKIH RAZLOGA", category: "business", businessReason: "gospodarskih razloga" },
  business_organizational_notice: { title: "REDOVITI POSLOVNO UVJETOVANI OTKAZ ZBOG ORGANIZACIJSKIH RAZLOGA", category: "business", businessReason: "organizacijskih razloga" },
  business_technological_notice: { title: "REDOVITI POSLOVNO UVJETOVANI OTKAZ ZBOG TEHNOLOŠKIH RAZLOGA", category: "business", businessReason: "tehnoloških razloga" },
  changed_contract_offer: { title: "OTKAZ S PONUDOM IZMIJENJENOG UGOVORA", category: "changed" },
  employee_regular_notice: { title: "REDOVITI OTKAZ ZAPOSLENIKA", category: "employee_regular" },
  employer_extraordinary_notice: { title: "IZVANREDNI OTKAZ UGOVORA O RADU OD STRANE POSLODAVCA", category: "employer_extraordinary" },
  employee_extraordinary_notice: { title: "IZVANREDNI OTKAZ ZAPOSLENIKA", category: "employee_extraordinary" },
  fixed_term_expiry_notice: { title: "OBAVIJEST O PRESTANKU UGOVORA O RADU NA ODREĐENO VRIJEME", category: "fixed_expiry" },
  retirement_65_15_notice: { title: "OBAVIJEST O PRESTANKU UGOVORA O RADU RADI 65 GODINA ŽIVOTA I 15 GODINA MIROVINSKOG STAŽA", category: "retirement" },
  housing_statement: { title: "IZJAVA O STANOVANJU", category: "housing" }
};

export const employmentVacationFields = ["vacationYear", "vacationTotal", "vacationUsed", "vacationRemaining", "vacationFrom", "vacationTo"];

export const employmentDocumentFieldSets = {
  confirmation_indefinite: ["docPlace", "docDate", "contractDate", "jobTitle", "workPlace", "startDate", "probationPeriod", "probationNotice", "paymentAmount", "vacationTotal"],
  mutual_termination: ["docPlace", "docDate", "contractDate", "contractType", "jobTitle", "endDate", ...employmentVacationFields],
  probation_unsatisfactory: ["docPlace", "docDate", "contractDate", "jobTitle", "probationPeriod", "probationNotice", "reason"],
  work_obligation_warning: ["docPlace", "docDate", "contractDate", "contractType", "jobTitle", "violation", "reason"],
  misconduct_notice: ["docPlace", "docDate", "contractDate", "contractType", "jobTitle", "noticePeriod", ...employmentVacationFields, "violation", "reason"],
  personal_notice: ["docPlace", "docDate", "contractDate", "contractType", "jobTitle", "noticePeriod", ...employmentVacationFields, "reason"],
  business_economic_notice: ["docPlace", "docDate", "contractDate", "contractType", "jobTitle", "noticePeriod", ...employmentVacationFields, "paymentAmount", "reason"],
  business_organizational_notice: ["docPlace", "docDate", "contractDate", "contractType", "jobTitle", "noticePeriod", ...employmentVacationFields, "paymentAmount", "reason"],
  business_technological_notice: ["docPlace", "docDate", "contractDate", "contractType", "jobTitle", "noticePeriod", ...employmentVacationFields, "paymentAmount", "reason"],
  changed_contract_offer: ["docPlace", "docDate", "contractDate", "jobTitle", "noticePeriod", "changedContractSummary", "reason"],
  employee_regular_notice: ["docPlace", "docDate", "contractDate", "jobTitle", "endDate", "noticePeriod", "reason"],
  employer_extraordinary_notice: ["docPlace", "docDate", "contractDate", "jobTitle", "endDate", "violation", "reason"],
  employee_extraordinary_notice: ["docPlace", "docDate", "contractDate", "jobTitle", "endDate", "reason"],
  fixed_term_expiry_notice: ["docPlace", "docDate", "contractDate", "jobTitle", "endDate", ...employmentVacationFields],
  retirement_65_15_notice: ["docPlace", "docDate", "contractDate", "endDate", "employeeAge", "pensionYears", ...employmentVacationFields],
  housing_statement: ["docPlace", "docDate", "housingAddress", "housingDescription"]
};

export const templateDocumentFieldSets = {
  business_cooperation: ["partyA", "partyB", "businessDate", "businessPlace", "businessWork", "businessPrice", "businessIban", "businessEnd"],
  vehicle_power_of_attorney: ["partyA", "paIdCard", "partyB", "pbIdCard", "businessDate", "businessPlace", "vehicleInfo", "vehicleVin", "vehiclePlate", "vehicleValidUntil"],
  work_order: ["partyA", "partyB", "businessDate", "workOrderNumber", "workOrderRequest", "workOrderCostPlace", "workOrderCostOwner", "workOrderDescription"],
  virtual_address_lease: ["partyA", "partyB", "businessDate", "businessPlace", "leaseAddress", "leaseCadastral", "leaseStart", "leaseEnd", "leaseFee", "leaseIban", "leaseEmail"]
};

export const partySourceOptions = {
  pa: {
    business_cooperation:      ["employer", "adhoc_company", "adhoc_person"],
    vehicle_power_of_attorney: ["employer", "employee", "adhoc_company", "adhoc_person"],
    work_order:                ["employer", "adhoc_company", "adhoc_person"],
    virtual_address_lease:     ["employer", "adhoc_company", "adhoc_person"]
  },
  pb: {
    business_cooperation:      ["employer", "accounting", "employee", "adhoc_company", "adhoc_person"],
    vehicle_power_of_attorney: ["employee", "adhoc_person"],
    work_order:                ["employer", "employee", "adhoc_company", "adhoc_person"],
    virtual_address_lease:     ["employer", "employee", "adhoc_company", "adhoc_person"]
  }
};

export const sourceLabels = {
  employer:      "Poslodavac (iz baze)",
  employee:      "Radnik (iz baze)",
  accounting:    "Knjigovodstvo (iz baze)",
  adhoc_company: "Pravna osoba (ručni unos)",
  adhoc_person:  "Fizička osoba (ručni unos)"
};

export const blankControlLabels = {
  employer_id: "Poslodavac - odabir",
  employer_info_display: "Poslodavac - adresa i OIB",
  director_display: "Poslodavac - zastupnik / odgovorna osoba",
  employee_id: "Radnik - odabir",
  employee_personal_id_display: "Radnik - OIB / putovnica",
  contract_date: "Datum sklapanja ugovora",
  end_job_use_date: "Kraj ugovora - koristi datum",
  end_job_date: "Kraj ugovora - datum",
  end_job_use_description: "Kraj ugovora - koristi opis",
  end_job_description: "Kraj ugovora - opis",
  job_description: "Poslovi radnika",
  trail_numbers: "Probni rad - broj",
  trail_option: "Probni rad - jedinica",
  working_place: "Mjesto rada",
  start_use_date: "Početak rada - koristi datum",
  start_date: "Početak rada - datum",
  start_use_description: "Početak rada - koristi opis",
  start_date_description: "Početak rada - opis",
  salary: "Osnovna bruto plaća",
  salary_bonus: "Stimulativni dio plaće",
  salary_increment_1: "Otežani uvjeti rada",
  salary_increment_2: "Blagdani / neradni dani / Uskrs",
  salary_increment_3: "Rad nedjeljom",
  salary_increment_4: "Noćni rad",
  salary_increment_5: "Prekovremeni rad",
  salary_increment_6: "Druga smjena",
  work_type: "Vrsta radnog vremena",
  weekly_working_hours: "Sati tjedno",
  working_shift: "Radno vrijeme - raspored",
  working_time_start: "Radno vrijeme - početak",
  working_time_end: "Radno vrijeme - kraj",
  working_shift_description: "Radno vrijeme - opis",
  weekly_time_off: "Tjedni odmor",
  vacation: "Godišnji odmor - broj dana",
  vacation_description: "Opis godišnjeg odmora",
  contract_termination: "Ugovor na određeno - može li se otkazati",
  contract_termination_employer: "Otkazni rok poslodavac",
  contract_termination_employee: "Otkazni rok radnik",
  rights_and_obligations: "Ostala prava i obveze",
  court: "Nadležni sud",
  contract_start_use_date: "Stupanje ugovora na snagu - koristi datum",
  contract_starting_with: "Stupanje ugovora na snagu - datum",
  contract_start_use_description: "Stupanje ugovora na snagu - koristi opis",
  contract_start_with_description: "Stupanje ugovora na snagu - opis",
  a1_employer_id: "Poslodavac - odabir",
  a1_employer_info_display: "Poslodavac - adresa i OIB",
  a1_director_display: "Poslodavac - zastupnik / odgovorna osoba",
  a1_employee_id: "Radnik - odabir",
  a1_employee_personal_id_display: "Radnik - OIB / putovnica",
  a1_contract_date: "A1 aneks - datum osnovnog ugovora",
  a1_contract_type: "A1 aneks - vrsta osnovnog ugovora",
  a1_end_date: "A1 aneks - predviđeno trajanje rada u inozemstvu do",
  a1_working_place: "A1 aneks - mjesto rada u inozemstvu",
  a1_job_description: "A1 aneks - poslovi radnika",
  a1_court: "A1 aneks - nadležni sud",
  a1_signature_place: "A1 aneks - mjesto potpisa",
  a1_signature_date: "A1 aneks - datum potpisa",
  annex_contract_date: "Aneks - datum osnovnog ugovora",
  annex_base_contract_type: "Aneks - vrsta osnovnog ugovora",
  annex_effective_date: "Aneks - datum stupanja na snagu",
  annex_signature_place: "Aneks - mjesto potpisa",
  annex_signature_date: "Aneks - datum potpisa",
  annex_court: "Aneks - nadležni sud",
  annex_change_duration: "Aneks - mijenja se trajanje ugovora",
  annex_new_contract_type: "Aneks - novo trajanje ugovora",
  annex_new_end_date: "Aneks - novi datum isteka",
  annex_change_job: "Aneks - mijenjaju se poslovi radnika",
  annex_job_description: "Aneks - novi opis poslova",
  annex_change_probation: "Aneks - mijenja se probni rad",
  annex_probation_period: "Aneks - novo trajanje probnog rada",
  annex_change_work_place: "Aneks - mijenja se mjesto rada",
  annex_working_place: "Aneks - novo mjesto rada",
  annex_change_start_date: "Aneks - mijenja se početak rada",
  annex_start_date: "Aneks - novi početak rada",
  annex_change_salary: "Aneks - mijenja se plaća",
  annex_salary: "Aneks - nova osnovna bruto plaća",
  annex_salary_bonus: "Aneks - novi stimulativni dio plaće",
  annex_salary_increment_1: "Aneks - otežani uvjeti rada",
  annex_salary_increment_2: "Aneks - blagdani / neradni dani / Uskrs",
  annex_salary_increment_3: "Aneks - rad nedjeljom",
  annex_salary_increment_4: "Aneks - noćni rad",
  annex_salary_increment_5: "Aneks - prekovremeni rad",
  annex_salary_increment_6: "Aneks - druga smjena",
  annex_work_type: "Aneks - vrsta radnog vremena",
  annex_change_work_time: "Aneks - mijenja se radno vrijeme",
  annex_weekly_hours: "Aneks - novi sati tjedno",
  annex_working_shift_description: "Aneks - novi raspored radnog vremena",
  annex_change_weekly_rest: "Aneks - mijenja se tjedni odmor",
  annex_weekly_time_off: "Aneks - novi tjedni odmor",
  annex_change_vacation: "Aneks - mijenja se godišnji odmor",
  annex_vacation: "Aneks - novi broj dana godišnjeg odmora",
  annex_vacation_description: "Aneks - novi opis godišnjeg odmora",
  annex_change_notice: "Aneks - mijenjaju se otkazni rokovi",
  annex_notice_employer: "Aneks - novi otkazni rok poslodavac",
  annex_notice_employee: "Aneks - novi otkazni rok radnik",
  annex_change_rights: "Aneks - mijenjaju se ostala prava i obveze",
  annex_rights_and_obligations: "Aneks - nova ostala prava i obveze",
  annex_other_changes: "Aneks - druge izmjene i dopune",
  erv_employer_id: "ERV - poslodavac",
  erv_employee_id: "ERV - radnik",
  erv_year: "ERV - godina",
  erv_month: "ERV - mjesec",
  erv_non_working_days: "ERV - hrvatski neradni dani u mjesecu",
  services_client_id: "Ugovor o uslugama - klijent",
  services_accounting_id: "Ugovor o uslugama - knjigovodstveni ured",
  services_contract_date: "Ugovor o uslugama - datum sklapanja",
  services_contract_place: "Ugovor o uslugama - mjesto sklapanja",
  services_client_email: "Ugovor o uslugama - e-mail klijenta",
  services_accounting_email: "Ugovor o uslugama - e-mail knjigovodstva",
  services_document_delivery_day: "Ugovor o uslugama - dostava dokumentacije do dana u mjesecu",
  services_monthly_fee: "Ugovor o uslugama - mjesečna naknada",
  services_vat_status: "Ugovor o uslugama - PDV status naknade",
  services_annual_fee: "Ugovor o uslugama - završni račun / godišnja izvješća",
  services_annual_vat_status: "Ugovor o uslugama - PDV status završnog računa",
  services_payment_due_days: "Ugovor o uslugama - rok plaćanja",
  services_duration_type: "Ugovor o uslugama - trajanje ugovora",
  services_end_date: "Ugovor o uslugama - krajnji datum ugovora",
  services_notice_period_days: "Ugovor o uslugama - otkazni rok",
  services_court: "Ugovor o uslugama - nadležni sud",
  services_copies: "Ugovor o uslugama - broj primjeraka",
  services_scope: "Ugovor o uslugama - opseg usluga",
  services_excluded: "Ugovor o uslugama - izvanredne usluge koje nisu uključene u cijenu",
  employment_doc_place: "Mjesto dokumenta",
  employment_doc_date: "Datum dokumenta",
  employment_contract_date: "Datum ugovora o radu",
  employment_contract_type: "Vrsta ugovora",
  employment_job_title: "Naziv poslova",
  employment_work_place: "Mjesto rada",
  employment_start_date: "Početak rada",
  employment_end_date: "Prestanak radnog odnosa / kraj ugovora",
  employment_notice_period: "Otkazni rok",
  employment_vacation_year: "Godina godišnjeg odmora",
  employment_vacation_total: "Pripada godišnjeg odmora - broj dana",
  employment_vacation_used: "Iskorišteno godišnjeg odmora - broj dana",
  employment_vacation_remaining: "Preostalo godišnjeg odmora - broj dana",
  employment_vacation_from: "Godišnji odmor od",
  employment_vacation_to: "Godišnji odmor do",
  employment_payment_amount: "Iznos plaće / naknade / otpremnine",
  employment_probation_period: "Probni rad",
  employment_probation_notice: "Otkazni rok na probnom radu",
  employment_employee_age: "Navršene godine života",
  employment_pension_years: "Godine mirovinskog staža",
  employment_reason: "Razlog / opis okolnosti",
  employment_violation: "Opis povrede / upozorenja",
  employment_changed_contract_summary: "Sažetak izmijenjenog ugovora",
  housing_address: "Adresa smještaja",
  housing_description: "Opis smještaja",
  pa_source: "Stranka A - vrsta",
  pa_entity_id: "Stranka A - odabir iz baze",
  pa_name: "Stranka A - ime / naziv tvrtke",
  pa_oib: "Stranka A - OIB",
  pa_street: "Stranka A - ulica",
  pa_city: "Stranka A - grad",
  pa_postal: "Stranka A - poštanski broj",
  pa_director: "Stranka A - zastupnik / direktor",
  pa_id_card: "Stranka A - osobna iskaznica",
  pb_source: "Stranka B - vrsta",
  pb_entity_id: "Stranka B - odabir iz baze",
  pb_name: "Stranka B - ime / naziv tvrtke",
  pb_oib: "Stranka B - OIB",
  pb_street: "Stranka B - ulica",
  pb_city: "Stranka B - grad",
  pb_postal: "Stranka B - poštanski broj",
  pb_director: "Stranka B - zastupnik / direktor",
  pb_id_card: "Stranka B - osobna iskaznica",
  template_document_date: "Datum dokumenta",
  template_document_place: "Mjesto dokumenta",
  business_work_description: "Opis posla / radova",
  business_price: "Cijena / naknada",
  business_iban: "IBAN izvršitelja",
  business_end_date: "Trajanje do",
  vehicle_description: "Vozilo",
  vehicle_vin: "Broj šasije",
  vehicle_plate: "Registracija",
  vehicle_valid_until: "Punomoć vrijedi do",
  work_order_number: "Radni nalog broj",
  work_order_request_number: "Narudžbenica broj",
  work_order_cost_place: "Mjesto troška",
  work_order_cost_owner: "Nositelj troška",
  work_order_description: "Opis rada",
  lease_address: "Virtualna adresa",
  lease_cadastral: "ZK / k.č. opis",
  lease_start_date: "Početak najma",
  lease_end_date: "Kraj najma",
  lease_fee: "Mjesečna zakupnina",
  lease_iban: "IBAN zakupodavca",
  lease_tenant_email: "E-mail zakupnika",
  company_name: "Tvrtka",
  address: "Adresa",
  city: "Grad",
  oib: "OIB",
  director: "Direktor",
  report_year: "Godina",
  report_date: "Datum izvještaja",
  gain_before_tax: "Dobit prije poreza",
  gain_tax: "Porez na dobit",
  gain_after_tax: "Dobit nakon poreza",
  loss_coverage: "Pokriće gubitka"
};

export const views = {
  dashboard: ["Pregled", "Uredi podatke i generiraj dokumente u pregledniku."],
  employers: ["Poslodavci", "Dodaj, uredi i izbriši poslodavce."],
  accounting: ["Knjigovodstvo", "Dodaj knjigovodstvene urede za ugovore o uslugama."],
  employees: ["Radnici", "Dodaj radnike i povezi ih s poslodavcima."],
  documents: ["Generiranje dokumenata", "Odaberi vrstu dokumenta, ispuni obrazac i preuzmi."],
  nacrti: ["Nacrti", "Upravljaj spremljenim nacrtima dokumenata."],
  gfi: ["GFI", "Pripremi osnovnu odluku i izvještaj za GFI."]
};

export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => Array.from(document.querySelectorAll(selector));
