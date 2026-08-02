import { employmentDocumentDefinitions, employmentDocumentFieldSets, blankControlLabels } from "../core/constants.js";
import { escapeHtml, titleCaseDocument, humanizeFieldName, htmlToText } from "../core/utils.js";
import { center, twoPartySignature, singleSignature } from "./shared.js";

// --- Blank document helpers ---

function field(label, height = 0, box = false) {
  return { label, height, box };
}

function blankRow(label) {
  return `<p class="blank-row"><span>${escapeHtml(label)}</span><i></i></p>`;
}

function blankBox(label, height = 34) {
  return `<div class="blank-box" style="min-height:${height}mm"><strong>${escapeHtml(label)}</strong></div>`;
}

function blankSignatureForType(type) {
  if (type === "vehicle_power_of_attorney") return singleSignature("");
  if (["work_order", "business_cooperation", "virtual_address_lease", "accounting_services"].includes(type)) {
    return twoPartySignature("Prva strana", "", "Druga strana", "");
  }
  if (type === "employee_regular_notice" || type === "employee_extraordinary_notice") return singleSignature("");
  if (type === "housing_statement" || employmentDocumentDefinitions[type]) return singleSignature("");
  return twoPartySignature("Poslodavac", "", "Radnik", "");
}

function isLongBlankField(name) {
  return /description|scope|excluded|reason|violation|summary|address|info_display|director_display|personal_id_display|work_order_description/i.test(name || "");
}

function blankHeightForControl(control) {
  if (control.tagName === "TEXTAREA") return Math.max(32, Number(control.rows || 4) * 9);
  return isLongBlankField(control.name) ? 24 : 0;
}

