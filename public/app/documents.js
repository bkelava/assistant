import { $, state, labels, employmentDocumentDefinitions, employmentDocumentFieldSets, templateDocumentFieldSets, ervColumns, ervColumnDescriptions, dayNamesHr, blankControlLabels } from "./constants.js";
import { escapeHtml, formatDate, normalizeMoney, normalizeTime24, safeMultiline, linesToListItems, joinDateOrDescription, vacationDaysText, htmlToText, numberWordHr, titleCaseDocument, formatAddress, getEmployer, getEmployee, partyDisplayName, partyOib, daysInMonth, croatianNonWorkingDays, humanizeFieldName, formToObject } from "./utils.js";

// --- HTML primitives ---

export function p(value, className = "") {
  return `<p class="${className}">${value}</p>`;
}

export function center(value) {
  return p(value, "center");
}

export function centerTitle(value) {
  return p(value, "center title");
}

export function b(value) {
  return `<strong>${escapeHtml(value)}</strong>`;
}

export function ul(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function ol(items) {
  return `<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
}

export function feeWithVatStatus(amount, vatStatus) {
  const normalized = normalizeMoney(amount);
  const amountLabel = `${normalized.replace(".", ",")} EUR`;
  return vatStatus === "nije u sustavu PDV-a" ? `${amountLabel} (${vatStatus})` : `${amountLabel} ${vatStatus}`;
}

// --- Signature helpers ---

export function signatureHtml(context) {
  return `
    <div class="signature-block">
      <div class="signature-card">
        <div class="signature-role">Poslodavac</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(context.director)}</div>
      </div>
      <div class="signature-card">
        <div class="signature-role">Radnik</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(context.employeeName)}</div>
      </div>
    </div>
  `;
}

export function serviceSignatureHtml(client, accounting) {
  return `
    <div class="signature-block">
      <div class="signature-card">
        <div class="signature-role">Klijent</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(client.company_name || "")}</div>
        <div>${escapeHtml(client.director || "")}</div>
      </div>
      <div class="signature-card">
        <div class="signature-role">Knjigovodstveni ured</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(accounting.company_name || "")}</div>
        <div>${escapeHtml(accounting.director || "")}</div>
      </div>
    </div>
  `;
}

export function twoPartySignature(leftRole, leftName, rightRole, rightName) {
  return `
    <div class="signature-block">
      <div class="signature-card">
        <div class="signature-role">${escapeHtml(leftRole)}</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(leftName)}</div>
      </div>
      <div class="signature-card">
        <div class="signature-role">${escapeHtml(rightRole)}</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(rightName)}</div>
      </div>
    </div>
  `;
}

export function singleSignature(name) {
  return `
    <div class="signature-block single-signature">
      <div class="signature-card">
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(name)}</div>
      </div>
    </div>
  `;
}

function employerOnlySignature(context) {
  return `
    <div class="signature-block single-signature">
      <div class="signature-card">
        <div class="signature-role">Za poslodavca</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(context.director)}</div>
      </div>
    </div>
  `;
}

function employeeOnlySignature(context) {
  return `
    <div class="signature-block single-signature">
      <div class="signature-card">
        <div class="signature-role">Radnik</div>
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(context.employeeName)}</div>
      </div>
    </div>
  `;
}

function deliveryList() {
  return `
    ${p("Dostaviti:")}
    ${ol(["Radniku - 2 primjerka", "Kadrovskoj službi", "Službi nadležnoj za obračun plaća i naknada plaće"])}
  `;
}

// --- Party helpers ---

export function partyIntro(party, role) {
  return p(`${b(partyDisplayName(party))}, ${formatAddress(party)}, OIB: ${b(partyOib(party))}, zastupano po ${b(party.director || "")} (u daljnjem tekstu: ${role})`);
}

export function partyIntroFull(party, role) {
  const rep = party.director ? `, zastupano po ${party.director}` : "";
  return p(`${b(party.name)}, ${party.address}, OIB: ${b(party.oib)}${rep} (u daljnjem tekstu: ${role})`);
}

export function resolveParty(prefix, data) {
  const source = data[`${prefix}_source`] || (prefix === "pa" ? "employer" : "employee");
  if (source === "employer") {
    const e = getEmployer(data[`${prefix}_entity_id`]);
    return { name: partyDisplayName(e), address: formatAddress(e), oib: partyOib(e), director: e.director || "", isCompany: true };
  }
  if (source === "employee") {
    const e = getEmployee(data[`${prefix}_entity_id`]);
    return { name: `${e.name || ""} ${e.lastname || ""}`.trim(), address: formatAddress(e), oib: e.personal_id || "", director: "", isCompany: false };
  }
  if (source === "accounting") {
    const e = state.accounting.find((a) => a.id === data[`${prefix}_entity_id`]) || {};
    return { name: partyDisplayName(e), address: formatAddress(e), oib: partyOib(e), director: e.director || "", isCompany: true };
  }
  const street = data[`${prefix}_street`] || "";
  const postal = data[`${prefix}_postal`] || "";
  const city = data[`${prefix}_city`] || "";
  const address = [street, [postal, city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const isCompany = source === "adhoc_company";
  return {
    name: data[`${prefix}_name`] || "",
    address,
    oib: data[`${prefix}_oib`] || "",
    director: isCompany ? (data[`${prefix}_director`] || "") : "",
    isCompany
  };
}

// --- Employment document context helpers ---

function employerParty(context) {
  return `${b(`${context.employer.company_name || ""}, ${context.employerInfo}`)}, zastupano po ${b(context.director)}, (u nastavku: Poslodavac)`;
}

function employeeParty(context) {
  return `${b(context.employeeInfo)}, (u nastavku: Radnik)`;
}

function employerActIntro(context, verb) {
  return p(`Na temelju mjerodavnih odredbi Zakona o radu, ${employerParty(context)} ${verb}`);
}

function vacationParagraph(context) {
  const usage = context.vacationFrom && context.vacationTo
    ? `koji će koristiti u razdoblju od ${b(context.vacationFrom)} do ${b(context.vacationTo)}`
    : "koji će koristiti u dogovoru s Poslodavcem ili za koji će se obračunati pripadajuća naknada ako ga ne iskoristi";
  return p(`Radnik ima pravo na ${b(context.vacationTotal)} dana godišnjeg odmora za ${b(context.vacationYear)} godinu, od čega je iskoristio ${b(context.vacationUsed)} dana, te mu preostaje ${b(context.vacationRemaining)} dana ${usage}.`);
}

// --- Contract document assembly ---

function makeContractDocument(title, parts) {
  const html = parts.flat().join("");
  return { title, html, body: htmlToText(html) };
}

function makeEmploymentDocument(context, parts) {
  return parts.flat().join("");
}

function makeEmployerDecision(context, actLabel, title, parts) {
  return makeEmploymentDocument(context, [
    employerActIntro(context, "donosi sljedeću"),
    centerTitle(actLabel),
    center(b(title)),
    ...parts,
    employerOnlySignature(context),
    deliveryList()
  ]);
}

function salaryAndWorkSections(context) {
  const shiftText = context.working_shift_description
    ? `${b(`${context.working_shift}: ${context.working_shift_description}.`)}`
    : `${b(context.working_shift)} , te počinje-završava ${b(`${context.working_time_start} - ${context.working_time_end}.`)}`;

  return [
    center("II. Plaće i naknade"),
    p(`1. Za realizaciju preuzetih obveza iz točke I.2. Radniku pripada osnovna bruto plaća u iznosu od ${b(context.salary)} eura.`),
    p("2. Isplata će se obavljati jedanput  mjesečno i to najkasnije do 15-tog u mjesecu za prethodni mjesec."),
    p(`3. Uz plaću navedenu u točki II.1. ovog Ugovora, Radniku pripada i stimulativni dio plaće u iznosu od ${b(context.salary_bonus)} eura bruto mjesečno.`),
    p("4. Radnik ima pravo na povećanu plaću za"),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- otežane uvjete rada ${b(context.salary_increment_1)}`),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- rad u dane blagdana i neradne dane utvrđene zakonom i za rad na dan Uskrsa ${b(context.salary_increment_2)}`),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- rad nedjeljom ${b(context.salary_increment_3)}`),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- noćni rad ${b(context.salary_increment_4)}`),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- prekovremeni rad ${b(context.salary_increment_5)}`),
    p(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- za rad u drugoj smjeni u slučaju stalnog smjenskog rada ${b(context.salary_increment_6)}`),
    center("III. Troškovi i naknade"),
    p("1. Radnik ima pravo naknade troškova za službena putovanja u zemlji i inozemstvu, u visini propisanoj zakonom."),
    center("IV. Radno vrijeme i godišnji odmor"),
    p(`1. Radnik će raditi ${b(context.work_type)} radno vrijeme od ${b(context.weekly_working_hours)} sati tjedno.`),
    p(`2. Radno vrijeme određuje se ${shiftText}`),
    p("3. U tijeku rada Radnik ima pravo koristiti dnevni odmor (stanku) u trajanju od 30 minuta."),
    p(`4. Tjedni odmor Radnik će koristiti ${b(`${context.weekly_time_off}.`)}`),
    p(`5. Radnik ima pravo na godišnji odmor u trajanju od ${b(`${vacationDaysText(context.vacation, context.vacation_description)}.`)}`),
    center("V. Čuvanje poslovne tajne"),
    p("1, Radnik se obvezuje da će za vrijeme trajnja Ugovora o radu, a i njegovo prestanka, čuvati sve poslovne tajne Poslodavca i njegovih komitenata prema neovlaštenim osobama, koje su po svojoj prirodi povjerene i zaštićene, a koje su mu bile povjerene ili koje je mogao saznati na poslu.")
  ].join("");
}

function closingSections(context, copiesText) {
  const start = joinDateOrDescription(context.contract_starting_with, context.contract_start_with_description);
  return [
    center("VII. Ostala prava i ovbeze Radnika i Poslodavca"),
    center(b(`${context.rights_and_obligations}.`)),
    center("VIII. Zaključne odredbe"),
    p(`1. Za slučaj spora, stranke ugovaraju mjesnu nadležnost suda u ${b(`${context.court}.`)}`),
    p(`2. Ovaj Ugovor stupa na snagu ${b(start.endsWith(".") ? start : `${start}.`)}`),
    p(`3. Ovaj je Ugovor sastavljen u ${copiesText}`)
  ].join("");
}

// --- Main contract builders ---

function buildFullTimeContractExact(context) {
  const l = labels.full_time;
  return makeContractDocument(l.title, [
    p(`${l.l1} ${b(`${context.employer.company_name || ""}, ${context.employerInfo}`)}, ${l.l2} ${b(context.director)}, ${l.l3} ${b(`${context.employeeName}, OIB/Putovnica: ${context.employeePersonalId}`)} ${l.l4} ${b(context.contract_date)} ${l.l5}`),
    centerTitle(l.title),
    center(l.s1),
    p(l.p1),
    p(l.p2),
    center(b(context.job_description)),
    p(`${l.p3} ${b(`${context.trail_numbers} ${context.trail_option}`)}`),
    p(`${l.p4} ${b(context.working_place)}${l.p4b}`),
    p(l.p5),
    p(`${l.p6} ${b(joinDateOrDescription(context.start_date, context.start_date_description))}`),
    salaryAndWorkSections(context),
    center("VI. Otkaz ugovora o radu"),
    p("1. Ovaj Ugovor mogu redovito otkazati i Poslodavac i Radnik pod uvjetima propisanim zakonom."),
    p(`2. U slučaju kad Poslodavac redovito otkazuje, otkazni rok iznosi ${b(context.contract_termination_employer)} dana, a su slučaju kad redovito otokazuje Radnik, otkazni rok je ${b(context.contract_termination_employee)} dana.`),
    closingSections(context, l.salaryCopies),
    signatureHtml(context)
  ]);
}

function buildPartTimeContractExact(context) {
  const l = labels.part_time;
  return makeContractDocument(l.title, [
    p(`${l.l1} ${b(`${context.employer.company_name || ""}, ${context.employerInfo}`)}, ${l.l2} ${b(context.director)}, ${l.l3} ${b(`${context.employeeName}, OIB/Putovnica: ${context.employeePersonalId}`)} ${l.l4} ${b(context.contract_date)} ${l.l5}`),
    centerTitle(l.title),
    center(l.s1),
    p(l.p1),
    p(`${l.p2} ${b(joinDateOrDescription(context.end_job_date, context.end_job_description))} ${l.p2b}`),
    center(b(context.job_description)),
    p(`${l.p3} ${b(`${context.trail_numbers} ${context.trail_option}`)}`),
    p(`${l.p4} ${b(context.working_place)}${l.p4b}`),
    p(l.p5),
    p(`${l.p6} ${b(joinDateOrDescription(context.start_date, context.start_date_description))}.`),
    salaryAndWorkSections(context),
    center("VI. Otkaz ugovora o radu"),
    p(`1. Ovaj Ugovor ${b(context.contract_termination)} redovito otkazati i Poslodavac i Radnik pod uvjetima propisanim zakonom, i prije isteka vremena na  koji je  sklopljen.`),
    p(`2. U slučaju kad Poslodavac redovito otkazuje, otkazni rok iznosi ${b(context.contract_termination_employer)} dana, a su slučaju kad redovito otokazuje Radnik, otkazni rok je ${b(context.contract_termination_employee)} dana.`),
    closingSections(context, l.salaryCopies),
    signatureHtml(context)
  ]);
}

// --- Annex builders ---

function annexChangeParagraph(index, reference, text) {
  return [
    p(`${index}. Odredba ${b(reference)} osnovnog Ugovora o radu mijenja se i sada glasi:`),
    p(`"${text}"`)
  ].join("");
}

function annexEmploymentBasisText(data) {
  const jobText = data.annex_change_job
    ? `za obavljanje poslova ${b(data.annex_job_description || "POSAO - OPIS POSLA")}`
    : "za obavljanje poslova utvrđenih osnovnim Ugovorom o radu";
  const contractType = data.annex_change_duration
    ? data.annex_new_contract_type
    : data.annex_base_contract_type;
  if (contractType === "fixed") {
    const endText = data.annex_change_duration
      ? `do ${b(formatDate(data.annex_new_end_date))}`
      : "do isteka vremena utvrđenog osnovnim Ugovorom o radu";
    return `Ovim Ugovorom Radnik zasniva radni odnos na određeno vrijeme ${endText} ${jobText}.`;
  }
  return `Ovim Ugovorom Radnik zasniva radni odnos na neodređeno vrijeme ${jobText}.`;
}

function annexSalaryText(data) {
  return [
    `Za realizaciju preuzetih obveza iz točke I.2. Radniku pripada osnovna bruto plaća u iznosu od ${b(normalizeMoney(data.annex_salary))} eura.`,
    `Uz osnovnu plaću Radniku pripada stimulativni dio plaće u iznosu od ${b(normalizeMoney(data.annex_salary_bonus))} eura bruto mjesečno.`,
    `Radnik ima pravo na povećanu plaću za otežane uvjete rada ${b(data.annex_salary_increment_1)}, rad u dane blagdana i neradne dane utvrđene zakonom i za rad na dan Uskrsa ${b(data.annex_salary_increment_2)}, rad nedjeljom ${b(data.annex_salary_increment_3)}, noćni rad ${b(data.annex_salary_increment_4)}, prekovremeni rad ${b(data.annex_salary_increment_5)} te za rad u drugoj smjeni u slučaju stalnog smjenskog rada ${b(data.annex_salary_increment_6)}.`
  ].join(" ");
}

function standardAnnexChanges(data) {
  const changes = [];
  if (data.annex_change_duration || data.annex_change_job) {
    changes.push({ reference: "članka I. točke 2.", text: annexEmploymentBasisText(data) });
  }
  if (data.annex_change_probation) {
    changes.push({ reference: "članka I. točke 3.", text: `Ugovorne stranke ugovaraju probni rad Radnika u trajanju od ${b(data.annex_probation_period)}.` });
  }
  if (data.annex_change_work_place) {
    changes.push({ reference: "članka I. točke 4.", text: `Mjesto rada Radnika je u ${b(data.annex_working_place)}, a u slučaju potrebe Poslodavca i u nekom drugom mjestu na području Republike Hrvatske.` });
  }
  if (data.annex_change_start_date) {
    changes.push({ reference: "članka I. točke 6.", text: `Radnik počinje s radom ${b(formatDate(data.annex_start_date))}.` });
  }
  if (data.annex_change_salary) {
    changes.push({ reference: "članka II. točaka 1., 3. i 4.", text: annexSalaryText(data) });
  }
  if (data.annex_change_work_time) {
    changes.push({ reference: "članka IV. točaka 1. i 2.", text: `Radnik će raditi ${b(data.annex_work_type)} radno vrijeme od ${b(data.annex_weekly_hours)} sati tjedno. Radno vrijeme određuje se ${b(data.annex_working_shift_description)}.` });
  }
  if (data.annex_change_weekly_rest) {
    changes.push({ reference: "članka IV. točke 4.", text: `Tjedni odmor Radnik će koristiti ${b(data.annex_weekly_time_off)}.` });
  }
  if (data.annex_change_vacation) {
    changes.push({ reference: "članka IV. točke 5.", text: `Radnik ima pravo na godišnji odmor u trajanju od ${b(vacationDaysText(data.annex_vacation, data.annex_vacation_description))}.` });
  }
  if (data.annex_change_notice) {
    changes.push({ reference: "članka VI. točke 2.", text: `U slučaju kad Poslodavac redovito otkazuje Ugovor o radu, otkazni rok iznosi ${b(`${data.annex_notice_employer} dana`)}, a u slučaju kad redovito otkazuje Radnik, otkazni rok iznosi ${b(`${data.annex_notice_employee} dana`)}.` });
  }
  if (data.annex_change_rights) {
    changes.push({ reference: "članka VII.", text: `${b(data.annex_rights_and_obligations)}.` });
  }
  linesToListItems(data.annex_other_changes).forEach((item) => {
    changes.push({ reference: "dodatnih odredbi osnovnog Ugovora o radu", text: safeMultiline(item) });
  });
  return changes;
}

function buildStandardAnnex(context) {
  const d = formToObject($("#documentForm"));
  const changes = standardAnnexChanges(d);
  const baseType = d.annex_base_contract_type === "fixed" ? "određeno vrijeme" : "neodređeno vrijeme";
  return makeContractDocument("ANEKS UGOVORA O RADU", [
    p(`${b(context.employer.company_name || "")}, ${b(context.employerInfo)}, zastupano po ${b(context.director)} (u daljnjem tekstu: Poslodavac) i`),
    p(`${b(context.employeeName)}, OIB/Putovnica: ${b(context.employeePersonalId)} (u daljnjem tekstu: Radnik), zaključili su sljedeći:`),
    centerTitle("ANEKS UGOVORA O RADU"),
    center("Članak I."),
    p(`Ugovorne strane suglasno utvrđuju da su dana ${b(formatDate(d.annex_contract_date))} sklopile Ugovor o radu na ${b(baseType)}.`),
    p("Ovim Aneksom ugovorne strane mijenjaju i dopunjuju pojedine odredbe osnovnog Ugovora o radu, kako je navedeno u nastavku."),
    center("Članak II."),
    changes.length
      ? changes.map((change, index) => annexChangeParagraph(index + 1, change.reference, change.text)).join("")
      : p("Ugovorne strane ovim Aneksom uređuju izmjene i dopune osnovnog Ugovora o radu prema međusobnom dogovoru."),
    center("Članak III."),
    p("Sve ostale odredbe osnovnog Ugovora o radu koje nisu izričito izmijenjene ovim Aneksom ostaju nepromijenjene i u cijelosti na snazi."),
    p(`Ovaj Aneks stupa na snagu dana ${b(formatDate(d.annex_effective_date))}`),
    center("Članak IV."),
    p(`Za slučaj spora ugovara se nadležnost stvarno nadležnog suda u ${b(`${d.annex_court}.`)}`),
    p("Ovaj Aneks sastavljen je u dva istovjetna primjerka, od kojih svaka ugovorna strana zadržava po jedan primjerak."),
    p(`U ${b(d.annex_signature_place)}, dana ${b(formatDate(d.annex_signature_date))} godine.`),
    signatureHtml(context)
  ]);
}

function buildAnnexA1Exact(context) {
  const d = formToObject($("#documentForm"));
  return makeContractDocument("ANEKS UGOVORA O RADU", [
    p(`${b(context.employer.company_name || "")} , zastupano po direktoru ${b(context.director)} (u daljnjem tekstu: Poslodavac) i`),
    p(`${b(context.employeeName)}, OIB/Putovnica: ${b(context.employeePersonalId)}, (u daljnjem tekstu: radnik), zaključili su sljedeći:`),
    centerTitle("ANEKS UGOVORA O RADU"),
    center("Članak I."),
    p("1. Ugovorne strane suglasno utvrđuju da ovim Aneksom ugovaraju prava i obveze za vrijeme trajanja rada u inozemstvu."),
    center("Članak II."),
    p(`1. Ugovorne strane suglasno utvrđuju da su dana ${b(formatDate(d.a1_contract_date))} sklopile Ugovor o radu na ${b(`${d.a1_contract_type}.`)}`),
    p(`2. Predviđeno trajanje radnika u inozemstvu biti će do ${b(formatDate(d.a1_end_date))}, odnosno do završetka projekta/radova.`),
    p("3. Nakon završetka razdoblja iz članka 2. stavak 2. poslodavac će osigurati radniku povratak u Hrvatsku."),
    center("Članak III."),
    p(`1. Mjesto rada radnika biti će  u pravilu u ${b(d.a1_working_place)}, ali je suglasan da po i sukladno te potrebama poslodavca poslove obavlja i na drugim mjestima na čitavom teritoriju Europske unije kao i da putuje u inozemstvo radi izvršavanja povjerenih mu poslova.`),
    center("Članak IV."),
    p("1. Radnik će obavljati poslove koji s obzirom na organizaciju rada, interna pravila, upute korisnika, poslovna pravila i standarde struke u skladu s naravi i vrstom posla za koje je zasnovan radni odnos, kao sve poslove koji mu je privremeno ili trajno, povjeri naručitelj ili koji mu u ime naručitelja naloži radnik naručitelja."),
    p(`2. Radnik će obavljati poslove ${b(d.a1_job_description)}, ali je dužan obavljati i sve ostale poslove koji su s obzirom na organizaciju rada, interna pravila, upute korisnika, poslovna pravila i standarde struke u skladu s naravi iv vrstom posla za koje je zasnovan radni odnos, kao sve poslove koji mu privremeno ili trajno povjeri naručitelj ili kojih mu u ime naručitelja naloži nadređeni radnik naručitelja.`),
    center("Članak V."),
    p("1. Radnik je za vrijeme trajanja rada u državi izaslanja dužan poštivati propise, običaje i okruženje države u koju je izaslan."),
    p("2. Radnik potpisom ovog aneksa potvrđujem da je upoznat s radnom, uvjetima rada, pravima i obvezama radnika u državi izaslanja."),
    center("Članak VI."),
    p("1. Radnik će raditi u punom radnom vremenu u trajanju od 40 sati tjedno, a koje je raspoređeno u pravilu od ponedjeljka do petak/subote te se prilagođava organizaciji rada na radilištu."),
    p("2.Pravo na stanku određuje se u trajanju od 30 minuta te će se korištenjem iste prilagoditi organizaciji i potrebama rada na radilištu."),
    center("Članak VII."),
    p("1. Za vrijeme trajanja rada u inozemstvu te na području gdje će radnik obavljati rad, neradni dani i blagdani su NERADNI."),
    center("Članak VIII."),
    p("1. Za obavljeni rad za vrijeme trajanja izaslanja poslodavac će isplaćivati radniku mjesečnu plaću u kunama koja se sastoji od bruto plaće sukladno Ugovoru o radu te će se mjesečna osnovica za plaćanje doprinosa uvećati za 20% i ostala primanja u novcu i naravi na koja radnik ima pravo za vrijeme rada u inozemstvu (ili minimalne stanice/plaće koja se isplaćuje sukladno zakonodavstvu države u kojoj radnik obavlja rad)."),
    center("Članak IX."),
    p("1. U slučaju da se za vrijeme trajanja ovog aneksa radnik privremeno ne obavlja rad u državi izaslanja te se vrati u RH, istom za to vrijeme pripada samo bruto plaća iz Ugovora o radu."),
    p("2. U slučaju da radnik, iz bolo kojeg razloga, trajno ne obavlja rad u državi izaslanja te se vrati u RH smatra se da ovaj aneks prestaje vrijediti s danom prestanka rada u državi u koju je izaslan."),
    center("Članak X."),
    p("1. Ugovorne strane suglasno utvrđuju da će sve izmjene i dopune ovog ugovora sastaviti u pisanom obliku."),
    center("Članak XI."),
    p(`1. Ugovorne strane suglasne su da će sve eventualne sporove glede odredbi ovog ugovora riješiti sporazumno, a ukoliko to nije moguće ugovaraju nadležnost Općinskog suda u ${b(`${d.a1_court}.`)}`),
    center("Članak XII."),
    p("1. Ovaj ugovor sastavljen je u dva istovjetna primjerka od kojih svaka ugovorna strana zadržava po jedan primjerak"),
    center("Članak XIII."),
    p("1. Strane su suglasne da je u odredbama ovog ugovora sadržana njihova stvarna bolja, očitovana slobodno i ozbiljno, te ga u znak prihvata prava i obveza koje iz njega proizlaze vlastoručno potpisuju."),
    p(`U ${b(d.a1_signature_place)} , dana ${b(formatDate(d.a1_signature_date))} godine.`),
    signatureHtml(context)
  ]);
}

// --- ERV ---

export function buildErvDocument(context) {
  const d = formToObject($("#documentForm"));
  const year = Number(d.erv_year);
  const month = Number(d.erv_month);
  const days = daysInMonth(year, month);
  const holidays = croatianNonWorkingDays(year).filter((item) => item.month === month);
  const holidayByDay = new Map(holidays.map((item) => [item.day, item.name]));
  const headers = ervColumns.map((column) => `<th title="${escapeHtml(column === "Datum" ? "Datum" : ervColumnDescriptions[column] || "")}">${escapeHtml(column)}</th>`).join("");
  const rows = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month - 1, day);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const holiday = holidayByDay.get(day);
    const values = {
      Datum: `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}.`,
      Dut: dayNamesHr[date.getDay()],
      "B-DP": holiday || (weekend ? "Vikend" : "")
    };
    const isNonWorking = Boolean(values["B-DP"]);
    return `<tr>${ervColumns.map((column) => {
      const blockCell = isNonWorking && !["Datum", "Dut", "B-DP"].includes(column);
      return `<td class="${blockCell ? "blocked-cell" : ""}">${escapeHtml(values[column] || "")}</td>`;
    }).join("")}</tr>`;
  }).join("");
  const explanation = Object.entries(ervColumnDescriptions).map(([key, value]) => `${key} - ${value}`).join("; ");
  const html = `
    ${centerTitle("EVIDENCIJA O RADNOM VREMENU")}
    ${p(`Poslodavac: ${b(`${context.employer.company_name || ""}, ${context.employerInfo}`)}`)}
    ${p(`Radnik: ${b(`${context.employeeName}, OIB/Putovnica: ${context.employeePersonalId}`)}`)}
    ${p(`ZA RAZDOBLJE OD ${b(`01.${String(month).padStart(2, "0")}.${year}.`)} DO ${b(`${days}.${String(month).padStart(2, "0")}.${year}.`)}`)}
    ${p(`Hrvatski neradni dani: ${b(holidays.length ? holidays.map((item) => `${String(item.day).padStart(2, "0")}.${String(item.month).padStart(2, "0")}. - ${item.name}`).join("; ") : "nema u odabranom mjesecu")}`)}
    <table class="erv-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
    ${p("Za točnost i istinitost podataka iz ovog izvješća zaposlenik jamči potpisom pod punom kaznenom i materijalnom odgovornošću.")}
    ${p(`Datum podnošenja izvješća: ____________________`)}
    <p class="erv-acronyms"><strong>Akronimi:</strong> ${escapeHtml(explanation)}</p>
    ${signatureHtml(context)}
  `;
  return { title: "EVIDENCIJA O RADNOM VREMENU", html, body: htmlToText(html) };
}

// --- Accounting services ---

function buildAccountingServicesDocument(data) {
  const client = state.employers.find((item) => item.id === data.services_client_id) || {};
  const accounting = state.accounting.find((item) => item.id === data.services_accounting_id) || {};
  const clientEmail = data.services_client_email || client.email || "";
  const accountingEmail = data.services_accounting_email || accounting.email || "";
  const serviceItems = linesToListItems(data.services_scope);
  const excludedItems = linesToListItems(data.services_excluded);
  const clientAddress = formatAddress(client);
  const accountingAddress = formatAddress(accounting);
  const monthlyFee = feeWithVatStatus(data.services_monthly_fee, data.services_vat_status);
  const annualFee = feeWithVatStatus(data.services_annual_fee, data.services_annual_vat_status);
  const durationText = data.services_duration_type === "određeno vrijeme"
    ? `određeno vrijeme do ${formatDate(data.services_end_date)}`
    : "neodređeno vrijeme";
  const copiesText = `${data.services_copies} (${numberWordHr(data.services_copies)}) istovjetna primjerka`;

  const html = `
    ${centerTitle("UGOVOR O OBAVLJANJU KNJIGOVODSTVENIH I RAČUNOVODSTVENIH USLUGA")}
    ${p(`sklopljen dana ${b(formatDate(data.services_contract_date))} u ${b(data.services_contract_place)}`)}
    ${center("1. UGOVORNE STRANE")}
    ${center("Naručitelj (Klijent)")}
    ${p(`${b(client.company_name || "")}<br>Sjedište: ${b(clientAddress)}<br>OIB: ${b(client.vat || "")}<br>zastupa: ${b(client.director || "")}<br>(u daljnjem tekstu: ${b("Klijent")})`)}
    ${center("Izvršitelj (Knjigovodstveni ured)")}
    ${p(`${b(accounting.company_name || "")}<br>Sjedište: ${b(accountingAddress)}<br>OIB: ${b(accounting.vat || "")}<br>zastupa: ${b(accounting.director || "")}<br>(u daljnjem tekstu: ${b("Knjigovodstveni ured")})`)}
    ${p(`zajednički dalje u tekstu: ${b("Ugovorne strane")}.`)}
    ${center("Članak 1.")}
    ${center("Predmet ugovora")}
    ${p("Ovim Ugovorom uređuju se međusobna prava i obveze Ugovornih strana vezano uz pružanje knjigovodstvenih, računovodstvenih, poreznih i administrativnih usluga koje Knjigovodstveni ured obavlja za Klijenta.")}
    ${p("Knjigovodstveni ured obvezuje se za Klijenta obavljati osobito sljedeće usluge:")}
    ${ul(serviceItems)}
    ${p("Opseg usluga može se dodatno definirati posebnim prilogom ili ponudom koja čini sastavni dio ovog Ugovora.")}
    ${center("Članak 2.")}
    ${center("Obveze Knjigovodstvenog ureda")}
    ${ol([
      "obavljati ugovorene usluge stručno, savjesno i u skladu s važećim propisima Republike Hrvatske",
      "pravodobno voditi poslovne evidencije temeljem dostavljene dokumentacije",
      "čuvati poslovnu tajnu i povjerljivost svih podataka Klijenta",
      "upozoriti Klijenta na moguće nepravilnosti ili zakonske obveze",
      "čuvati dokumentaciju i elektroničke podatke u skladu sa zakonskim rokovima",
      "omogućiti Klijentu uvid u poslovne evidencije na njegov zahtjev",
      "koristiti digitalne alate i sustave za sigurnu razmjenu dokumentacije kada je to moguće"
    ])}
    ${p("Knjigovodstveni ured ne odgovara za posljedice koje proizlaze iz netočne, nepotpune ili zakašnjele dokumentacije dostavljene od strane Klijenta.")}
    ${center("Članak 3.")}
    ${center("Obveze Klijenta")}
    ${ol([
      "dostavljati potpunu, točnu i vjerodostojnu dokumentaciju",
      `dokumentaciju dostavljati najkasnije do ${b(`${data.services_document_delivery_day}. dana u mjesecu`)} za prethodni mjesec`,
      "pravodobno obavještavati Knjigovodstveni ured o svim promjenama bitnim za poslovanje",
      "osigurati pristup potrebnim informacijama i poslovnim evidencijama",
      "čuvati originale dokumentacije ako se ista dostavlja elektroničkim putem",
      "podmirivati ugovorenu naknadu u rokovima definiranima ovim Ugovorom"
    ])}
    ${p("Klijent snosi odgovornost za zakonitost poslovnih događaja i vjerodostojnost dostavljene dokumentacije.")}
    ${center("Članak 4.")}
    ${center("Način dostave dokumentacije")}
    ${p("Dokumentacija se može dostavljati osobno, putem elektroničke pošte, putem cloud servisa, putem računovodstvenih aplikacija ili putem integriranih digitalnih sustava. Elektronički dostavljena dokumentacija smatra se vjerodostojnom osim ako postoji osnovana sumnja u njezinu ispravnost.")}
    ${center("Članak 5.")}
    ${center("Naknada za usluge")}
    ${p(`Klijent se obvezuje za ugovorene usluge plaćati mjesečnu naknadu u iznosu od ${b(monthlyFee)}.`)}
    ${p(`Izrada završnog računa, godišnjih financijskih izvještaja, prijave poreza na dobit/dohodak i pripadajućih godišnjih obrazaca naplaćuje se posebno u iznosu od ${b(annualFee)}, osim ako Ugovorne strane pisanim putem ne ugovore drugačije.`)}
    ${p("U cijenu nisu uključene:")}
    ${ul(excludedItems)}
    ${p("Dodatne usluge obračunavaju se prema važećem cjeniku Knjigovodstvenog ureda. Naknada se može korigirati u slučaju značajnog povećanja opsega dokumentacije, povećanja broja zaposlenih, promjene zakonskih obveza ili promjene poslovnog modela Klijenta.")}
    ${center("Članak 6.")}
    ${center("Rok i način plaćanja")}
    ${p(`Knjigovodstveni ured izdaje račun jednom mjesečno. Klijent se obvezuje račun podmiriti u roku od ${b(`${data.services_payment_due_days} dana od dana izdavanja računa`)}. Plaćanje se vrši na poslovni račun Knjigovodstvenog ureda naveden na računu.`)}
    ${p("U slučaju kašnjenja plaćanja, Knjigovodstveni ured ima pravo obračunati zakonske zatezne kamate te privremeno obustaviti pružanje usluga do podmirenja dospjelih obveza.")}
    ${center("Članak 7.")}
    ${center("Povjerljivost i zaštita podataka")}
    ${p("Ugovorne strane obvezuju se čuvati sve poslovne, financijske i osobne podatke kao povjerljive. Knjigovodstveni ured obvezuje se postupati u skladu s GDPR uredbom, Zakonom o računovodstvu, Zakonom o provedbi Opće uredbe o zaštiti podataka te propisima o sprječavanju pranja novca i financiranja terorizma.")}
    ${center("Članak 8.")}
    ${center("Odgovornost")}
    ${p("Knjigovodstveni ured odgovara isključivo za štetu nastalu namjernim postupanjem ili grubom nepažnjom. Knjigovodstveni ured ne odgovara za posljedice zakašnjele dostave dokumentacije, netočne podatke dostavljene od strane Klijenta, odluke poslovodstva Klijenta ni privremene nedostupnosti državnih sustava.")}
    ${center("Članak 9.")}
    ${center("Trajanje ugovora")}
    ${p(`Ovaj Ugovor sklapa se na ${b(durationText)} i stupa na snagu danom potpisa obiju Ugovornih strana.`)}
    ${center("Članak 10.")}
    ${center("Otkaz ugovora")}
    ${p(`Svaka Ugovorna strana može otkazati ovaj Ugovor uz ${b(`otkazni rok od ${data.services_notice_period_days} dana`)}. Otkaz mora biti dostavljen u pisanom obliku putem e-maila ili preporučenom poštom. U slučaju grubog kršenja ugovornih obveza, Ugovor se može raskinuti odmah.`)}
    ${center("Članak 11.")}
    ${center("Elektronička komunikacija")}
    ${p(`Ugovorne strane suglasne su da se komunikacija i razmjena dokumentacije mogu obavljati elektroničkim putem. E-mail komunikacija smatra se službenom poslovnom komunikacijom.`)}
    ${p(`Službene e-mail adrese:<br>Klijent: ${b(clientEmail)}<br>Knjigovodstveni ured: ${b(accountingEmail)}`)}
    ${center("Članak 12.")}
    ${center("Završne odredbe")}
    ${p(`Sve izmjene i dopune ovog Ugovora valjane su isključivo ako su sastavljene u pisanom obliku. Na ovaj Ugovor primjenjuje se pravo Republike Hrvatske. U slučaju spora, nadležan je stvarno nadležni sud u ${b(`${data.services_court}.`)}`)}
    ${center("Članak 13.")}
    ${center("Broj primjeraka")}
    ${p(`Ovaj Ugovor sastavljen je u ${b(copiesText)}, od kojih svaka Ugovorna strana zadržava po jedan primjerak.`)}
    ${serviceSignatureHtml(client, accounting)}
  `;
  return { title: "UGOVOR O KNJIGOVODSTVENO-RAČUNOVODSTVENIM USLUGAMA", html, body: htmlToText(html) };
}

// --- Template documents ---

function buildBusinessCooperationDocument(data) {
  const executor = resolveParty("pa", data);
  const client = resolveParty("pb", data);
  const html = `
    ${partyIntroFull(executor, "Izvršitelj")}
    ${center("I")}
    ${partyIntroFull(client, "Naručitelj")}
    ${p(`sklopili su dana ${b(formatDate(data.template_document_date))} godine u ${b(data.template_document_place)} sljedeći`)}
    ${centerTitle("UGOVOR O POSLOVNOJ SURADNJI")}
    ${center("Članak 1.")}
    ${p("Ugovorne strane suglasne su da sklapanje ovog Ugovora ima za cilj ostvarenje međusobnih poslovnih i ekonomskih interesa te utvrđivanje međusobnih prava i obveza.")}
    ${center("Članak 2.")}
    ${p(`Izvršitelj se obvezuje izvršiti ${b(data.business_work_description)}, kao i druge povezane radove naručene od strane Naručitelja, a Naručitelj se obvezuje podmiriti zaračunate naknade Izvršitelju.`)}
    ${center("Članak 3.")}
    ${p("Izvršitelj je dužan izvršiti ugovorene poslove stručno, savjesno i u skladu s primjenjivim propisima, pravilima struke i dogovorenim rokovima. Izvršitelj odgovara Naručitelju za štetu nastalu povredom ovog Ugovora, kašnjenjem, neizvođenjem ugovorenih radova ili nepridržavanjem primjenjivih propisa i standarda.")}
    ${center("Članak 4.")}
    ${p(`Za radove iz članka 2. ovog Ugovora ugovara se ${b(data.business_price)}.`)}
    ${p(`Naručitelj će plaćanje izvršiti na račun Izvršitelja IBAN: ${b(data.business_iban)}. Izvršitelj izdaje račun s rokom dospijeća 14 dana, osim ako ugovorne strane pisanim putem ne ugovore drugačije.`)}
    ${center("Članak 5.")}
    ${p("Ugovorne strane obvezuju se čuvati kao poslovnu tajnu sve podatke i dokumentaciju koje koriste ili saznaju radi izvršenja ovog Ugovora.")}
    ${center("Članak 6.")}
    ${p(`Ovaj Ugovor sklapa se na određeno vrijeme do ${b(formatDate(data.business_end_date))}.`)}
    ${center("Članak 7.")}
    ${p("Ugovorne strane suglasne su da će eventualne sporove rješavati mirnim putem i sporazumno, a ako to nije moguće, ugovara se nadležnost stvarno nadležnog suda.")}
    ${center("Članak 8.")}
    ${p("Ovaj Ugovor sastavljen je u četiri istovjetna primjerka. Svaka ugovorna strana zadržava po dva primjerka.")}
    ${p(`U ${b(data.template_document_place)}, dana ${b(formatDate(data.template_document_date))} godine.`)}
    ${twoPartySignature("Izvršitelj", executor.name, "Naručitelj", client.name)}
  `;
  return { title: "UGOVOR O POSLOVNOJ SURADNJI", html, body: htmlToText(html) };
}

function buildVehiclePowerOfAttorneyDocument(data) {
  const owner = resolveParty("pa", data);
  const agent = resolveParty("pb", data);
  const ownerLine = owner.isCompany
    ? `Kojom tvrtka ${b(owner.name)}, adresa: ${b(owner.address)}, OIB: ${b(owner.oib)}, zastupana po ${b(owner.director)}, kao opunomoćitelj i vlasnik vozila ${b(data.vehicle_description)}, broj šasije: ${b(data.vehicle_vin)}, registarske oznake ${b(data.vehicle_plate)} (u daljnjem tekstu: vozilo)`
    : `Kojom ja ${b(owner.name)}, adresa: ${b(owner.address)}, OIB: ${b(owner.oib)}, broj osobne iskaznice: ${b(data.pa_id_card || "")}, kao opunomoćitelj i vlasnik vozila ${b(data.vehicle_description)}, broj šasije: ${b(data.vehicle_vin)}, registarske oznake ${b(data.vehicle_plate)} (u daljnjem tekstu: vozilo)`;
  const html = `
    ${centerTitle("PUNOMOĆ")}
    ${p(ownerLine)}
    ${center("OVLAŠĆUJEM")}
    ${p(`kao opunomoćenika ${b(agent.name)}, adresa: ${b(agent.address)}, OIB: ${b(agent.oib)}, broj osobne iskaznice: ${b(data.pb_id_card || "")}, da u moje ime i bez moje nazočnosti:`)}
    ${ul([
      "upravljati i koristiti vozilo u Hrvatskoj i inozemstvu, uključujući područja unutar i izvan Europske unije",
      "vozilo prodati, sklopiti, potpisati i ovjeriti valjane kupoprodajne ugovore radi prijenosa vlasništva vozila na novog vlasnika",
      "odjaviti vozilo i predati registracijske tablice vozila nadležnoj instituciji",
      "promijeniti registracijske tablice i prometnu dozvolu bez obzira na razlog izmjene",
      "obaviti tehnički pregled i registraciju vozila",
      "naplatiti eventualnu nastalu štetu od osiguravajućeg društva ili fizičke osobe"
    ])}
    ${p(`Ova punomoć vrijedi do ${b(formatDate(data.vehicle_valid_until))}.`)}
    ${p(`U ${b(data.template_document_place)}, ${b(formatDate(data.template_document_date))}.`)}
    ${singleSignature(owner.name)}
  `;
  return { title: "PUNOMOĆ ZA VOZILO", html, body: htmlToText(html) };
}

function buildWorkOrderDocument(data) {
  const issuer = resolveParty("pa", data);
  const client = resolveParty("pb", data);
  const html = `
    ${centerTitle("RADNI NALOG")}
    ${p(`Narudžbenica broj: ${b(data.work_order_request_number || "")}`)}
    ${p(`Radni nalog br. ${b(data.work_order_number || "")}`)}
    ${p(`Datum: ${b(formatDate(data.template_document_date))}`)}
    ${p(`Ispostavio: ${b(issuer.name)}`)}
    ${p(`Naručitelj: ${b(client.name)}`)}
    ${p(`Mjesto troška: ${b(data.work_order_cost_place || "")}`)}
    ${p(`Nositelj troška: ${b(data.work_order_cost_owner || "")}`)}
    ${center("Opis rada")}
    ${p(safeMultiline(data.work_order_description || ""))}
    ${twoPartySignature("Ispostavio", issuer.name, "Naručitelj", client.name)}
  `;
  return { title: "RADNI NALOG", html, body: htmlToText(html) };
}

function buildVirtualAddressLeaseDocument(data) {
  const landlord = resolveParty("pa", data);
  const tenant = resolveParty("pb", data);
  const html = `
    ${partyIntroFull(landlord, "Zakupodavac")}
    ${center("I")}
    ${partyIntroFull(tenant, "Zakupnik")}
    ${p(`sklopili su dana ${b(formatDate(data.template_document_date))} godine u ${b(data.template_document_place)} sljedeći`)}
    ${centerTitle("UGOVOR O NAJMU VIRTUALNE ADRESE")}
    ${center("Članak 1.")}
    ${p(`Predmet ovog Ugovora je najam poslovne adrese nekretnine ${b(data.lease_cadastral)}, na adresi ${b(data.lease_address)}.`)}
    ${p("Zakupnik će predmet najma koristiti isključivo kao adresu svojeg sjedišta, za registraciju sjedišta u nadležnim registrima i za primanje pošte. Zakupniku se ustupa na korištenje poštanski sandučić Zakupodavca, bez prava posjeda poslovnog prostora.")}
    ${p(`Zakupodavac ovlašćuje Zakupnika da na temelju ovog Ugovora registrira svoje sjedište na adresi ${b(data.lease_address)}.`)}
    ${center("Članak 2.")}
    ${p(`Ovaj Ugovor stupa na snagu dana ${b(formatDate(data.lease_start_date))} i sklapa se na određeno vrijeme do ${b(formatDate(data.lease_end_date))}. Nakon isteka Ugovora može se produžiti isključivo pisanim sporazumom ugovornih strana.`)}
    ${center("Članak 3.")}
    ${p(`Ugovorne strane ugovaraju mjesečnu zakupninu u iznosu od ${b(`${normalizeMoney(data.lease_fee)} EUR`)}, koju se Zakupnik obvezuje plaćati unaprijed najkasnije do 15-og u mjesecu za tekući mjesec na račun Zakupodavca IBAN: ${b(data.lease_iban)}.`)}
    ${center("Članak 4.")}
    ${p("Zakupodavac ima pravo otkazati ovaj Ugovor ako Zakupnik krši odredbe Ugovora, osobito ako ne plati dospjelu zakupninu u roku od pet dana od opomene. Otkazni rok iznosi jedan mjesec i teče od dana primitka izjave o otkazu.")}
    ${center("Članak 5.")}
    ${p(`Ugovorne strane suglasno utvrđuju da će se pisana komunikacija dostavljati na e-mail adrese zakupodavca i zakupnika. E-mail zakupnika: ${b(data.lease_tenant_email)}. Dostava pristigle pošte skeniranim putem na e-mail smatra se urednom.`)}
    ${center("Članak 6.")}
    ${p("Zakupnik je dužan sam podnijeti prijavu i odjavu adrese sjedišta. U slučaju prestanka ovog Ugovora Zakupnik je dužan odjaviti adresu u roku od 30 dana, u protivnom odgovara Zakupodavcu za svu nastalu štetu.")}
    ${center("Članak 7.")}
    ${p("Izmjene i dopune ovog Ugovora valjane su samo ako su sastavljene u pisanom obliku.")}
    ${center("Članak 8.")}
    ${p("Za rješavanje sporova ugovara se nadležnost stvarno nadležnog suda u Vukovaru.")}
    ${center("Članak 9.")}
    ${p("Ugovor je sastavljen u tri istovjetna primjerka, od kojih Zakupodavac zadržava dva primjerka, a Zakupnik jedan primjerak.")}
    ${p(`U ${b(data.template_document_place)}, dana ${b(formatDate(data.template_document_date))} godine.`)}
    ${twoPartySignature("Zakupodavac", landlord.name, "Zakupnik", tenant.name)}
  `;
  return { title: "UGOVOR O NAJMU VIRTUALNE ADRESE", html, body: htmlToText(html) };
}

function buildTemplateDocument(data) {
  const builders = {
    business_cooperation: buildBusinessCooperationDocument,
    vehicle_power_of_attorney: buildVehiclePowerOfAttorneyDocument,
    work_order: buildWorkOrderDocument,
    virtual_address_lease: buildVirtualAddressLeaseDocument
  };
  return builders[data.type]?.(data) || buildBlankDocument(data.type);
}

// --- Employment documents ---

function employmentDocumentContext(data, employer, employee) {
  const employeeName = `${employee.name || ""} ${employee.lastname || ""}`.trim();
  const employeeAddress = formatAddress(employee);
  const employerInfo = `${formatAddress(employer)}${employer.vat ? `, OIB: ${employer.vat}` : ""}`;
  return {
    data,
    employer,
    employee,
    employeeName,
    employeeAddress,
    employeeInfo: `${employeeName}${employeeAddress ? `, ${employeeAddress}` : ""}${employee.personal_id ? `, OIB/Putovnica: ${employee.personal_id}` : ""}`,
    employerInfo,
    director: employer.director || "",
    place: data.employment_doc_place || employer.city || "",
    documentDate: formatDate(data.employment_doc_date || data.contract_date),
    contractDate: formatDate(data.employment_contract_date || data.contract_date),
    contractType: data.employment_contract_type || "neodređeno vrijeme",
    jobTitle: data.employment_job_title || data.job_description || "",
    workPlace: data.employment_work_place || data.working_place || "",
    startDate: formatDate(data.employment_start_date || data.start_date),
    endDate: formatDate(data.employment_end_date || data.end_job_date),
    noticePeriod: data.employment_notice_period || `${data.contract_termination_employer || "15"} dana`,
    vacationYear: data.employment_vacation_year || new Date().getFullYear(),
    vacationTotal: data.employment_vacation_total || "0",
    vacationUsed: data.employment_vacation_used || "0",
    vacationRemaining: data.employment_vacation_remaining || "0",
    vacationFrom: formatDate(data.employment_vacation_from),
    vacationTo: formatDate(data.employment_vacation_to),
    paymentAmount: data.employment_payment_amount || "0,00 EUR",
    probationPeriod: data.employment_probation_period || "1 mjesec",
    probationNotice: data.employment_probation_notice || "7 dana",
    employeeAge: data.employment_employee_age || "65",
    pensionYears: data.employment_pension_years || "15",
    reason: data.employment_reason || "",
    violation: data.employment_violation || "",
    changedContractSummary: data.employment_changed_contract_summary || "",
    housingAddress: data.housing_address || "",
    housingDescription: data.housing_description || "soba, kuhinja, kupaonica i sanitarni čvor"
  };
}

function buildEmploymentConfirmation(context) {
  return makeEmploymentDocument(context, [
    employerActIntro(context, "izdaje sljedeću"),
    centerTitle("POTVRDU"),
    center(b(`o sklopljenom Ugovoru o radu na neodređeno vrijeme sa zaposlenikom ${context.employeeName}`)),
    p(`1. Dana ${b(context.contractDate)} sa zaposlenikom ${b(context.employeeInfo)} sklopljen je Ugovor o radu na neodređeno vrijeme za obavljanje poslova ${b(context.jobTitle)}.`),
    p(`2. Zaposlenik počinje s radom kod Poslodavca dana ${b(context.startDate)}.`),
    p("3. Zaposlenik će ugovorene poslove obavljati osobno, prema uputama Poslodavca."),
    p(`4. Zaposlenik će poslove obavljati u ${b(context.workPlace)}, a u slučaju potrebe, po nalogu Poslodavca, privremeno i u drugim mjestima.`),
    p(`5. Ugovoren je probni rad u trajanju od ${b(context.probationPeriod)} i otkazni rok tijekom probnog rada od ${b(context.probationNotice)}.`),
    p(`6. Mjesečna osnovna bruto plaća iznosi ${b(context.paymentAmount)}. Plaća se isplaćuje najkasnije do 15-og u mjesecu za prethodni mjesec.`),
    p(`7. Zaposlenik ima pravo na godišnji odmor u trajanju od ${b(`${context.vacationTotal} dana`)}.`),
    p(`8. Za slučaj spora ugovara se nadležnost stvarno nadležnog suda u ${b(`${context.data.court || "Zagrebu"}.`)}`),
    employerOnlySignature(context)
  ]);
}

function buildMutualTermination(context) {
  return makeEmploymentDocument(context, [
    p(`${employerParty(context)} i ${employeeParty(context)} zaključili su u ${b(context.place)}, dana ${b(context.documentDate)} sljedeći`),
    centerTitle("SPORAZUM O PRESTANKU UGOVORA O RADU"),
    center("Članak 1."),
    p(`Strane ovog Sporazuma utvrđuju da su dana ${b(context.contractDate)} sklopile Ugovor o radu na ${b(context.contractType)} radi obavljanja poslova ${b(context.jobTitle)}.`),
    p(`Ugovorne strane suglasno utvrđuju da Ugovor o radu prestaje dana ${b(context.endDate)}.`),
    center("Članak 2."),
    vacationParagraph(context),
    center("Članak 3."),
    p("Radnik je dužan do dana prestanka radnog odnosa predati sredstva rada, dokumentaciju i drugu imovinu Poslodavca koju je koristio u radu."),
    center("Članak 4."),
    p("Ovaj Sporazum sastavljen je u dva istovjetna primjerka od kojih svaka strana zadržava po jedan primjerak."),
    p(`U ${b(context.place)}, ${b(context.documentDate)} godine.`),
    signatureHtml(context)
  ]);
}

function buildProbationTermination(context) {
  return makeEmployerDecision(context, "ODLUKU", "O OTKAZU UGOVORA O RADU ZBOG NEZADOVOLJAVANJA RADNIKA NA PROBNOM RADU", [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu sklopljen dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}, jer tijekom probnog rada nije zadovoljio očekivanja radnog mjesta.`),
    p(`Radni odnos prestaje istekom otkaznog roka u trajanju od ${b(context.probationNotice)}, koji počinje teći danom dostave ove Odluke.`),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || `Tijekom probnog rada u trajanju od ${context.probationPeriod} utvrđeno je da radnik ne ostvaruje očekivane rezultate i ne zadovoljava zahtjeve radnog mjesta.`))
  ]);
}

