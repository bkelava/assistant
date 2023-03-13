ERROR: str = "Greška"
SUCCESSFULL: str = "Operacija uspješna"

VALIDATION_WARNING_TITLE: str = "Ne uspješna validacija polja"
VALIDATION_WARNING_MESSAGE: str = "Nisu ispravno ispunjena sva polja.\n\nUkoliko je potrebno da polje bude prazno, stavite znak '-' (minus/crtica) da zadovoljite formu."

VALIDATION_WARNING_MESSAGE_SHORT = "Nisu ispravno ispunjena sva polja."

VALIDATION_INFO_TITLE: str = "Uspješna validacija polja"
VALIDATION_INFO_MESSAGE: str = "Polja su ispravno popunjena.\n\nTipka za generiranje ugovora je omogućena."

CREATE_EMPLOYER_VALIDATION_TITLE: str = "Nisu popunjena sva polja"
CREATE_EMPLOYER_VALIDATION_MESSAGE: str = "Sva polja moraju biti popunjena."

CREATE_EMPLOYEE_VALIDATION_TITLE: str = "Nisu popunjena sva potrebna polja"
CREATE_EMPLOYEE_VALIDATION_MESSAGE: str = (
    "Polja:\n\n- IME\n- PREZIME\n-OIB/PUTOVNICA\n- LISTA POSLODAVAC\n\n moraju biti popunjan"
)

CREATE_EMPLOYER_EXISTING_EMPLOYER_ERROR_TITLE: str = ERROR
CREATE_EMPLOYER_EXISTING_EMPLOYER_ERROR_MESSAGE: str = "U bazi podataka postoji poslodavac s istim imenom."

CREATE_EMPLOYEE_EXISTING_EMPLOYEE_ERROR_TITLE: str = ERROR
CREATE_EMPLOYEE_EXISTING_EMPLOYEE_ERROR_MESSAGE: str = (
    "U bazi podataka već postoji zaposleni s uneseim OIB-om/Putovnicom"
)

CREATE_EMPLOYER_INSERT_SUCCESSFULL_TITLE: str = SUCCESSFULL
CREATE_EMPLOYER_INSERT_SUCCESSFULL_MESSAGE: str = "Poslodavac uspješno dodan u bazu podataka."

CREATE_EMPLOYEE_INSERT_SUCCESSFULL_TITLE: str = SUCCESSFULL
CREATE_EMPLOYEE_INSERT_SUCCESSFULL_MESSAGE: str = "Radnik uspješno dodan u bazu podataka."

DELETE_EMPLOYER_EMPTY_SEARCH_ERROR_TITLE: str = ERROR
DELETE_EMPLOYER_EMPTY_SEARCH_ERROR_MESSAGE: str = "Prazno polje. Molim unesite naziv poslodavca."

DELETE_EMPLOYEE_EMPTY_SEARCH_ERROR_TITLE: str = ERROR
DELETE_EMPLOYEE_EMPTY_SEARCH_ERROR_MESSAGE: str = "Prazno polje. Molim unesite OIB/Putovnica (osobni broj) radnika."

DELETE_EMPLOYER_FAILED_DELETING_TITLE: str = ERROR
DELETE_EMPLOYER_FAILED_DELETING_MESSAGE: str = "Neispravan naziv poslodavca."

DELETE_EMPLOYEE_FAILED_DELETING_TITLE: str = ERROR
DELETE_EMPLOYEE_FAILED_DELETING_MESSAGE: str = "Nešto je pošlo po zlu.\nRadik nije uklonjen."

DELETE_EMPLOYEE_FAILED_FINDING_EMPLOYEE_TITLE: str = ERROR
DELETE_EMPLOYEE_FAILED_FINDING_EMPLOYEE_MESSAGE: str = "Radnik nije pronađen za uneseni OIB/Putovnicu."

DELETE_EMPLOYER_SUCCEESSFULL_TITLE: str = SUCCESSFULL
DELETE_EMPLOYER_SUCCEESSFULL_MESSAGE: str = "Poslodavac je uspješno izbrisan iz baze podataka."

DELETE_EMPLOYEE_SUCCESSFULL_TITLE: str = SUCCESSFULL
DELETE_EMPLOYEE_SUCCESSFULL_MESSAGE: str = "Radnik je uspješno izbrisan iz baze podataka."

ALTER_EMPLOYER_FAILED_ALTERING_TITLE: str = ERROR
ALTER_EMPLOYER_FAILED_ALTERING_MESSAGE: str = "Ne uspješna izmjena podataka poslodavca."

ALTER_EMPLOYEE_FAILED_ALTERING_TITLE: str = ERROR
ALTER_EMPLOYEE_FAILED_ALTERING_MESSAGE: str = "Ne uspješna izmjena podataka radnika."

ALTER_EMPLOYEE_EMPTY_SWTICHBOX_ERROR_TITLE: str = ERROR
ALTER_EMPLOYEE_EMPTY_SWTICHBOX_ERROR_MESSAGE: str = "Popis poslodavaca je prazan."

ALTER_EMPLOYER_SUCCESSFULL_ALTERING_TITLE: str = SUCCESSFULL
ALTER_EMPLOYER_SUCCESSFULL_ALTERING_MESSAGE: str = "Uspješna izmjena podataka poslodavca."

ALTER_EMPLOYEE_SUCCESSFULL_ALTERING_TITLE: str = SUCCESSFULL
ALTER_EMPLOYEE_SUCCESSFULL_ALTERING_MESSAGE: str = "Uspješna izmjena podataka radnika."
