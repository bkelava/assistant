import os

BOLD: str = "B"
ITALIC: str = "I"
REGULAR: str = "R"

ALIGN_CENTER: str = "C"
ALIGN_RIGHT: str = "R"
ALIGN_LEFT: str = "L"
ALIGN_JUSTIFY: str = "J"

CWD = os.getcwd()
IMGS_DIR: str = "pdf/imgs"
FONTS_DIR: str = "pdf/fonts"

LOGO: str = f"{CWD}/{IMGS_DIR}/logo_pb.png"

ARIAL: str = "Arial"
ARIAL_PATH: str = f"{CWD}/{FONTS_DIR}/{ARIAL}.ttf"

NOTO_SANS = "NotoSans"
NOTO_SANS_REGULAR_PATH: str = f"{CWD}/{FONTS_DIR}/{NOTO_SANS}Regular.ttf"
NOTO_SANS_ITALIC_PATH: str = f"{CWD}/{FONTS_DIR}/{NOTO_SANS}Italic.ttf"
NOTO_SANS_BOLD_PATH: str = f"{CWD}/{FONTS_DIR}/{NOTO_SANS}Bold.ttf"

HEADER_MARK: str = "Ugovor je izrađen putem alata Knjigovodstveni asistent (www.kokelava.hr)"

PAGE: str = "Stranica"

PERSONAL_ID_TYPES: str = "OIB/Putovnica:"

TEN_SPACES: str = "          "

EMPLOYER: str = "Poslodavac"
EMPLOYEE: str = "Radnik"

PDF_EXTENSION: str = ".pdf"