function buildWorkObligationWarning(context) {
  return makeEmployerDecision(context, "UPOZORENJE", "NA OBVEZE IZ RADNOG ODNOSA", [
    p(`Radnik ${b(context.employeeInfo)}, zaposlen na temelju Ugovora o radu sklopljenog dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}, upozorava se da je povrijedio obveze iz radnog odnosa.`),
    p(safeMultiline(context.violation)),
    p("U slučaju nastavka povrede radnih obveza radniku prijeti mogućnost otkaza Ugovora o radu zbog skrivljenog ponašanja."),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || "Na temelju raspoložive dokumentacije i saznanja Poslodavca utvrđeno je postojanje opisane povrede obveza iz radnog odnosa."))
  ]);
}

function buildMisconductNotice(context) {
  return makeEmployerDecision(context, "ODLUKU", "O REDOVITOM OTKAZU UGOVORA O RADU ZBOG SKRIVLJENOG PONAŠANJA", [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu na ${b(context.contractType)} sklopljen dana ${b(context.contractDate)} radi obavljanja poslova ${b(context.jobTitle)}, zbog skrivljenog ponašanja.`),
    p(`Radni odnos prestaje istekom otkaznog roka u trajanju od ${b(context.noticePeriod)}, koji počinje teći danom dostave ove Odluke.`),
    vacationParagraph(context),
    center("Obrazloženje"),
    p(safeMultiline(context.violation)),
    p(safeMultiline(context.reason || "Radnik je prethodno upozoren na obveze iz radnog odnosa i mogućnost otkaza u slučaju nastavka povrede tih obveza."))
  ]);
}

function buildPersonalNotice(context) {
  return makeEmployerDecision(context, "ODLUKU", "O REDOVITOM OSOBNO UVJETOVANOM OTKAZU UGOVORA O RADU", [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu na ${b(context.contractType)} sklopljen dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}, zbog osobno uvjetovanih razloga.`),
    p(`Radni odnos prestaje istekom otkaznog roka u trajanju od ${b(context.noticePeriod)}, koji počinje teći danom dostave ove Odluke.`),
    vacationParagraph(context),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || "Zbog trajnih osobina ili sposobnosti radnika isti nije u mogućnosti uredno izvršavati svoje obveze iz radnog odnosa."))
  ]);
}

