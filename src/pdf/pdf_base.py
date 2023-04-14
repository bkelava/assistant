from fpdf import FPDF
from typing import Tuple

from src.tables import Employee, Employer
from src.utils import parse_first_and_last_day, create_line

from .pdf_constants import *


class PDFBaseClass(FPDF):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.add_font(NOTO_SANS, "", NOTO_SANS_REGULAR_PATH)
        self.add_font(NOTO_SANS, BOLD, NOTO_SANS_BOLD_PATH)
        self.add_font(NOTO_SANS, ITALIC, NOTO_SANS_ITALIC_PATH)


class PDFPartTimeContract(PDFBaseClass):
    def header(self) -> None:
        if self.page_no() == 1:
            self.image(LOGO, 10, 0, 22, 22.5)
            self.set_font(NOTO_SANS, BOLD, 5)
            self.set_xy(32, 13)
            self.cell(w=0, h=0, txt=HEADER_MARK_1, border=0, ln=0, align=ALIGN_LEFT)
            self.ln()
            self.set_xy(32, 13 + self.font_size_pt / 2)
            self.cell(w=0, h=0, txt=HEADER_MARK_2, border=0, ln=0, align=ALIGN_LEFT)
            self.ln()
            self.set_xy(32, 13 + self.font_size_pt)
            self.cell(w=0, h=0, txt=HEADER_MARK_3, border=0, ln=0, align=ALIGN_LEFT)
            self.ln(12)
        else:
            self.ln(18)

    def footer(self) -> None:
        self.set_y(-15)
        self.set_font(ARIAL, ITALIC, 8)
        self.cell(0, 10, f"{PAGE} {str(self.page_no())}/{{nb}}", 0, 0, ALIGN_CENTER)


class PDFFullTimeContract(PDFBaseClass):
    def header(self) -> None:
        if self.page_no() == 1:
            self.image(LOGO, 10, 0, 22, 22.5)
            self.set_font(NOTO_SANS, BOLD, 5)
            self.set_xy(32, 13)
            self.cell(w=0, h=0, txt=HEADER_MARK_1, border=0, ln=0, align=ALIGN_LEFT)
            self.ln()
            self.set_xy(32, 13 + self.font_size_pt / 2)
            self.cell(w=0, h=0, txt=HEADER_MARK_2, border=0, ln=0, align=ALIGN_LEFT)
            self.ln()
            self.set_xy(32, 13 + self.font_size_pt)
            self.cell(w=0, h=0, txt=HEADER_MARK_3, border=0, ln=0, align=ALIGN_LEFT)
            self.ln(12)
        else:
            self.ln(18)

    def footer(self) -> None:
        self.set_y(-15)
        self.set_font(ARIAL, ITALIC, 8)
        self.cell(0, 10, f"{PAGE} {str(self.page_no())}/{{nb}}", 0, 0, ALIGN_CENTER)


class PDFContractAnexA1(PDFBaseClass):
    def header(self) -> None:
        if self.page_no() == 1:
            self.image(LOGO, 10, 0, 22, 22.5)
            self.set_font(NOTO_SANS, BOLD, 5)
            self.set_xy(32, 13)
            self.cell(w=0, h=0, txt=HEADER_MARK_1, border=0, ln=0, align=ALIGN_LEFT)
            self.ln()
            self.set_xy(32, 13 + self.font_size_pt / 2)
            self.cell(w=0, h=0, txt=HEADER_MARK_2, border=0, ln=0, align=ALIGN_LEFT)
            self.ln()
            self.set_xy(32, 13 + self.font_size_pt)
            self.cell(w=0, h=0, txt=HEADER_MARK_3, border=0, ln=0, align=ALIGN_LEFT)
            self.ln(12)
        else:
            self.ln(18)

    def footer(self) -> None:
        self.set_y(-15)
        self.set_font(ARIAL, ITALIC, 8)
        self.cell(0, 10, f"{PAGE} {str(self.page_no())}/{{nb}}", 0, 0, ALIGN_CENTER)


