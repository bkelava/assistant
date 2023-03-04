from fpdf import FPDF

from .pdf_constants import *


class PDF(FPDF):
    def header(self) -> None:
        pass

    def footer(self) -> None:
        self.set_y(-15)
        self.set_font(ARIAL, ITALIC, 8)
        self.cell(0, 10, f"{PAGE} {str(self.page_no())}/{{nb}}", 0, 0, ALIGN_CENTER)
