import { state } from "../core/constants.js";
import { escapeHtml, formatDate, normalizeMoney, linesToListItems, formatAddress, numberWordHr, htmlToText } from "../core/utils.js";
import { p, center, centerTitle, b, ul, ol } from "./shared.js";

function feeWithVatStatus(amount, vatStatus) {
  const amountLabel = `${normalizeMoney(amount)} EUR`;
  return vatStatus === "nije u sustavu PDV-a" ? `${amountLabel} (${vatStatus})` : `${amountLabel} ${vatStatus}`;
}

function serviceSignatureHtml(client, accounting) {
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

export function buildAccountingServicesDocument(data) {
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