function buildBusinessNotice(context, definition) {
  return makeEmployerDecision(context, "ODLUKU", `O REDOVITOM POSLOVNO UVJETOVANOM OTKAZU UGOVORA O RADU ZBOG ${definition.businessReason.toUpperCase()}`, [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu na ${b(context.contractType)} sklopljen dana ${b(context.contractDate)} radi obavljanja poslova ${b(context.jobTitle)}, zbog ${b(definition.businessReason)}.`),
    p(`Radni odnos prestaje istekom otkaznog roka u trajanju od ${b(context.noticePeriod)}, koji počinje teći danom dostave ove Odluke.`),
    vacationParagraph(context),
    p(`Radnik ima pravo na otpremninu odnosno drugu pripadajuću isplatu u iznosu od ${b(context.paymentAmount)}, ako su za to ispunjene zakonske pretpostavke.`),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || `Zbog ${definition.businessReason} prestala je potreba za obavljanjem poslova radnika pod uvjetima iz sklopljenog ugovora o radu.`))
  ]);
}

function buildChangedContractOffer(context) {
  return makeEmployerDecision(context, "ODLUKU", "O OTKAZU S PONUDOM IZMIJENJENOG UGOVORA O RADU", [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu sklopljen dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}, uz istodobnu ponudu sklapanja izmijenjenog ugovora o radu.`),
    p(`Ako radnik prihvati ponudu, radni odnos nastavlja se pod uvjetima iz izmijenjenog ugovora. Ako radnik ponudu ne prihvati, radni odnos prestaje istekom otkaznog roka od ${b(context.noticePeriod)}.`),
    p(safeMultiline(context.changedContractSummary)),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || "Zbog promijenjenih potreba organizacije rada potrebno je izmijeniti ugovorene uvjete rada."))
  ]);
}

