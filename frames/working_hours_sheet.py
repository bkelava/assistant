import customtkinter as ctk
import tkinter.messagebox as tkMessageBox

from typing import Dict

import constants.buttons as Btn
import constants.colors as Color
import constants.combobox as Cb
import constants.fonts as Font
import constants.label as Label
import constants.message_box as MessageBox

from constants.specials import EMPTY_STRING
from constants.working_hours_sheet_pdf import *
from database import DatabaseHandler
from pdf import PDFGenerator

from .program_frame import ProgramFrame


class WorkingHoursSheetFrame(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(WorkingHoursSheetFrame, self).__init__(*args, **kwargs)

        self.configure(fg_color=Color.BLUE_1529)
        self._set_up_grid(20, 20)
        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        self._reset_to_defaults: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.RESET_TO_DEFAULTS,
            font=self._font,
            command=self.__set_defaults,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._reset_to_defaults.grid(padx=10, pady=10, column=0, row=0, columnspan=5, sticky=ctk.NSEW)

        self._button_validate_contract: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.VALIDATE_CONTRACT,
            font=self._font,
            command=self.__validate_input_fields,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_validate_contract.grid(padx=(0, 10), pady=10, column=5, row=0, columnspan=5, sticky=ctk.NSEW)

        self._button_generate_pdf: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.GENERATE_PDF,
            font=self._font,
            state=ctk.DISABLED,
            command=self.__generate_pdf,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_generate_pdf.grid(
            padx=(0, 10),
            pady=10,
            column=10,
            row=0,
            columnspan=5,
            sticky=ctk.NSEW,
        )

        self._button_print: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.PRINT,
            font=self._font,
            state=ctk.DISABLED,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_print.grid(
            padx=(0, 10),
            pady=10,
            column=15,
            row=0,
            columnspan=5,
            sticky=ctk.NSEW,
        )

        self._frame: ctk.CTkScrollableFrame = ctk.CTkScrollableFrame(self, fg_color=Color.BLACK_1529)
        self._frame.grid(
            padx=10,
            pady=(0, 10),
            column=0,
            row=1,
            rowspan=19,
            columnspan=20,
            sticky=ctk.NSEW,
        )

        self.__generate_form(self._frame)

    def __generate_pdf(self) -> None:
        data: Dict = {
            EMPLOYER: self.__combobox_employers.get(),
            EMPLOYEE: self.__combobox_employees.get(),
            MONTH: int(self.__combobox_month.get()),
            YEAR: int(self.__combobox_years.get()),
        }

        PDFGenerator.generate_working_hours_sheet(data)

    def __set_defaults(self) -> None:
        self.__combobox_employers.set(EMPTY_STRING)
        self.__combobox_employees.set(EMPTY_STRING)
        self.__combobox_employees.configure(values=[])
        self.__combobox_month.set(EMPTY_STRING)
        self.__combobox_years.set(EMPTY_STRING)
        self._button_generate_pdf.configure(state=ctk.DISABLED)

    def __validate_input_fields(self) -> None:
        if (
            self.__combobox_employers.get() == EMPTY_STRING
            or self.__combobox_employees.get() == EMPTY_STRING
            or self.__combobox_years.get() == EMPTY_STRING
            or self.__combobox_month.get() == EMPTY_STRING
        ):
            tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE_SHORT)
            return
        else:
            tkMessageBox.showinfo(MessageBox.VALIDATION_INFO_TITLE, MessageBox.VALIDATION_INFO_MESSAGE)
            self._button_generate_pdf.configure(state=ctk.NORMAL)

    def __generate_form(self, container: ctk.CTkScrollableFrame) -> None:
        _form_font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_14,
            weight=Font.BOLD,
        )

        frame_employer: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_employer: ctk.CTkLabel = ctk.CTkLabel(frame_employer, width=500, text=Label.EMPLOYER, font=_form_font)
        self.__combobox_employers: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_employer,
            font=_form_font,
            values=DatabaseHandler.get_list_of_employer_names(),
            state=Cb.READ_ONLY,
            command=lambda choice: self.__populate_employer_info(
                choice=choice,
            ),
            justify=ctk.CENTER,
        )

        frame_employee: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_employee: ctk.CTkLabel = ctk.CTkLabel(frame_employee, width=500, text=Label.EMPLOYEE, font=_form_font)
        self.__combobox_employees: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_employee,
            font=_form_font,
            values=[],
            state=Cb.READ_ONLY,
            # command=lambda choice: self.__populate_employee_info(
            #     choice=choice,
            # ),
            justify=ctk.CENTER,
        )

        frame_month: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_month: ctk.CTkLabel = ctk.CTkLabel(frame_month, width=500, text=Label.MONTH, font=_form_font)
        self.__combobox_month: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_month,
            font=_form_font,
            values=Cb.NUMBERS_1_TO_12,
            state=Cb.READ_ONLY,
            justify=ctk.CENTER,
        )

        frame_year: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_year: ctk.CTkLabel = ctk.CTkLabel(frame_year, width=500, text=Label.YEAR, font=_form_font)
        self.__combobox_years: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_year,
            font=_form_font,
            values=Cb.YEARS,
            state=Cb.READ_ONLY,
            justify=ctk.CENTER,
        )

        frame_employer.pack(padx=100, pady=(100, 50), side=ctk.TOP, anchor=ctk.NE, fill=ctk.X)
        label_employer.pack(pady=25, side=ctk.LEFT, fill=ctk.X)
        self.__combobox_employers.pack(padx=50, pady=25, side=ctk.LEFT, expand=True, fill=ctk.X)

        frame_employee.pack(padx=100, pady=(0), side=ctk.TOP, anchor=ctk.NE, fill=ctk.X)
        label_employee.pack(pady=25, side=ctk.LEFT, fill=ctk.X)
        self.__combobox_employees.pack(padx=50, pady=25, side=ctk.LEFT, expand=True, fill=ctk.X)

        frame_year.pack(padx=100, pady=50, side=ctk.TOP, anchor=ctk.NE, fill=ctk.X)
        label_year.pack(pady=25, side=ctk.LEFT)
        self.__combobox_years.pack(padx=50, pady=25, side=ctk.LEFT, expand=True, fill=ctk.X)

        frame_month.pack(padx=100, pady=(0, 50), side=ctk.TOP, anchor=ctk.NE, fill=ctk.X)
        label_month.pack(pady=25, side=ctk.LEFT)
        self.__combobox_month.pack(padx=50, pady=25, side=ctk.LEFT, expand=True, fill=ctk.X)

    # def __populate_employee_info(self, choice: str) -> None:
    #     self.__combobox_employees.set(parse_employee_name_and_lastname_from_string(choice))

    def __populate_employer_info(self, choice: str) -> None:
        employees = DatabaseHandler.get_list_of_employee_names_with_personal_id_from_company_name(choice)
        self.__combobox_employees.set(EMPTY_STRING)
        self.__combobox_employees.configure(values=employees)