class PDFWorkingHoursSheet(PDFBaseClass):
    def __init__(self, employer: Employer, employee: Employee, month: int, year: int, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.__employer: Employer = employer
        self.__employee: Employee = employee
        self.__month: int = month
        self.__year: int = year

    def header(self) -> None:
        self.image(LOGO, 10, 0, 22, 22.5)
        self.set_font(NOTO_SANS, BOLD, 5)
        self.set_xy(32, 13)
        self.cell(w=0, h=0, txt=HEADER_MARK_SHEET_1, border=0, ln=0, align=ALIGN_LEFT)
        self.ln()
        self.set_xy(32, 13 + self.font_size_pt / 2)
        self.cell(w=0, h=0, txt=HEADER_MARK_2, border=0, ln=0, align=ALIGN_LEFT)
        self.ln()
        self.set_xy(32, 13 + self.font_size_pt)
        self.cell(w=0, h=0, txt=HEADER_MARK_3, border=0, ln=0, align=ALIGN_LEFT)
        self.ln()

        self.set_font(NOTO_SANS, BOLD, 8)
        self.cell(w=0, h=0, txt=SHEET_TITLE, align=ALIGN_CENTER)
        self.ln(12)
        self.set_font(NOTO_SANS, "", 8)
        self.write(h=0, txt=f"{EMPLOYER}: ")
        self.set_font(NOTO_SANS, BOLD, 8)
        self.write(h=0, txt=f"{str(self.__employer)}")
        self.ln()
        self.set_font(NOTO_SANS, "", 8)
        self.write(h=0, txt=f"{EMPLOYEE}: ")
        self.set_font(NOTO_SANS, BOLD, 8)
        self.write(h=0, txt=str(self.__employee))
        self.ln()
        self.set_font(NOTO_SANS, "", 8)
        self.write(h=0, txt=f"ZA RAZDOBLJE OD ")
        self.set_font(NOTO_SANS, BOLD, 8)
        month_days = parse_first_and_last_day(self.__month, self.__year)
        self.write(h=0, txt=f"{month_days[0]}")
        self.set_font(NOTO_SANS, "", 8)
        self.write(h=0, txt=" DO ")
        self.set_font(NOTO_SANS, BOLD, 8)
        self.write(h=0, txt=f"{month_days[1]}")
        self.ln(6)

    def footer(self) -> None:
        self.ln(6)
        self.set_font(NOTO_SANS, "", 8)
        self.write(
            h=0,
            txt=f"{RESPONSIBILITY_STATUS}",
        )
        self.ln()
        self.write(
            h=0,
            txt=f"{SHEET_REPORT_DATE}: {create_line(20)}",
        )
        self.ln()
        self.write(
            h=0,
            txt=f"{SHEET_EMPLOYER_SIGNATURE}: {create_line(20)}",
        )
        self.ln()
        self.set_font(NOTO_SANS, "", 5)
        self.write(h=0, txt=f"{SHEET_ACRONYMS}: ")
        self.set_font(NOTO_SANS, BOLD, 5)
        for key, value in SHEET_DATA_DICT.items():
            self.write(h=0, txt=f"{key} - {value}; ")


class PDFGFiReport(PDFBaseClass):
    def header(self) -> None:
        if self.page_no() == 1:
            self.image(LOGO, 10, 0, 22, 22.5)
            self.set_font(NOTO_SANS, BOLD, 5)
            self.set_xy(32, 13)
            self.cell(w=0, h=0, txt=REPORT_MARK, border=0, ln=0, align=ALIGN_LEFT)
            self.ln()
            self.set_xy(32, 13 + self.font_size_pt / 2)
            self.cell(w=0, h=0, txt=HEADER_MARK_2, border=0, ln=0, align=ALIGN_LEFT)
            self.ln()
            self.set_xy(32, 13 + self.font_size_pt)
            self.cell(w=0, h=0, txt=HEADER_MARK_3, border=0, ln=0, align=ALIGN_LEFT)
            self.ln(12)
        else:
            self.ln(18)

    def footer(self) -> None:
        self.set_y(-15)
        self.set_font(ARIAL, ITALIC, 8)
        self.cell(0, 10, f"{PAGE} {str(self.page_no())}/{{nb}}", 0, 0, ALIGN_CENTER)