function buildEmployeeRegularNotice(context) {
  return makeEmploymentDocument(context, [
    p(`${employeeParty(context)} daje Poslodavcu ${b(context.employer.company_name || "")} sljedeći`),
    centerTitle("REDOVITI OTKAZ UGOVORA O RADU"),
    p(`Radnik redovito otkazuje Ugovor o radu sklopljen dana ${b(context.contractDate)} za obavljanje poslova ${b(context.jobTitle)}.`),
    p(`Otkazni rok iznosi ${b(context.noticePeriod)} i počinje teći danom dostave ovog otkaza Poslodavcu.`),
    p(`Radni odnos prestaje dana ${b(context.endDate)}.`),
    p(safeMultiline(context.reason || "Radnik otkazuje ugovor o radu iz osobnih razloga.")),
    employeeOnlySignature(context)
  ]);
}

function buildEmployerExtraordinaryNotice(context) {
  return makeEmployerDecision(context, "ODLUKU", "O IZVANREDNOM OTKAZU UGOVORA O RADU", [
    p(`Radniku ${b(context.employeeInfo)} izvanredno se otkazuje Ugovor o radu sklopljen dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}.`),
    p(`Radni odnos prestaje danom dostave ove Odluke, odnosno dana ${b(context.endDate)}.`),
    center("Obrazloženje"),
    p(safeMultiline(context.violation)),
    p(safeMultiline(context.reason || "Zbog osobito teške povrede obveze iz radnog odnosa nastavak radnog odnosa nije moguć."))
  ]);
}