function blankLabelForControl(control) {
  const explicit = blankControlLabels[control.name];
  if (explicit) return explicit;
  const label = control.closest("label");
  if (label) {
    const clone = label.cloneNode(true);
    clone.querySelectorAll("input, select, textarea, .hint-icon").forEach((item) => item.remove());
    const text = clone.textContent.replace(/\s+/g, " ").trim();
    if (text) return text;
  }
  const line = control.closest(".contract-line");
  if (line) {
    const lineClone = line.cloneNode(true);
    lineClone.querySelectorAll(".hint-icon").forEach((item) => item.remove());
    const parts = Array.from(lineClone.querySelectorAll("span"))
      .map((span) => span.textContent.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  return humanizeFieldName(control.name);
}

function shouldIncludeBlankControl(control) {
  if (!control.name || control.type === "hidden") return false;
  if (control.classList.contains("native-date-picker")) return false;
  if (control.name === "type") return false;
  const section = control.closest(".field-group, .contract-editor, .document-panel");
  if (section?.classList.contains("hidden")) return false;
  if (control.closest("[data-employment-field].hidden, [data-template-field].hidden")) return false;
  return true;
}

export function blankFieldsFromForm(form) {
  const controls = Array.from(form.querySelectorAll("input, select, textarea"))
    .filter((control) => shouldIncludeBlankControl(control));
  const seen = new Set();
  return controls.flatMap((control) => {
    const label = blankLabelForControl(control);
    if (!label || seen.has(control.name || label)) return [];
    seen.add(control.name || label);
    return [{ label, box: control.tagName === "TEXTAREA" || isLongBlankField(control.name), height: blankHeightForControl(control) }];
  });
}

function blankDocumentHtml(type) {
  const fields = blankFieldsForType(type);
  return `
    ${center("PODACI ZA RUČNI UNOS")}
    <div class="blank-form-grid">
      ${fields.map((f) => f.box ? blankBox(f.label, f.height) : blankRow(f.label)).join("")}
    </div>
    ${blankSignatureForType(type)}
  `;
}

export function buildBlankDocument(type) {
  const titles = {
    full_time: "UGOVOR O RADU NA NEODREĐENO VRIJEME",
    part_time: "UGOVOR O RADU NA ODREĐENO VRIJEME",
    annex_standard: "ANEKS UGOVORA O RADU",
    annex_a1: "ANEKS UGOVORA O RADU ZA A1",
    erv: "EVIDENCIJA RADNOG VREMENA",
    accounting_services: "UGOVOR O KNJIGOVODSTVENO-RAČUNOVODSTVENIM USLUGAMA",
    business_cooperation: "UGOVOR O POSLOVNOJ SURADNJI",
    vehicle_power_of_attorney: "PUNOMOĆ ZA VOZILO",
    work_order: "RADNI NALOG",
    virtual_address_lease: "UGOVOR O NAJMU VIRTUALNE ADRESE",
    gfi: "GFI ODLUKA / IZVJEŠTAJ",
    ...Object.fromEntries(Object.entries(employmentDocumentDefinitions).map(([key, value]) => [key, value.title]))
  };
  const title = titles[type] || "PRAZAN DOKUMENT";
  const html = blankDocumentHtml(type);
  return { title, html, body: htmlToText(html) };
}

export function buildBlankDocumentFromForm(form, title, type) {
  const fields = blankFieldsFromForm(form);
  const html = `
    ${center("PODACI ZA RUČNI UNOS")}
    <div class="blank-form-grid">
      ${fields.map((f) => f.box ? blankBox(f.label, f.height) : blankRow(f.label)).join("")}
    </div>
    ${blankSignatureForType(type)}
  `;
  return {
    title: titleCaseDocument(title || "Prazan dokument").toUpperCase(),
    html,
    body: htmlToText(html)
  };
}

function blankAnnexParties() {
  return [
    field("Poslodavac - naziv, adresa, OIB, zastupnik", 28, true),
    field("Radnik - ime, prezime, adresa, OIB/putovnica", 28, true)
  ];
}

function blankEmploymentContractFields(type) {
  const fields = [
    field("Poslodavac - naziv, adresa, OIB, zastupnik", 28, true),
    field("Radnik - ime, prezime, adresa, OIB/putovnica", 28, true),
    field("Datum sklapanja ugovora")
  ];
  if (type === "part_time") fields.push(field("Kraj ugovora - datum ili opis"));
  return [
    ...fields,
    field("Poslovi radnika", 24, true), field("Probni rad"), field("Mjesto rada", 18, true), field("Početak rada"),
    field("Osnovna bruto plaća"), field("Stimulativni dio plaće"),
    field("Dodaci na plaću", 24, true), field("Vrsta radnog vremena"), field("Sati tjedno"),
    field("Raspored radnog vremena", 22, true), field("Tjedni odmor"), field("Godišnji odmor - broj dana"), field("Opis godišnjeg odmora"),
    field("Otkazni rok poslodavac"), field("Otkazni rok radnik"), field("Ostala prava i obveze", 24, true),
    field("Nadležni sud"), field("Datum ili opis stupanja ugovora na snagu")
  ];
}

function blankEmploymentDocumentFields(type) {
  const labelMap = {
    docPlace: "Mjesto dokumenta", docDate: "Datum dokumenta", contractDate: "Datum ugovora o radu",
    contractType: "Vrsta ugovora", jobTitle: "Naziv poslova", workPlace: "Mjesto rada",
    startDate: "Početak rada", endDate: "Prestanak radnog odnosa / kraj ugovora",
    noticePeriod: "Otkazni rok", vacationYear: "Godina godišnjeg odmora",
    vacationTotal: "Pripada godišnjeg odmora - broj dana", vacationUsed: "Iskorišteno godišnjeg odmora - broj dana",
    vacationRemaining: "Preostalo godišnjeg odmora - broj dana", vacationFrom: "Godišnji odmor od",
    vacationTo: "Godišnji odmor do", paymentAmount: "Iznos plaće / naknade / otpremnine",
    probationPeriod: "Probni rad", probationNotice: "Otkazni rok na probnom radu",
    employeeAge: "Navršene godine života", pensionYears: "Godine mirovinskog staža",
    reason: "Razlog / opis okolnosti", violation: "Opis povrede / upozorenja",
    changedContractSummary: "Sažetak izmijenjenog ugovora", housingAddress: "Adresa smještaja",
    housingDescription: "Opis smještaja"
  };
  const largeFields = new Set(["reason", "violation", "changedContractSummary", "housingDescription"]);
  return [
    field("Poslodavac - naziv, adresa, OIB, zastupnik", 28, true),
    field("Radnik - ime, prezime, adresa, OIB/putovnica", 28, true),
    ...(employmentDocumentFieldSets[type] || []).map((key) => field(labelMap[key] || key, largeFields.has(key) ? 42 : 0, largeFields.has(key)))
  ];
}

function blankFieldsForType(type) {
  if (type === "full_time" || type === "part_time") return blankEmploymentContractFields(type);
  if (type === "annex_standard") return [
    ...blankAnnexParties(),
    field("Datum osnovnog ugovora"), field("Vrsta osnovnog ugovora"), field("Datum stupanja aneksa na snagu"),
    field("Mjesto potpisa"), field("Datum potpisa"), field("Nadležni sud"),
    field("Mijenja se trajanje ugovora - novo trajanje"), field("Novi datum isteka ako je ugovor na određeno vrijeme"),
    field("Mijenjaju se poslovi radnika - novi opis poslova", 28, true),
    field("Mijenja se probni rad - novo trajanje"), field("Mijenja se mjesto rada"),
    field("Mijenja se početak rada"), field("Mijenja se osnovna bruto plaća"), field("Stimulativni dio plaće"),
    field("Dodaci na plaću: otežani uvjeti, blagdani, nedjelja, noćni rad, prekovremeni rad, druga smjena", 24, true),
    field("Mijenja se radno vrijeme - vrsta, sati tjedno i raspored", 24, true),
    field("Mijenja se tjedni odmor"), field("Mijenja se godišnji odmor - broj dana i opis"),
    field("Mijenjaju se otkazni rokovi"), field("Mijenjaju se ostala prava i obveze", 28, true),
    field("Druge izmjene i dopune", 40, true)
  ];
  if (type === "annex_a1") return [
    ...blankAnnexParties(), field("Datum osnovnog ugovora"), field("Vrsta osnovnog ugovora"),
    field("Predviđeno trajanje rada u inozemstvu do"), field("Mjesto rada u inozemstvu"),
    field("Poslovi radnika u inozemstvu", 28, true), field("Nadležni sud"), field("Mjesto i datum potpisa")
  ];
  if (type === "erv") return [
    field("Poslodavac - naziv, adresa, OIB", 24, true), field("Radnik - ime, prezime, OIB/putovnica", 24, true),
    field("Godina"), field("Mjesec"), field("Hrvatski neradni dani u mjesecu", 24, true),
    field("Evidencija po danima: datum, dolazak, odlazak, ukupno sati, redovni rad, bolovanje, godišnji odmor, prekovremeni rad i napomene", 90, true)
  ];
  if (type === "accounting_services") return [
    field("Klijent - naziv, adresa, OIB, zastupnik", 24, true), field("Knjigovodstveni ured - naziv, adresa, OIB, zastupnik", 24, true),
    field("Datum i mjesto sklapanja"), field("E-mail klijenta"), field("E-mail knjigovodstva"),
    field("Dostava dokumentacije do dana u mjesecu"), field("Mjesečna naknada i PDV status"),
    field("Završni račun / godišnja izvješća i PDV status"), field("Rok plaćanja"),
    field("Trajanje ugovora i krajnji datum ako je određeno vrijeme"), field("Otkazni rok"), field("Nadležni sud"),
    field("Broj primjeraka"), field("Opseg usluga", 48, true), field("Izvanredne usluge koje nisu uključene u cijenu", 34, true)
  ];
  if (type === "business_cooperation") return [
    field("Izvršitelj - naziv, adresa, OIB, zastupnik", 28, true), field("Naručitelj - naziv, adresa, OIB, zastupnik", 28, true),
    field("Datum i mjesto sklapanja"), field("Opis posla / radova", 34, true), field("Cijena / naknada"),
    field("IBAN izvršitelja"), field("Trajanje ugovora do"), field("Dodatne napomene", 34, true)
  ];
  if (type === "vehicle_power_of_attorney") return [
    field("Opunomoćitelj / vlasnik vozila - ime/naziv, adresa, OIB", 28, true),
    field("Osobna iskaznica vlasnika - broj, izdavatelj i datum izdavanja", 18, true),
    field("Opunomoćenik - ime/naziv, adresa, OIB", 28, true),
    field("Osobna iskaznica opunomoćenika - broj, izdavatelj i datum izdavanja", 18, true),
    field("Vozilo - marka, model, motor/snaga", 18, true), field("Broj šasije"), field("Registarska oznaka"),
    field("Ovlasti za vozilo", 55, true), field("Punomoć vrijedi do"), field("Mjesto i datum")
  ];
  if (type === "work_order") return [
    field("Ispostavio / izvršitelj - naziv, adresa, OIB", 24, true), field("Naručitelj - naziv, adresa, OIB", 24, true),
    field("Narudžbenica broj"), field("Rad započeo - datum i vrijeme"), field("Rad završio - datum i vrijeme"),
    field("Radni nalog broj"), field("Mjesto troška"), field("Nositelj troška"), field("Opis rada", 70, true)
  ];
  if (type === "virtual_address_lease") return [
    field("Zakupodavac - naziv/ime, adresa, OIB, zastupnik", 28, true), field("Zakupnik - naziv, adresa, OIB, zastupnik", 28, true),
    field("Datum i mjesto sklapanja"), field("Virtualna adresa"), field("ZK / k.č. opis nekretnine", 22, true),
    field("Početak najma"), field("Kraj najma"), field("Mjesečna zakupnina"), field("IBAN zakupodavca"),
    field("E-mail zakupnika"), field("Posebne napomene", 34, true)
  ];
  if (type === "gfi") return [
    field("Tvrtka - naziv, adresa, grad, OIB", 28, true),
    field("Direktor / odgovorna osoba"), field("Godina izvještaja"), field("Datum izvještaja"),
    field("Dobit prije poreza"), field("Porez na dobit"), field("Dobit nakon poreza"),
    field("Pokriće gubitka / raspored dobiti", 34, true)
  ];
  if (employmentDocumentDefinitions[type]) return blankEmploymentDocumentFields(type);
  return [field("Podaci prve strane", 28, true), field("Podaci druge strane", 28, true), field("Datum dokumenta"), field("Sadržaj dokumenta", 80, true)];
}

// --- Main document entry points ---
