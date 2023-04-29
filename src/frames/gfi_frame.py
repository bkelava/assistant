import customtkinter as ctk
import locale
import tkinter as tk
import xlrd as xl

from datetime import date
from tkinter.filedialog import askopenfilename
from typing import Any, Dict

import src.constants.buttons as Btn
import src.constants.checkbox as Chbx
import src.constants.colors as Color
import src.constants.combobox as Cb
import src.constants.entry as Entry
import src.constants.excel as Excel
import src.constants.fonts as Font

from src.constants.bindings import KEY_RELEASE
from src.constants.specials import DATE_FORMAT, LOCALE_CROATIA, LOCALE_EN_US
from src.pdf.pdf_generator import PDFGenerator
from src.utils import entry_delete_insert_readonly

from .program_frame import ProgramFrame


class GFIFrame(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(GFIFrame, self).__init__(*args, **kwargs)

        self.configure(fg_color=Color.BLUE_1529)
        self._set_up_grid(20, 20)
        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        self._button_load_GFI: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.OPEN_GFI_EXCEL,
            font=self._font,
            command=lambda: self.__load_GFI(self._entry_file_path),
        )
        self._button_load_GFI.pack(padx=20, pady=20, side=ctk.TOP)

        self._entry_file_path: ctk.CTkEntry = ctk.CTkEntry(
            self, font=self._font, state=Entry.READ_ONLY, justify=ctk.CENTER
        )
        self._entry_file_path.pack(padx=20, pady=20, side=ctk.TOP, fill=ctk.X)

        self._frame: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLUE_1529)
        self._frame.pack(padx=20, pady=20, side=ctk.TOP, fill=ctk.X)
        self._label: ctk.CTkLabel = ctk.CTkLabel(self._frame, font=self._font, text="Pokriće gubitka")
        self._label.pack(padx=20, side=ctk.LEFT, anchor=ctk.NW)
        self._entry_loss_description: ctk.CTkEntry = ctk.CTkEntry(
            self._frame, font=self._font, justify=ctk.CENTER, state=Entry.READ_ONLY
        )
        self._entry_loss_description.pack(padx=20, side=ctk.LEFT, fill=ctk.X, expand=True)
        self._entry_loss_description.bind(KEY_RELEASE, lambda _: self.__validate_entry_loss_description())

        self._button_generate_GFI: ctk.CTkButton = ctk.CTkButton(
            self, text=Btn.GENERATE_GFI, font=self._font, command=self._generate_reports, state=ctk.DISABLED
        )
        self._button_generate_GFI.pack(padx=20, pady=20, side=ctk.TOP, fill=ctk.X)

        self._checkbox_report_1: ctk.CTkCheckBox = ctk.CTkCheckBox(
            self, font=self._font, text=Chbx.REPORT_1, state=ctk.DISABLED, text_color_disabled=Color.BLACK
        )
        self._checkbox_report_1.pack(padx=20, pady=20, side=ctk.TOP, anchor=ctk.W)
        self._checkbox_report_2: ctk.CTkCheckBox = ctk.CTkCheckBox(
            self, font=self._font, text=Chbx.REPORT_2, state=ctk.DISABLED, text_color_disabled=Color.BLACK
        )
        self._checkbox_report_2.pack(padx=20, pady=20, side=ctk.TOP, anchor=ctk.W)
        self._checkbox_report_3: ctk.CTkCheckBox = ctk.CTkCheckBox(
            self, font=self._font, text=Chbx.REPORT_3, state=ctk.DISABLED, text_color_disabled=Color.BLACK
        )
        self._checkbox_report_3.pack(padx=20, pady=20, side=ctk.TOP, anchor=ctk.W)

        self._button_exit: ctk.CTkButton = ctk.CTkButton(
            self, text=Btn.CLOSE, font=self._font, command=self.__exit, state=ctk.DISABLED
        )
        self._button_exit.pack(padx=20, pady=20, side=ctk.TOP)

    def _generate_reports(self) -> None:
        self._button_generate_GFI.configure(state=ctk.DISABLED)
        workbook: xl.Book = xl.open_workbook(self._entry_file_path.get())
        sheet: xl.sheet.Sheet = workbook.sheet_by_name(Excel.SHEET_INFO)
        locale.setlocale(locale.LC_ALL, f"{LOCALE_CROATIA}.utf8")
        print(locale.getdefaultlocale())
        data: Dict = {
            Excel.COMPANY_NAME: str(sheet.cell(28, 2).value),
            Excel.ADDRESS: str(sheet.cell(32, 2).value),
            Excel.CITY: str(sheet.cell(30, 5).value),
            Excel.OIB: str(sheet.cell(26, 2).value),
            Excel.MBS: str(sheet.cell(26, 7).value),
            Excel.MB: str(sheet.cell(26, 12).value),
            Excel.OWNERSHIP: str(sheet.cell(51, 3).value).lower(),
            Excel.COMPANY_SIZE: str(sheet.cell(49, 3).value).lower(),
            Excel.REPORT_YEAR: str(int(float(sheet.cell(11, 5).value))),
            Excel.REPORT_DATE: date.today().strftime(DATE_FORMAT),
            Excel.DIRECTOR: str(sheet.cell(74, 0).value),
            Excel.FOREIGN: str("%.2f" % sheet.cell(53, 5).value),
            Excel.DOMESTIC: str("%.2f" % sheet.cell(53, 2).value),
            Excel.NKD: str(sheet.cell(41, 2).value),
            Excel.AUTONOMY: str(sheet.cell(43, 3).value),
            Excel.EMPLOYEES_PREVIOUS: str(int(sheet.cell(55, 2).value)),
            Excel.EMPLOYEES_CURRENT: str(int(sheet.cell(55, 5).value)),
            Excel.COUTY: (str(sheet.cell(38, 10).value).lower()).capitalize(),
            Excel.TOWNSHIP: str(sheet.cell(38, 3).value),
            Excel.OPERATE_CURRENT: str(sheet.cell(59, 2).value),
            Excel.OPERATE_PREVIOUS: str(sheet.cell(59, 5).value),
            Excel.LOSS_COVERAGE: self._entry_loss_description.get(),
        }

        sheet = workbook.sheet_by_name(Excel.SHEET_RDG)
        data[Excel.GAIN] = locale.currency(round(float(sheet.cell(62, 9).value), 2), grouping=True)[:-3]
        data[Excel.LOSS] = locale.currency(round(float(sheet.cell(63, 9).value), 2), grouping=True)[:-3]
        data[Excel.INCOME_SALES] = locale.currency(round(float(sheet.cell(9, 9).value), 2), grouping=True)[:-3]
        data[Excel.INCOME_GOODS_AND_SERVICES] = locale.currency(
            round(float(sheet.cell(10, 9).value), 2), grouping=True
        )[:-3]
        data[Excel.INCOME_REST] = locale.currency(round(float(sheet.cell(12, 9).value), 2), grouping=True)[:-3]
        data[Excel.INCOME_CURSE] = locale.currency(round(float(sheet.cell(44, 9).value), 2), grouping=True)[:-3]
        data[Excel.INCOME_INTEREST] = locale.currency(round(float(sheet.cell(43, 9).value), 2), grouping=True)[:-3]
        data[Excel.INCOME_STOCK] = locale.currency(round(float(sheet.cell(38, 9).value), 2), grouping=True)[:-3]
        data[Excel.INCOME_LOAN] = locale.currency(round(float(sheet.cell(42, 9).value), 2), grouping=True)[:-3]
        data[Excel.INCOME_FINANCIAL_REST] = locale.currency(round(float(sheet.cell(46, 9).value), 2), grouping=True)[
            :-3
        ]
        data[Excel.GAIN_BEFORE_TAX] = locale.currency(round(float(sheet.cell(61, 9).value), 2), grouping=True)[:-3]
        data[Excel.GAIN_TAX] = locale.currency(round(float(sheet.cell(64, 9).value), 2), grouping=True)[:-3]
        gain_after_tax: float = round(float(sheet.cell(65, 9).value), 2)
        saving: float = round(gain_after_tax * 0.25, 2)
        gain_kept: float = gain_after_tax - saving
        data[Excel.GAIN_AFTER_TAX] = locale.currency(gain_after_tax, grouping=True)[:-3]
        data[Excel.SAVINGS] = locale.currency(saving, grouping=True)[:-3]
        data[Excel.GAIN_KEPT] = locale.currency(round(gain_kept, 2), grouping=True)[:-3]
        data[Excel.EXPENSES_CURRENT] = locale.currency(round(float(sheet.cell(60, 9).value), 2), grouping=True)[:-3]
        data[Excel.EXPENSES_PREVIOUS] = locale.currency(round(float(sheet.cell(60, 8).value), 2), grouping=True)[:-3]
        data[Excel.EXPENSES_DIFF] = locale.currency(
            round(float(sheet.cell(60, 9).value) - float(sheet.cell(60, 8).value), 2), grouping=True
        )[:-3]
        data[Excel.EXPENSES_DIFF_PERCT] = locale.currency(
            round(
                (float(sheet.cell(60, 9).value) - float(sheet.cell(60, 8).value))
                / (float(sheet.cell(60, 9).value) * 100),
                2,
            ),
            grouping=True,
        )[:-3]

        sheet = workbook.sheet_by_name(Excel.SHEET_BALANCE)
        data[Excel.BALANCE] = locale.currency(round(float(sheet.cell(133, 9).value), 2), grouping=True)[:-3]

        PDFGenerator.generate_GFI_report_1(data)
        self.__check_checkbox(self._checkbox_report_1)
        PDFGenerator.generate_GFI_report_2(data)
        self.__check_checkbox(self._checkbox_report_2)
        PDFGenerator.generate_GFI_report_3(data)
        self.__check_checkbox(self._checkbox_report_3)

        locale.setlocale(locale.LC_ALL, f"{LOCALE_EN_US}.utf8")
        self._button_exit.configure(state=ctk.NORMAL)

    def __exit(self) -> None:
        self.master.master.frame_menu._button_GFI.configure(state=ctk.NORMAL)
        self.destroy()

    def __validate_entry_loss_description(self) -> None:
        if len(self._entry_loss_description.get()) == 0:
            self._button_generate_GFI.configure(state=ctk.DISABLED)
            return
        self._button_generate_GFI.configure(state=ctk.NORMAL)

    def __load_GFI(self, entry: ctk.CTkEntry) -> None:
        file_path: str = askopenfilename(
            initialdir="C:/", title="Select a File", filetypes=(("Excel file", ".xlsx .xls"), ("All Files", "*.*"))
        )
        try:
            entry_delete_insert_readonly(entry, file_path)
            workbook: xl.Book = xl.open_workbook(file_path)
            self.__validate_gain_or_loss(workbook)
        except TypeError as err:
            print(err)
        self._button_load_GFI.configure(state=ctk.DISABLED)

    def __validate_gain_or_loss(self, workbook: xl.Book) -> None:
        sheet: xl.sheet.Sheet = workbook.sheet_by_name(Excel.SHEET_RDG)
        loss: int = sheet.cell(67, 9).value
        print(loss)
        if int(loss) > 0:
            self._entry_loss_description.configure(state=ctk.NORMAL)
            print("CASE1")
        else:
            self._button_generate_GFI.configure(state=ctk.NORMAL)

    def __check_checkbox(self, checkbox: ctk.CTkCheckBox):
        checkbox.configure(state=ctk.NORMAL)
        checkbox.select()
        checkbox.configure(state=ctk.DISABLED)