function buildEmployeeExtraordinaryNotice(context) {
  return makeEmploymentDocument(context, [
    p(`${employeeParty(context)} daje Poslodavcu ${b(context.employer.company_name || "")} sljedeći`),
    centerTitle("IZVANREDNI OTKAZ UGOVORA O RADU"),
    p(`Radnik izvanredno otkazuje Ugovor o radu sklopljen dana ${b(context.contractDate)} za obavljanje poslova ${b(context.jobTitle)}.`),
    p(`Radni odnos prestaje danom dostave ovog otkaza, odnosno dana ${b(context.endDate)}.`),
    center("Obrazloženje"),
    p(safeMultiline(context.reason || "Zbog osobito važne činjenice nastavak radnog odnosa nije moguć.")),
    employeeOnlySignature(context)
  ]);
}

function buildFixedTermExpiryNotice(context) {
  return makeEmploymentDocument(context, [
    employerActIntro(context, "daje sljedeću"),
    centerTitle("OBAVIJEST O PRESTANKU UGOVORA O RADU NA ODREĐENO VRIJEME"),
    p(`Obavještava se radnik ${b(context.employeeInfo)} da Ugovor o radu na određeno vrijeme sklopljen dana ${b(context.contractDate)} za obavljanje poslova ${b(context.jobTitle)} prestaje istekom vremena na koje je sklopljen, dana ${b(context.endDate)}.`),
    vacationParagraph(context),
    p("Radnik je dužan do dana prestanka radnog odnosa vratiti sredstva rada i uredno izvršiti primopredaju poslova."),
    employerOnlySignature(context)
  ]);
}

