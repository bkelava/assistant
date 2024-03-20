import customtkinter as ctk
import locale
import re
import tkinter as tk
import xlrd as xl

from datetime import date
from tkinter.filedialog import askopenfilename
from typing import Dict, List

import src.constants.buttons as Btn

import src.constants.checkbox as Chbx
import src.constants.colors as Color
import src.constants.combobox as Cb
import src.constants.entry as Entry
import src.constants.excel as Excel
import src.constants.fonts as Font
import src.constants.label as Label


from src.constants.bindings import (
    ARROW_LEFT,
    ARROW_RIGHT,
    BUTTON_1,
    FOCUS_IN,
    FOCUS_OUT,
    KEY_RELEASE,
)
from src.constants.regex import (
    TWO_DECIMALS_REGEX,
    ONE_DECIMAL_REGEX,
    BACKSPACE_TWO_DECIMAL_REGEX,
    BACKSPACE_ONE_DECIMAL_REGEX,
)
from src.constants.specials import *
from src.pdf.pdf_generator import PDFGenerator
from src.utils import (
    entry_delete_insert_readonly,
    entry_insert_and_delete,
)
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

        self._total_gain: float = 0.00
        self._loss_coverage: float = 0.00
        self._payout_to_members: float = 0.00

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

        self._frame_loss: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLUE_1529)
        self._frame_loss.pack(padx=20, pady=20, side=ctk.TOP, fill=ctk.X)
        self._label_loss: ctk.CTkLabel = ctk.CTkLabel(self._frame_loss, font=self._font, text=Label.LOSS_COVERAGE)
        self._label_loss.pack(padx=20, side=ctk.LEFT, anchor=ctk.NW)
        self._entry_loss_description: ctk.CTkEntry = ctk.CTkEntry(
            self._frame_loss, font=self._font, justify=ctk.CENTER, state=Entry.READ_ONLY
        )
        self._entry_loss_description.pack(padx=20, side=ctk.LEFT, fill=ctk.X, expand=True)
        self._entry_loss_description.bind(KEY_RELEASE, lambda _: self.__validate_entry_loss_description())

        self._frame_payout_to_members: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLUE_1529)
        self._frame_payout_to_members.pack(padx=20, pady=20, side=ctk.TOP, fill=ctk.X)
        self._label_payout_to_members: ctk.CTkLabel = ctk.CTkLabel(
            self._frame_payout_to_members, font=self._font, text=Label.PAYOUT_TO_MEMBERS
        )
        self._label_payout_to_members.pack(padx=20, side=ctk.LEFT, anchor=ctk.NW)
        self._entry_payout_to_members_strvar: ctk.StringVar = ctk.StringVar()
        self._entry_payout_to_members: ctk.CTkEntry = ctk.CTkEntry(
            self._frame_payout_to_members,
            font=self._font,
            justify=ctk.CENTER,
            state=Entry.READ_ONLY,
            textvariable=self._entry_payout_to_members_strvar,
        )
        self._entry_payout_to_members.pack(padx=20, side=ctk.LEFT, fill=ctk.X, expand=True)
        self._entry_payout_to_members.bind(
            FOCUS_IN, lambda *args: self.__entry_numeric_add_bindings(*args, entry=self._entry_payout_to_members)
        )
        self._entry_payout_to_members.bind(
            FOCUS_OUT, lambda *args: self.__entry_numeric_remove_bindings(*args, entry=self._entry_payout_to_members)
        )
        entry_delete_insert_readonly(self._entry_payout_to_members, Entry.SALARY_DEFAULT)
        self._entry_payout_to_members_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_numeric(
                *args, entry=self._entry_payout_to_members, strvar=self._entry_payout_to_members_strvar
            ),
        )
        self._entry_payout_to_members.bind(KEY_RELEASE, lambda _: self.__gain_toggle_callback())

        self._frame_gain: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLUE_1529)
        self._frame_gain.pack(padx=20, pady=20, side=ctk.TOP, fill=ctk.X)
        self._label_gain: ctk.CTkLabel = ctk.CTkLabel(self._frame_gain, font=self._font, text=Label.GAIN)
        self._label_gain.pack(padx=20, side=ctk.LEFT, anchor=ctk.NW)
        self._entry_gain_strvar: ctk.StringVar = ctk.StringVar()
        self._entry_gain: ctk.CTkEntry = ctk.CTkEntry(
            self._frame_gain,
            font=self._font,
            justify=ctk.CENTER,
            state=Entry.READ_ONLY,
            textvariable=self._entry_gain_strvar,
        )
        self._entry_gain.pack(padx=20, side=ctk.LEFT, fill=ctk.X, expand=True)
        self._entry_gain.bind(FOCUS_IN, lambda *args: self.__entry_numeric_add_bindings(*args, entry=self._entry_gain))
        self._entry_gain.bind(
            FOCUS_OUT, lambda *args: self.__entry_numeric_remove_bindings(*args, entry=self._entry_gain)
        )
        self._entry_gain_strvar_id: str = self._entry_gain_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_numeric(*args, entry=self._entry_gain, strvar=self._entry_gain),
        )
        entry_delete_insert_readonly(self._entry_gain, Entry.SALARY_DEFAULT)

        self._frame_loss_coverage: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLUE_1529)
        self._frame_loss_coverage.pack(padx=20, pady=20, side=ctk.TOP, fill=ctk.X)
        self._label_loss_coverage: ctk.CTkLabel = ctk.CTkLabel(
            self._frame_loss_coverage, font=self._font, text=Label.KEPT_FOR_COVERAGE
        )
        self._label_loss_coverage.pack(padx=20, side=ctk.LEFT, anchor=ctk.NW)
        self._entry_loss_coverage_strvar: ctk.StringVar = ctk.StringVar()
        self._entry_loss_coverage: ctk.CTkEntry = ctk.CTkEntry(
            self._frame_loss_coverage,
            font=self._font,
            justify=ctk.CENTER,
            state=Entry.READ_ONLY,
            textvariable=self._entry_loss_coverage_strvar,
        )
        self._entry_loss_coverage.pack(padx=20, side=ctk.LEFT, fill=ctk.X, expand=True)
        self._entry_loss_coverage.bind(
            FOCUS_IN, lambda *args: self.__entry_numeric_add_bindings(*args, entry=self._entry_loss_coverage)
        )
        self._entry_loss_coverage.bind(
            FOCUS_OUT, lambda *args: self.__entry_numeric_remove_bindings(*args, entry=self._entry_loss_coverage)
        )
        self._entry_loss_coverage_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_numeric(
                *args, entry=self._entry_loss_coverage, strvar=self._entry_loss_coverage
            ),
        )
        entry_delete_insert_readonly(self._entry_loss_coverage, Entry.SALARY_DEFAULT)
        self._entry_loss_coverage.bind(KEY_RELEASE, lambda _: self.__gain_toggle_callback())

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

        self._data: Dict = None

    def _load_excel_data(self) -> None:
        workbook: xl.Book = xl.open_workbook(self._entry_file_path.get())
        sheet: xl.sheet.Sheet = workbook.sheet_by_name(Excel.SHEET_INFO)
        locale.setlocale(locale.LC_ALL, f"{LOCALE_CROATIA}.utf8")
        self._data = {
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
        self._data[Excel.GAIN] = locale.currency(round(float(sheet.cell(62, 9).value), 2), grouping=True)[:-3]
        self._data[Excel.LOSS] = locale.currency(round(float(sheet.cell(63, 9).value), 2), grouping=True)[:-3]
        self._data[Excel.INCOME_SALES] = locale.currency(round(float(sheet.cell(9, 9).value), 2), grouping=True)[:-3]
        self._data[Excel.INCOME_GOODS_AND_SERVICES] = locale.currency(
            round(float(sheet.cell(10, 9).value), 2), grouping=True
        )[:-3]
        self._data[Excel.INCOME_REST] = locale.currency(round(float(sheet.cell(12, 9).value), 2), grouping=True)[:-3]
        self._data[Excel.INCOME_CURSE] = locale.currency(round(float(sheet.cell(44, 9).value), 2), grouping=True)[:-3]
        self._data[Excel.INCOME_INTEREST] = locale.currency(round(float(sheet.cell(43, 9).value), 2), grouping=True)[
            :-3
        ]
        self._data[Excel.INCOME_STOCK] = locale.currency(round(float(sheet.cell(38, 9).value), 2), grouping=True)[:-3]
        self._data[Excel.INCOME_LOAN] = locale.currency(round(float(sheet.cell(42, 9).value), 2), grouping=True)[:-3]
        self._data[Excel.INCOME_FINANCIAL_REST] = locale.currency(
            round(float(sheet.cell(46, 9).value), 2), grouping=True
        )[:-3]
        self._data[Excel.GAIN_BEFORE_TAX] = locale.currency(round(float(sheet.cell(61, 9).value), 2), grouping=True)[
            :-3
        ]
        self._data[Excel.GAIN_TAX] = locale.currency(round(float(sheet.cell(64, 9).value), 2), grouping=True)[:-3]
        gain_after_tax: float = round(float(sheet.cell(65, 9).value), 2)
        saving: float = round(gain_after_tax * 0.25, 2)
        gain_kept: float = gain_after_tax - saving
        self._data[Excel.GAIN_AFTER_TAX] = locale.currency(gain_after_tax, grouping=True)[:-3]
        self._data[Excel.SAVINGS] = locale.currency(saving, grouping=True)[:-3]
        self._data[Excel.GAIN_KEPT] = locale.currency(round(gain_kept, 2), grouping=True)[:-3]
        self._data[Excel.EXPENSES_CURRENT] = locale.currency(round(float(sheet.cell(60, 9).value), 2), grouping=True)[
            :-3
        ]
        self._data[Excel.EXPENSES_PREVIOUS] = locale.currency(round(float(sheet.cell(60, 8).value), 2), grouping=True)[
            :-3
        ]
        self._data[Excel.EXPENSES_DIFF] = locale.currency(
            round(float(sheet.cell(60, 9).value) - float(sheet.cell(60, 8).value), 2), grouping=True
        )[:-3]
        self._data[Excel.EXPENSES_DIFF_PERCT] = locale.currency(
            round(
                (float(sheet.cell(60, 9).value) - float(sheet.cell(60, 8).value))
                / (float(sheet.cell(60, 9).value) * 100),
                2,
            ),
            grouping=True,
        )[:-3]

        sheet = workbook.sheet_by_name(Excel.SHEET_BALANCE)
        self._data[Excel.BALANCE] = locale.currency(round(float(sheet.cell(133, 9).value), 2), grouping=True)[:-3]

        self._data[Excel.TOTAL_GAIN] = locale.currency(Entry.SALARY_DEFAULT, grouping=True)[:-3]
        self._data[Excel.PAYOUT] = locale.currency(Entry.SALARY_DEFAULT, grouping=True)[:-3]
        self._data[Excel.KEPT_FOR_LOSS_COVERAGE] = locale.currency(Entry.SALARY_DEFAULT, grouping=True)[:-3]

    def _generate_reports(self) -> None:
        self._button_generate_GFI.configure(state=ctk.DISABLED)

        PDFGenerator.generate_GFI_report_1(self._data)
        self.__check_checkbox(self._checkbox_report_1)
        PDFGenerator.generate_GFI_report_2(self._data)
        self.__check_checkbox(self._checkbox_report_2)
        PDFGenerator.generate_GFI_report_3(self._data)
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
            self._load_excel_data()
            self.__validate_gain_or_loss(workbook)
        except TypeError as err:
            print(err)
        self._button_load_GFI.configure(state=ctk.DISABLED)

    def __validate_gain_or_loss(self, workbook: xl.Book) -> None:
        sheet: xl.sheet.Sheet = workbook.sheet_by_name(Excel.SHEET_RDG)
        loss: int = sheet.cell(67, 9).value
        if int(loss) > 0:
            print("LOSS")
            self._entry_loss_description.configure(state=ctk.NORMAL)
        else:
            print("NO LOSS")
            self._button_generate_GFI.configure(state=ctk.NORMAL)
            self._entry_gain.configure(state=ctk.NORMAL)
            self._entry_loss_coverage.configure(state=ctk.NORMAL)
            self._entry_payout_to_members.configure(state=ctk.NORMAL)
            self.__gain_logic_callback()

    def __check_checkbox(self, checkbox: ctk.CTkCheckBox):
        checkbox.configure(state=ctk.NORMAL)
        checkbox.select()
        checkbox.configure(state=ctk.DISABLED)

    def __entry_numeric_add_bindings(self, *args, entry: ctk.CTkEntry) -> None:
        entry.bind(BUTTON_1, "break")
        entry.bind(ARROW_LEFT, "break")
        entry.bind(ARROW_RIGHT, "break")

    def __entry_numeric_remove_bindings(self, *args, entry: ctk.CTkEntry) -> None:
        entry.unbind(BUTTON_1)
        entry.unbind(ARROW_LEFT)
        entry.unbind(ARROW_RIGHT)

    def __gain_logic_callback(self) -> None:
        try:
            print(self._data[Excel.GAIN], type(self._data[Excel.GAIN]))
            print(str(self._data[Excel.GAIN]))
            self._total_gain = locale.atof(str(self._data[Excel.GAIN]))
            self._entry_gain_strvar.trace_remove(WRITE, self._entry_gain_strvar_id)
            entry_delete_insert_readonly(self._entry_gain, str(self._total_gain))
        except Exception as e:
            print(e)

    def __validate_numeric(self, *args, **kwargs) -> None:
        entry: ctk.CTkEntry = kwargs[ENTRY]
        entry_str_var: ctk.StringVar = kwargs[STRVAR]
        last_character_index: int = entry.index(ctk.INSERT)
        item: str = entry_str_var.get()
        try:
            item_type = type(float(item))
            if item_type == type(float(1.0)):
                if re.search(TWO_DECIMALS_REGEX, entry.get()):
                    entry_insert_and_delete(entry, str(0.0) + entry.get()[-1])
                elif re.search(ONE_DECIMAL_REGEX, entry.get()):
                    entry_insert_and_delete(entry, str(0) + DOT + entry.get()[len(entry.get()) - 2 :])
                elif re.search(BACKSPACE_TWO_DECIMAL_REGEX, entry.get()):
                    entry_insert_and_delete(entry, str(0) + DOT + entry.get()[0] + entry.get()[-1])
                elif re.search(BACKSPACE_ONE_DECIMAL_REGEX, entry.get()):
                    entry_insert_and_delete(entry, str(0.00))
                else:
                    digits: List = [digit for digit in entry.get() if digit.isdigit()]
                    output: str = EMPTY_STRING
                    for index in range(len(digits) - 2):
                        if index == 0 and digits[index] == str(0):
                            pass
                        else:
                            output += digits[index]
                    output += DOT + digits[-2] + digits[-1]
                    entry_insert_and_delete(entry, output)
        except:
            entry.delete(last_character_index - 1, last_character_index)
        if entry_str_var.get() == "":
            entry_insert_and_delete(entry, Entry.SALARY_DEFAULT)

    def __gain_toggle_callback(self, *args) -> None:
        self._payout_to_members = float(self._entry_payout_to_members.get())
        self._loss_coverage = float(self._entry_loss_coverage.get())
        toggled_value = self._total_gain - self._payout_to_members - self._loss_coverage
        print(self._total_gain, self._payout_to_members, self._loss_coverage, toggled_value)
        entry_delete_insert_readonly(self._entry_gain, str(round(float(toggled_value), 2)))
        if self._entry_gain.get() == "0.0":
            entry_delete_insert_readonly(self._entry_gain, Entry.SALARY_DEFAULT)
        self._data[Excel.TOTAL_GAIN] = locale.currency(float(self._entry_gain.get()), grouping=True)[:-3]
        self._data[Excel.PAYOUT] = locale.currency(float(self._entry_payout_to_members.get()), grouping=True)[:-3]
        self._data[Excel.KEPT_FOR_LOSS_COVERAGE] = locale.currency(
            float(self._entry_loss_coverage.get()), grouping=True
        )[:-3]
