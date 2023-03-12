import customtkinter as ctk
import datetime
import tkinter.messagebox as tkMessageBox

from tkcalendar import DateEntry
from typing import Dict

import constants.application as App
import constants.buttons as Btn
import constants.colors as Color
import constants.combobox as Cb
import constants.contract_anex_a1 as A1
import constants.date_entry as De
import constants.entry as Entry
import constants.fonts as Font
import constants.message_box as MessageBox

from constants.bindings import BUTTON_4, BUTTON_5, KEY_RELEASE
from constants.contract_anex_a1_pdf import *
from constants.specials import EMPTY_STRING, LOCALE_CROATIA, DATE_FORMAT
from database import DatabaseHandler
from pdf import PDFGenerator
from utils import (
    entry_insert_and_delete,
    entry_delete_insert_readonly,
    parse_personal_id_from_string,
    parse_employee_name_and_lastname_from_string,
)
from .program_frame import ProgramFrame


class ContractAnexA1(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(ProgramFrame, self).__init__(*args, **kwargs)
        self._set_up_grid(App.APP_GRID_SIZE, App.APP_GRID_SIZE)
        self.configure(fg_color=Color.BLUE_1529)

        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        self.__reset_to_defaults: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.RESET_TO_DEFAULTS,
            font=self._font,
            command=self.__set_defaults,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self.__reset_to_defaults.grid(padx=10, pady=10, column=0, row=0, columnspan=5, sticky=ctk.NSEW)

        self.__button_validate_contract: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.VALIDATE_CONTRACT,
            font=self._font,
            command=self.__validate_input_fields,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self.__button_validate_contract.grid(padx=(0, 10), pady=10, column=5, row=0, columnspan=5, sticky=ctk.NSEW)

        self.__button_generate_pdf: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.GENERATE_PDF,
            font=self._font,
            state=ctk.DISABLED,
            command=self.__generate_pdf,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self.__button_generate_pdf.grid(
            padx=(0, 10),
            pady=10,
            column=10,
            row=0,
            columnspan=5,
            sticky=ctk.NSEW,
        )

        self.__button_print: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.PRINT,
            font=self._font,
            state=ctk.DISABLED,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self.__button_print.grid(
            padx=(0, 10),
            pady=10,
            column=15,
            row=0,
            columnspan=5,
            sticky=ctk.NSEW,
        )

        self.__contract_frame: ctk.CTkScrollableFrame = ctk.CTkScrollableFrame(self, fg_color=Color.BLACK_1529)
        self.__contract_frame.grid(
            padx=10,
            pady=(0, 10),
            column=0,
            row=1,
            rowspan=19,
            columnspan=20,
            sticky=ctk.NSEW,
        )
        self.__contract_frame.bind(BUTTON_4, lambda _: self.scroll_up())
        self.__contract_frame.bind(BUTTON_5, lambda _: self.scroll_down())

        self.__generate_contract_form(self.__contract_frame)

    def __generate_contract_form(self, container: ctk.CTkFrame) -> None:
        form_font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_14,
            weight=Font.BOLD,
        )

        frame_1: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        self.__combobox_employers: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_1,
            font=form_font,
            values=DatabaseHandler.get_list_of_employer_names(),
            state=Cb.READ_ONLY,
            command=lambda choice: self.__populate_employer_info(
                choice=choice,
            ),
            justify=ctk.CENTER,
        )
        self.__entry_employer_info: ctk.CTkEntry = ctk.CTkEntry(
            frame_1, font=form_font, justify=ctk.CENTER, state=Entry.READ_ONLY
        )
        label_1: ctk.CTkLabel = ctk.CTkLabel(frame_1, font=form_font, text=A1.label_1)
        self.__entry_director: ctk.CTkEntry = ctk.CTkEntry(
            frame_1, font=form_font, justify=ctk.CENTER, state=Entry.READ_ONLY
        )
        label_2: ctk.CTkLabel = ctk.CTkLabel(frame_1, font=form_font, text=A1.label_2)

        label_3: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_3)

        frame_2: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        self.__combobox_employees: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_2,
            font=form_font,
            values=[],
            state=Cb.READ_ONLY,
            command=lambda choice: self.__populate_employee_info(
                choice=choice,
            ),
            justify=ctk.CENTER,
        )
        self.__entry_employee_personal_id: ctk.CTkEntry = ctk.CTkEntry(
            frame_2, font=form_font, justify=ctk.CENTER, state=Entry.READ_ONLY
        )
        label_4: ctk.CTkLabel = ctk.CTkLabel(frame_2, font=form_font, text=A1.label_4)

        label_5: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_5)
        label_6: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_6)
        label_7: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_7)
        label_8: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_8)
        frame_3: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)

        label_9: ctk.CTkLabel = ctk.CTkLabel(frame_3, font=form_font, text=A1.label_9)
        self.__date_entry_original_contract: DateEntry = DateEntry(
            frame_3,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            state=De.READ_ONLY,
            justify=ctk.CENTER,
            locale=LOCALE_CROATIA,
        )
        label_10: ctk.CTkLabel = ctk.CTkLabel(frame_3, font=form_font, text=A1.label_10)
        self.__combobox_contract_type: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_3,
            font=form_font,
            values=Cb.CONTRACT_TYPE,
            state=Cb.READ_ONLY,
            justify=ctk.CENTER,
        )
        self.__combobox_contract_type.set(Cb.CONTRACT_TYPE[0])

        frame_4: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_11: ctk.CTkLabel = ctk.CTkLabel(frame_4, font=form_font, text=A1.label_11)
        self.__date_entry_anex_end_date: DateEntry = DateEntry(
            frame_4,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            state=De.READ_ONLY,
            justify=ctk.CENTER,
            locale=LOCALE_CROATIA,
        )
        label_12: ctk.CTkLabel = ctk.CTkLabel(frame_4, font=form_font, text=A1.label_12)
        label_13: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_13)
        label_14: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_14)

        frame_5: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_15: ctk.CTkLabel = ctk.CTkLabel(frame_5, font=form_font, text=A1.label_15)
        self.__entry_working_place: ctk.CTkEntry = ctk.CTkEntry(frame_5, font=form_font, justify=ctk.CENTER)
        label_16_1: ctk.CTkLabel = ctk.CTkLabel(frame_5, font=form_font, text=A1.label_16_1)

        label_16_2: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_16_2)
        label_17: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_17)

        label_18_1: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_18_1)
        label_18_2: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_18_2)

        frame_6: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_19: ctk.CTkLabel = ctk.CTkLabel(frame_6, font=form_font, text=A1.label_19)
        self.__entry_job_description: ctk.CTkEntry = ctk.CTkEntry(frame_6, font=form_font, justify=ctk.CENTER)
        label_20_1: ctk.CTkLabel = ctk.CTkLabel(frame_6, font=form_font, text=A1.label_20_1)

        label_20_2: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_20_2)
        label_20_3: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_20_3)
        label_21: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_21)
        label_22: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_22)
        label_23: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_23)
        label_24: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_24)
        label_25_1: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_25_1)
        label_25_2: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_25_2)
        label_26: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_26)
        label_27: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_27)
        label_28: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_28)
        label_29: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_29)
        label_30_1: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_30_1)
        label_30_2: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_30_2)
        label_30_3: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_30_3)
        label_31: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_31)
        label_32_1: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_32_1)
        label_32_2: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_32_2)
        label_33_1: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_33_1)
        label_33_2: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_33_2)
        label_34: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_34)
        label_35: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_35)
        label_36: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_36)
        label_37_1: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_37_1)

        frame_7: ctk.CTkFrame = ctk.CTkFrame(container)
        self.__combobox_court: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_7,
            font=form_font,
            values=Cb.CONTRACT_TYPE,
            state=Cb.READ_ONLY,
            justify=ctk.CENTER,
        )
        label_37_2: ctk.CTkLabel = ctk.CTkLabel(frame_7, font=form_font, text=A1.label_37_2)

        label_38: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_38)
        label_39: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_39)
        label_40: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_40)
        label_41_1: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_41_1)
        label_41_2: ctk.CTkLabel = ctk.CTkLabel(container, font=form_font, text=A1.label_41_2)

        frame_8: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_42: ctk.CTkLabel = ctk.CTkLabel(frame_8, font=form_font, text=A1.label_42)
        self.__entry_contract_signature_place: ctk.CTkEntry = ctk.CTkEntry(frame_8, font=form_font, justify=ctk.CENTER)
        label_43: ctk.CTkLabel = ctk.CTkLabel(frame_8, font=form_font, text=A1.label_43)
        self.__date_entry_anex_date: DateEntry = DateEntry(
            frame_8,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            state=De.READ_ONLY,
            justify=ctk.CENTER,
            locale=LOCALE_CROATIA,
        )
        label_44: ctk.CTkLabel = ctk.CTkLabel(frame_8, font=form_font, text=A1.label_44)

        frame_9: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)

        frame_1.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        self.__combobox_employers.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        self.__entry_employer_info.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_1.pack(padx=10, pady=10, side=ctk.LEFT)
        self.__entry_director.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_2.pack(padx=10, pady=10, side=ctk.LEFT)
        label_3.pack(padx=10, pady=10, side=ctk.TOP)
        frame_2.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        self.__combobox_employees.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        self.__entry_employee_personal_id.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_4.pack(padx=10, pady=10, side=ctk.LEFT)
        label_5.pack(padx=10, pady=10, side=ctk.TOP)
        label_6.pack(padx=10, pady=10, side=ctk.TOP)
        label_7.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.W)
        label_8.pack(padx=10, pady=10, side=ctk.TOP)
        frame_3.pack(padx=10, pady=(10, 0), side=ctk.TOP, fill=ctk.X)
        label_9.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X)
        self.__date_entry_original_contract.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_10.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X)
        self.__combobox_contract_type.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        frame_4.pack(padx=10, side=ctk.TOP, fill=ctk.X)
        label_11.pack(padx=10, side=ctk.LEFT)
        self.__date_entry_anex_end_date.pack(padx=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_12.pack(padx=10, side=ctk.LEFT)
        label_13.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.W)
        label_14.pack(padx=10, pady=10, side=ctk.TOP)
        frame_5.pack(padx=10, pady=(10, 0), side=ctk.TOP, fill=ctk.X)
        label_15.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X)
        self.__entry_working_place.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        entry_insert_and_delete(self.__entry_working_place, Entry.WORK_PLACE_DEFAULT)
        label_16_1.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X)
        label_16_2.pack(padx=20, pady=(0, 10), side=ctk.TOP, anchor=ctk.W)
        label_17.pack(padx=10, pady=(10, 0), side=ctk.TOP, fill=ctk.X)
        label_18_1.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_18_2.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        frame_6.pack(padx=10, side=ctk.TOP, fill=ctk.X)
        label_19.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X)
        self.__entry_job_description.pack(padx=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        entry_insert_and_delete(self.__entry_job_description, Entry.JOB_DESCRIPTION_DEFAULT)
        label_20_1.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X)
        label_20_2.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_20_3.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_21.pack(padx=10, pady=10, side=ctk.TOP)
        label_22.pack(padx=20, anchor=ctk.W, side=ctk.TOP)
        label_23.pack(padx=20, pady=(0, 10), side=ctk.TOP, anchor=ctk.W)
        label_24.pack(padx=10, pady=10, side=ctk.TOP)
        label_25_1.pack(padx=20, pady=(10, 0), side=ctk.TOP, anchor=ctk.W)
        label_25_2.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_26.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_27.pack(padx=10, pady=10, side=ctk.TOP)
        label_28.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.W)
        label_29.pack(padx=10, pady=10, side=ctk.TOP)
        label_30_1.pack(padx=20, pady=(10, 0), side=ctk.TOP, anchor=ctk.W)
        label_30_2.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_30_2.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_30_3.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_31.pack(padx=10, pady=10, side=ctk.TOP)
        label_32_1.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_32_2.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_33_1.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_33_2.pack(padx=20, side=ctk.TOP, anchor=ctk.W)
        label_34.pack(padx=10, pady=10, side=ctk.TOP)
        label_35.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.W)
        label_36.pack(padx=10, pady=10, side=ctk.TOP)
        label_37_1.pack(padx=20, pady=(10, 0), side=ctk.TOP, anchor=ctk.W)
        frame_7.pack(padx=10, side=ctk.TOP, fill=ctk.X)
        label_37_2.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X)
        self.__combobox_court.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X)
        self.__combobox_court.set(Cb.COURTS[14])
        label_38.pack(padx=10, pady=10, side=ctk.TOP)
        label_39.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.W)
        label_40.pack(padx=10, pady=10, side=ctk.TOP)
        label_41_1.pack(padx=20, pady=(10, 0), side=ctk.TOP, anchor=ctk.W)
        label_41_2.pack(padx=20, pady=(0, 10), side=ctk.TOP, anchor=ctk.W)
        frame_8.pack(padx=10, pady=20, side=ctk.TOP, fill=ctk.X)
        label_42.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X)
        self.__entry_contract_signature_place.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        entry_insert_and_delete(self.__entry_contract_signature_place, Entry.PLACE_DEFAULT)
        label_43.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X)
        self.__date_entry_anex_date.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_44.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X)
        frame_9.pack(pady=100, side=ctk.TOP)

        self.__entry_working_place.bind(KEY_RELEASE, lambda _: self.__disable_generate_pdf_button())
        self.__entry_job_description.bind(KEY_RELEASE, lambda _: self.__disable_generate_pdf_button())
        self.__entry_contract_signature_place.bind(KEY_RELEASE, lambda _: self.__disable_generate_pdf_button())

    def __generate_pdf(self) -> None:
        data: Dict = {
            EMPLOYER: self.__combobox_employers.get(),
            EMPLOYER_INFO: self.__entry_employer_info.get(),
            EMPLOYER_DIRECTOR: self.__entry_director.get(),
            EMPLOYEE: self.__combobox_employees.get(),
            EMPLOYEE_PERSONAL_ID: self.__entry_employee_personal_id.get(),
            CONTRACT_DATE: str((self.__date_entry_original_contract.get_date()).strftime(DATE_FORMAT)),
            CONTRACT_TYPE: self.__combobox_contract_type.get(),
            ANEX_END_DATE: str((self.__date_entry_anex_end_date.get_date()).strftime(DATE_FORMAT)),
            WORKING_PLACE: self.__entry_working_place.get(),
            JOB_DESCRIPTION: self.__entry_job_description.get(),
            COURT: self.__combobox_court.get(),
            SIGNATURE_PLACE: self.__entry_contract_signature_place.get(),
            SIGNATURE_DATE: str((self.__date_entry_anex_date.get_date()).strftime(DATE_FORMAT)),
        }
        PDFGenerator.generate_anex_for_a1(data)

    def __set_defaults(self) -> None:
        self.__combobox_employers.set(EMPTY_STRING)
        entry_delete_insert_readonly(self.__entry_employer_info)
        entry_delete_insert_readonly(self.__entry_director)
        self.__combobox_employees.configure(values=[])
        self.__combobox_employees.set(EMPTY_STRING)
        entry_delete_insert_readonly(self.__entry_employee_personal_id)
        self.__date_entry_original_contract.set_date(datetime.date.today())
        self.__combobox_contract_type.set(Cb.CONTRACT_TYPE[0])
        self.__date_entry_anex_end_date.set_date(datetime.date.today())
        entry_insert_and_delete(self.__entry_working_place, Entry.WORK_PLACE_DEFAULT)
        entry_insert_and_delete(self.__entry_job_description, Entry.JOB_DESCRIPTION_DEFAULT)
        self.__combobox_court.set(Cb.COURTS[14])
        entry_insert_and_delete(self.__entry_contract_signature_place, Entry.PLACE_DEFAULT)
        self.__date_entry_anex_end_date.set_date(datetime.date.today())

        self.__button_generate_pdf.configure(state=ctk.DISABLED)

    def __validate_input_fields(self) -> None:
        if (
            self.__combobox_employers.get() == EMPTY_STRING
            or self.__combobox_employees.get() == EMPTY_STRING
            or self.__combobox_contract_type.get() == EMPTY_STRING
            or self.__entry_working_place.get() == EMPTY_STRING
            or self.__entry_job_description.get() == EMPTY_STRING
            or self.__combobox_contract_type.get() == EMPTY_STRING
            or self.__entry_contract_signature_place.get() == EMPTY_STRING
        ):
            tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE)
            self.__button_generate_pdf.configure(state=ctk.DISABLED)
            return
        else:
            tkMessageBox.showinfo(MessageBox.VALIDATION_INFO_TITLE, MessageBox.VALIDATION_INFO_MESSAGE)
            self.__button_generate_pdf.configure(state=ctk.NORMAL)

    def __disable_generate_pdf_button(self) -> None:
        self.__button_generate_pdf.configure(state=ctk.DISABLED)

    def __populate_employee_info(self, choice) -> None:
        personal_id = parse_personal_id_from_string(choice)
        entry_delete_insert_readonly(self.__entry_employee_personal_id, personal_id)
        self.__combobox_employees.set(parse_employee_name_and_lastname_from_string(choice))

    def __populate_employer_info(self, choice: str) -> None:
        address: str = DatabaseHandler.get_company_info(choice)
        entry_delete_insert_readonly(self.__entry_employer_info, address)

        director: str = DatabaseHandler.get_company_director_from_company_name(choice)
        entry_delete_insert_readonly(self.__entry_director, director)

        employees = DatabaseHandler.get_list_of_employee_names_with_personal_id_from_company_name(choice)

        entry_delete_insert_readonly(self.__entry_employee_personal_id)
        self.__combobox_employees.set(EMPTY_STRING)
        self.__combobox_employees.configure(values=employees)

    def scroll_up(self) -> None:
        self.__contract_frame._parent_canvas.yview_scroll(-1, ctk.UNITS)

    def scroll_down(self) -> None:
        self.__contract_frame._parent_canvas.yview_scroll(1, ctk.UNITS)