function buildRetirementNotice(context) {
  return makeEmploymentDocument(context, [
    employerActIntro(context, "daje sljedeću"),
    centerTitle("OBAVIJEST O PRESTANKU UGOVORA O RADU RADI 65 GODINA ŽIVOTA I 15 GODINA MIROVINSKOG STAŽA"),
    p(`Obavještava se radnik ${b(context.employeeInfo)} da mu Ugovor o radu sklopljen dana ${b(context.contractDate)} prestaje dana ${b(context.endDate)} jer radnik ima navršenih ${b(context.employeeAge)} godina života i ${b(context.pensionYears)} godina mirovinskog staža.`),
    vacationParagraph(context),
    p("Radnik je dužan do dana prestanka radnog odnosa izvršiti primopredaju poslova i sredstava rada."),
    employerOnlySignature(context)
  ]);
}

function buildHousingStatement(context) {
  return makeEmploymentDocument(context, [
    centerTitle("IZJAVA O STANOVANJU"),
    p(`Izjavljujem u ime poduzeća ${b(context.employer.company_name || "")}, ${b(context.employerInfo)}, da će budući radnik ${b(context.employeeName)} iz ${b(context.employeeAddress || "-")}, OIB/putovnica ${b(context.employee.personal_id || "-")}, imati odgovarajući smještaj na adresi ${b(context.housingAddress)}.`),
    p(`Smještaj će se sastojati od: ${b(context.housingDescription)}.`),
    p(`U ${b(context.place)}, ${b(context.documentDate)} godine.`),
    employerOnlySignature(context)
  ]);
}

