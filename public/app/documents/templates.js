import { state } from "../core/constants.js";
import { formatDate, normalizeMoney, htmlToText, formatAddress, getEmployer, getEmployee, partyDisplayName, partyOib } from "../core/utils.js";
import { p, center, centerTitle, b, ul, twoPartySignature, singleSignature } from "./shared.js";
import { buildBlankDocument } from "./blank.js";

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

// --- Template document builders ---

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
    ${p(`<strong>${safeMultiline(data.work_order_description || "")}</strong>`)}
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

export function buildTemplateDocument(data) {
  const builders = {
    business_cooperation: buildBusinessCooperationDocument,
    vehicle_power_of_attorney: buildVehiclePowerOfAttorneyDocument,
    work_order: buildWorkOrderDocument,
    virtual_address_lease: buildVirtualAddressLeaseDocument
  };
  return builders[data.type]?.(data) || buildBlankDocument(data.type);
}

// --- Employment documents ---
