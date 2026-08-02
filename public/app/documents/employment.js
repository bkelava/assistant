import { state, employmentDocumentDefinitions } from "../core/constants.js";
import { escapeHtml, formatAddress, safeMultiline, htmlToText, formatDate } from "../core/utils.js";
import { p, center, centerTitle, b, signatureHtml } from "./shared.js";

// --- Free-text helper ---

export function freeTextParagraph(value, fallback) {
  return value ? p(`<strong>${safeMultiline(value)}</strong>`) : p(fallback);
}

// --- Signature / delivery helpers ---

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

// --- Employment document assembly ---

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

// --- Employment document builders ---

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
    freeTextParagraph(context.reason, `Tijekom probnog rada u trajanju od ${context.probationPeriod} utvrđeno je da radnik ne ostvaruje očekivane rezultate i ne zadovoljava zahtjeve radnog mjesta.`)
  ]);
}

function buildWorkObligationWarning(context) {
  return makeEmployerDecision(context, "UPOZORENJE", "NA OBVEZE IZ RADNOG ODNOSA", [
    p(`Radnik ${b(context.employeeInfo)}, zaposlen na temelju Ugovora o radu sklopljenog dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}, upozorava se da je povrijedio obveze iz radnog odnosa.`),
    p(`<strong>${safeMultiline(context.violation)}</strong>`),
    p("U slučaju nastavka povrede radnih obveza radniku prijeti mogućnost otkaza Ugovora o radu zbog skrivljenog ponašanja."),
    center("Obrazloženje"),
    freeTextParagraph(context.reason, "Na temelju raspoložive dokumentacije i saznanja Poslodavca utvrđeno je postojanje opisane povrede obveza iz radnog odnosa.")
  ]);
}

function buildMisconductNotice(context) {
  return makeEmployerDecision(context, "ODLUKU", "O REDOVITOM OTKAZU UGOVORA O RADU ZBOG SKRIVLJENOG PONAŠANJA", [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu na ${b(context.contractType)} sklopljen dana ${b(context.contractDate)} radi obavljanja poslova ${b(context.jobTitle)}, zbog skrivljenog ponašanja.`),
    p(`Radni odnos prestaje istekom otkaznog roka u trajanju od ${b(context.noticePeriod)}, koji počinje teći danom dostave ove Odluke.`),
    vacationParagraph(context),
    center("Obrazloženje"),
    p(`<strong>${safeMultiline(context.violation)}</strong>`),
    freeTextParagraph(context.reason, "Radnik je prethodno upozoren na obveze iz radnog odnosa i mogućnost otkaza u slučaju nastavka povrede tih obveza.")
  ]);
}

function buildPersonalNotice(context) {
  return makeEmployerDecision(context, "ODLUKU", "O REDOVITOM OSOBNO UVJETOVANOM OTKAZU UGOVORA O RADU", [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu na ${b(context.contractType)} sklopljen dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}, zbog osobno uvjetovanih razloga.`),
    p(`Radni odnos prestaje istekom otkaznog roka u trajanju od ${b(context.noticePeriod)}, koji počinje teći danom dostave ove Odluke.`),
    vacationParagraph(context),
    center("Obrazloženje"),
    freeTextParagraph(context.reason, "Zbog trajnih osobina ili sposobnosti radnika isti nije u mogućnosti uredno izvršavati svoje obveze iz radnog odnosa.")
  ]);
}