function buildEmploymentDocument(data) {
  const definition = employmentDocumentDefinitions[data.type];
  const employer = state.employers.find((item) => item.id === data.employer_id) || state.employers[0] || {};
  const employee = state.employees.find((item) => item.id === data.employee_id) || state.employees[0] || {};
  const context = employmentDocumentContext(data, employer, employee);
  const builders = {
    confirmation: buildEmploymentConfirmation,
    mutual: buildMutualTermination,
    probation: buildProbationTermination,
    warning: buildWorkObligationWarning,
    misconduct: buildMisconductNotice,
    personal: buildPersonalNotice,
    business: buildBusinessNotice,
    changed: buildChangedContractOffer,
    employee_regular: buildEmployeeRegularNotice,
    employer_extraordinary: buildEmployerExtraordinaryNotice,
    employee_extraordinary: buildEmployeeExtraordinaryNotice,
    fixed_expiry: buildFixedTermExpiryNotice,
    retirement: buildRetirementNotice,
    housing: buildHousingStatement
  };
  const html = builders[definition.category](context, definition);
  const parties = [employer.company_name, `${employee.name || ""} ${employee.lastname || ""}`.trim()].filter(Boolean);
  return { title: definition.title, html, body: htmlToText(html), parties };
}

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
    clone.querySelectorAll("input, select, textarea").forEach((item) => item.remove());
    const text = clone.textContent.replace(/\s+/g, " ").trim();
    if (text) return text;
  }
  const line = control.closest(".contract-line");
  if (line) {
    const parts = Array.from(line.querySelectorAll("span"))
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

export function buildGfiDocument() {
  const data = formToObject($("#gfiForm"));
  return {
    title: "GFI dokument",
    body: [
      "ODLUKA O UTVRDIVANJU GODISNJIH FINANCIJSKIH IZVJESTAJA",
      "",
      `${data.company_name || ""}`,
      `${data.address || ""}, ${data.city || ""}`,
      `OIB: ${data.oib || ""}`,
      "",
      `Na dan ${formatDate(data.report_date)} direktor ${data.director || ""} donosi odluku za poslovnu godinu ${data.report_year || ""}.`,
      "",
      `Dobit prije poreza: ${data.gain_before_tax || "0,00"}`,
      `Porez na dobit: ${data.gain_tax || "0,00"}`,
      `Dobit nakon poreza: ${data.gain_after_tax || "0,00"}`,
      data.loss_coverage ? `Pokriće gubitka: ${data.loss_coverage}` : "Dobit se raspoređuje sukladno odluci članova društva.",
      "",
      "Direktor:",
      "",
      "____________________________",
      `${data.director || ""}`
    ].join("\n")
  };
}
