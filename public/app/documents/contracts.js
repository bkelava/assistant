import { $, labels, ervColumns, ervColumnDescriptions, dayNamesHr } from "../core/constants.js";
import {
  escapeHtml, formatDate, normalizeMoney, safeMultiline, linesToListItems,
  joinDateOrDescription, vacationDaysText, htmlToText, daysInMonth, croatianNonWorkingDays, formToObject
} from "../core/utils.js";
import { p, center, centerTitle, b, signatureHtml } from "./shared.js";

// --- Contract document assembly ---

function makeContractDocument(title, parts) {
  const html = parts.flat().join("");
  return { title, html, body: htmlToText(html) };
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
    p("6. Radnik ima pravo na obrazovanje, osposobljavanje i usavršavanje sukladno članku 54. Zakona o radu, u opsegu i na način koji odredi Poslodavac ovisno o potrebama organizacije rada, a o trošku Poslodavca."),
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
    p(`3. Ovaj je Ugovor sastavljen u ${b(copiesText)}`)
  ].join("");
}

// --- Main contract builders ---

export function buildFullTimeContractExact(context) {
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

export function buildPartTimeContractExact(context) {
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
    changes.push({ reference: "dodatnih odredbi osnovnog Ugovora o radu", text: `<strong>${safeMultiline(item)}</strong>` });
  });
  return changes;
}

export function buildStandardAnnex(context) {
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

export function buildAnnexA1Exact(context) {
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