function buildBusinessNotice(context, definition) {
  return makeEmployerDecision(context, "ODLUKU", `O REDOVITOM POSLOVNO UVJETOVANOM OTKAZU UGOVORA O RADU ZBOG ${definition.businessReason.toUpperCase()}`, [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu na ${b(context.contractType)} sklopljen dana ${b(context.contractDate)} radi obavljanja poslova ${b(context.jobTitle)}, zbog ${b(definition.businessReason)}.`),
    p(`Radni odnos prestaje istekom otkaznog roka u trajanju od ${b(context.noticePeriod)}, koji počinje teći danom dostave ove Odluke.`),
    vacationParagraph(context),
    p(`Radnik ima pravo na otpremninu odnosno drugu pripadajuću isplatu u iznosu od ${b(context.paymentAmount)}, ako su za to ispunjene zakonske pretpostavke.`),
    center("Obrazloženje"),
    freeTextParagraph(context.reason, `Zbog ${definition.businessReason} prestala je potreba za obavljanjem poslova radnika pod uvjetima iz sklopljenog ugovora o radu.`)
  ]);
}

function buildChangedContractOffer(context) {
  return makeEmployerDecision(context, "ODLUKU", "O OTKAZU S PONUDOM IZMIJENJENOG UGOVORA O RADU", [
    p(`Radniku ${b(context.employeeInfo)} otkazuje se Ugovor o radu sklopljen dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}, uz istodobnu ponudu sklapanja izmijenjenog ugovora o radu.`),
    p(`Ako radnik prihvati ponudu, radni odnos nastavlja se pod uvjetima iz izmijenjenog ugovora. Ako radnik ponudu ne prihvati, radni odnos prestaje istekom otkaznog roka od ${b(context.noticePeriod)}.`),
    p(`<strong>${safeMultiline(context.changedContractSummary)}</strong>`),
    center("Obrazloženje"),
    freeTextParagraph(context.reason, "Zbog promijenjenih potreba organizacije rada potrebno je izmijeniti ugovorene uvjete rada.")
  ]);
}

function buildEmployeeRegularNotice(context) {
  return makeEmploymentDocument(context, [
    p(`${employeeParty(context)} daje Poslodavcu ${b(context.employer.company_name || "")} sljedeći`),
    centerTitle("REDOVITI OTKAZ UGOVORA O RADU"),
    p(`Radnik redovito otkazuje Ugovor o radu sklopljen dana ${b(context.contractDate)} za obavljanje poslova ${b(context.jobTitle)}.`),
    p(`Otkazni rok iznosi ${b(context.noticePeriod)} i počinje teći danom dostave ovog otkaza Poslodavcu.`),
    p(`Radni odnos prestaje dana ${b(context.endDate)}.`),
    freeTextParagraph(context.reason, "Radnik otkazuje ugovor o radu iz osobnih razloga."),
    employeeOnlySignature(context)
  ]);
}

function buildEmployerExtraordinaryNotice(context) {
  return makeEmployerDecision(context, "ODLUKU", "O IZVANREDNOM OTKAZU UGOVORA O RADU", [
    p(`Radniku ${b(context.employeeInfo)} izvanredno se otkazuje Ugovor o radu sklopljen dana ${b(context.contractDate)} za poslove ${b(context.jobTitle)}.`),
    p(`Radni odnos prestaje danom dostave ove Odluke, odnosno dana ${b(context.endDate)}.`),
    center("Obrazloženje"),
    p(`<strong>${safeMultiline(context.violation)}</strong>`),
    freeTextParagraph(context.reason, "Zbog osobito teške povrede obveze iz radnog odnosa nastavak radnog odnosa nije moguć.")
  ]);
}

function buildEmployeeExtraordinaryNotice(context) {
  return makeEmploymentDocument(context, [
    p(`${employeeParty(context)} daje Poslodavcu ${b(context.employer.company_name || "")} sljedeći`),
    centerTitle("IZVANREDNI OTKAZ UGOVORA O RADU"),
    p(`Radnik izvanredno otkazuje Ugovor o radu sklopljen dana ${b(context.contractDate)} za obavljanje poslova ${b(context.jobTitle)}.`),
    p(`Radni odnos prestaje danom dostave ovog otkaza, odnosno dana ${b(context.endDate)}.`),
    center("Obrazloženje"),
    freeTextParagraph(context.reason, "Zbog osobito važne činjenice nastavak radnog odnosa nije moguć."),
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

export function buildEmploymentDocument(data) {
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
