import os

from typing import Dict, List

OUTPUT_DIR = os.path.expanduser("~/")

BOLD: str = "B"
ITALIC: str = "I"
REGULAR: str = "R"

A4: str = "A4"
PORTRAIT: str = "portrait"
LANDSCAPE: str = "landscape"

ALIGN_CENTER: str = "C"
ALIGN_RIGHT: str = "R"
ALIGN_LEFT: str = "L"
ALIGN_JUSTIFY: str = "J"

CWD = os.getcwd()
IMGS_DIR: str = "src/assets/imgs"
FONTS_DIR: str = "src/assets/fonts"

LOGO: str = f"{CWD}/{IMGS_DIR}/logo_pb.png"

ARIAL: str = "Arial"
ARIAL_PATH: str = f"{CWD}/{FONTS_DIR}/{ARIAL}.ttf"

NOTO_SANS = "NotoSans"
NOTO_SANS_REGULAR_PATH: str = f"{CWD}/{FONTS_DIR}/{NOTO_SANS}Regular.ttf"
NOTO_SANS_ITALIC_PATH: str = f"{CWD}/{FONTS_DIR}/{NOTO_SANS}Italic.ttf"
NOTO_SANS_BOLD_PATH: str = f"{CWD}/{FONTS_DIR}/{NOTO_SANS}Bold.ttf"

HEADER_MARK_SHEET_1: str = "ERV je izrađen putem alata"

REPORT_MARK: str = "Obrazac je izrađen putem alata"

HEADER_MARK_1: str = "Ugovor je izrađen putem alata "
HEADER_MARK_2: str = "Knjigovodstveni asistent"
HEADER_MARK_3: str = "(www.kokelava.hr)"

PAGE: str = "Stranica"

PERSONAL_ID_TYPES: str = "OIB/Putovnica:"
VAT: str = "OIB"
MBS: str = "MBS"
MB: str = "MB"

TEN_SPACES: str = "          "

EMPLOYER: str = "Poslodavac"
EMPLOYEE: str = "Radnik"

PDF_EXTENSION: str = ".pdf"

SHEET_DATA: List[str] = [
    "Datum",
    "Dut",
    "Dol",
    "Odl",
    "Uks",
    "RR",
    "B-DP",
    "GO",
    "BOL-PO",
    "BOL-HZZO",
    "P",
    "SP",
    "PD",
    "SR",
    "DR",
    "RuK",
    "RnD",
]

SHEET_DATA_DICT: Dict = {
    "Dut": "Dan u tjednu",
    "Dol": "Dolazak sati",
    "Odl": "Odlazak sati",
    "Uks": "Ukupno sati",
    "RR": "Redovni rad",
    "B-DP": "Blagdan, državni praznik",
    "GO": "Godišnji odmor",
    "BOL-PO": "Bolovanje na teret poslodavca",
    "BOL-HZZO": "Bolovanje na terez HZZO-a",
    "P": "Prekovremeni rad",
    "SP": "Služneni put",
    "PD": "Plaćeni dopust",
    "SR": "SSmjenski rad",
    "DR": "Dvokratni rad",
    "RuK": "Rad u kombinaciji",
    "RnD": "Rad na daljinu",
}

SHEET_TITLE: str = "EVIDENCIJA O RADNOM VREMENU"

SHEET_REPORT_DATE: str = "Datum podnošenja izvješća:"

SHEET_EMPLOYER_SIGNATURE: str = "Potpis radnika"

SHEET_ACRONYMS: str = "Akronimi"

WHS: str = "ERV"

RESPONSIBILITY_STATUS: str = "Za točnost i istinitost podataka iz ovog izvješća zaposlenik jamči potpisom pod punom kaznenom i materijalnom odgovornošću."

REPORT_1: str = "Odluka o utvrđivanju financijskog izvješća "
REPORT_2: str = "Bilješke uz financijska izvješća "
REPORT_3: str = "Odluka o uporabi dobiti-pokriću gubitka "

DOO: str = "d.o.o."
JDOO: str = "j.d.o.o."
