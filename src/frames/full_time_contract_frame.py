import customtkinter as ctk
import datetime
import os
import re
import tkinter.messagebox as tkMessageBox

from tkcalendar import DateEntry
from typing import Dict, List

import src.constants.application as App
import src.constants.buttons as Btn
import src.constants.checkbox as Chbx
import src.constants.colors as Color
import src.constants.combobox as Cb
import src.constants.date_entry as De
import src.constants.entry as Entry
import src.constants.fonts as Font
import src.constants.message_box as MessageBox
import src.constants.full_time_contract as FTC

from src.database import DatabaseHandler
from src.constants.bindings import (
    ARROW_LEFT,
    ARROW_RIGHT,
    BUTTON_1,
    BUTTON_4,
    BUTTON_5,
    FOCUS_IN,
    FOCUS_OUT,
    KEY_RELEASE,
)
from src.constants.contract_pdf import *
from src.constants.regex import (
    TWO_DECIMALS_REGEX,
    ONE_DECIMAL_REGEX,
    BACKSPACE_TWO_DECIMAL_REGEX,
    BACKSPACE_ONE_DECIMAL_REGEX,
)
from src.constants.specials import *
from src.pdf import PDFGenerator
from src.utils import (
    parse_personal_id_from_string,
    parse_employee_name_and_lastname_from_string,
    entry_insert_and_delete,
    entry_delete_insert_readonly,
)
from src.widgets import FloatSpinbox, TimePicker

from .program_frame import ProgramFrame


class FullTimeContractFrame(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(FullTimeContractFrame, self).__init__(*args, **kwargs)

        self.configure(fg_color=Color.BLUE_1529)
        self._set_up_grid(20, 20)
        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )
        self.__employees: List[Dict] = []

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
            text=Btn.GENERATE_GFI,
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

    def __generate_pdf(self) -> None:
        data: Dict = {
            EMPLOYERS: self.__combobox_employers.get(),
            EMPLOYER_INFO: self.__entry_employer_info.get(),
            DIRECTOR: self.__entry_director.get(),
            EMPLOYEES: self.__combobox_employees.get(),
            EMPLOYEE_PERSONAL_ID: self.__entry_employee_personal_id.get(),
            CONTRACT_DATE: str((self.__date_entry_contract_date.get_date()).strftime(DATE_FORMAT)),
            JOB_DESCRIPTION: self.__entry_job_description.get(),
            TRAIL_NUMBERS: self.__combobox_select_trail_numbers.get(),
            TRAIL_OPTION: self.__combobox_select_trail_option.get(),
            WORKING_PLACE: self.__entry_working_place.get(),
            SALARY: self.__entry_salary.get(),
            SALARY_BONUS: self.__entry_salary_bonus.get(),
            SALARY_INCREMENT_1: self.__entry_salary_increment_1.get(),
            SALARY_INCREMENT_2: self.__entry_salary_increment_2.get(),
            SALARY_INCREMENT_3: self.__entry_salary_increment_3.get(),
            SALARY_INCREMENT_4: self.__entry_salary_increment_4.get(),
            SALARY_INCREMENT_5: self.__entry_salary_increment_5.get(),
            SALARY_INCREMENT_6: self.__entry_salary_increment_6.get(),
            WORK_TYPE: self.__combobox_work_type.get(),
            WEEKLY_WORKING_HOURS: self.__spinbox_weekly_working_hours.get(),
            WEEKLY_TIME_OFF: self.__combobox_weekly_time_off.get(),
            VACATION: self.__combobox_vacation.get(),
            VACATION_DESCRIPTION: self.__entry_vacation_description.get(),
            CONTRACT_TERMINATION_EMPLOYER: self.__spinbox_contract_termination_employer.get(),
            CONTRACT_TERMINATION_EMPLOYEE: self.__spinbox_contract_termination_employee.get(),
            RIGHTS_AND_OBLIGATIONS: self.__entry_rights_and_obligations.get(),
            COURT: self.__combobox_court.get(),
        }
        if str(self.__date_entry_start_date.cget("state")) == De.DISABLED:
            data[START_DATE] = EMPTY_STRING
        else:
            data[START_DATE] = str((self.__date_entry_start_date.get_date()).strftime(DATE_FORMAT))
        data[START_DATE_DESCRIPTION] = self.__entry_start_job_description.get()

        if str(self.__date_entry_contract_starting_with.cget("state")) == De.DISABLED:
            data[CONTRACT_STARTING_WITH] = EMPTY_STRING
        else:
            data[CONTRACT_STARTING_WITH] = str(
                (self.__date_entry_contract_starting_with.get_date()).strftime(DATE_FORMAT)
            )
        data[CONTRACT_START_WITH_DESCRIPTION] = self.__entry_contract_starts_with_description.get()

        data[WORKING_SHIFT] = self.__combobox_working_shift.get()
        if (
            self.__combobox_working_shift.get() == Cb.WORK_TIME_SHIFT[0]
            or self.__combobox_working_shift.get() == Cb.WORK_TIME_SHIFT[2]
        ):
            data[WORKING_TIME_START] = self.__time_picker_working_time_start.get()
            data[WORKING_TIME_END] = self.__time_picker_working_time_end.get()
            data[WORKING_SHIFT_DESCRIPTION] = EMPTY_STRING
        else:
            data[WORKING_SHIFT_DESCRIPTION] = self.__entry_working_shift_description.get()
            data[WORKING_TIME_START] = EMPTY_STRING
            data[WORKING_TIME_END] = EMPTY_STRING

        PDFGenerator.generate_full_time_contract(data)

        tkMessageBox.showinfo(
            MessageBox.GENERATE_CONRACT_SUCCESSFULL_TITLE, MessageBox.GENERATE_CONRACT_SUCCESSFULL_MESSAGE + os.getcwd()
        )

    def __validate_input_fields(self) -> None:
        if str(self.__entry_start_job_description.cget("state")) == De.WRITE:
            if self.__entry_start_job_description.get() != EMPTY_STRING:
                pass
            else:
                tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE)
                return

        if str(self.__entry_contract_starts_with_description.cget("state")) == De.WRITE:
            if self.__entry_contract_starts_with_description.get() != EMPTY_STRING:
                pass
            else:
                tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE)
                return

        if (
            self.__combobox_employers.get() == EMPTY_STRING
            or self.__combobox_employees.get() == EMPTY_STRING
            or self.__entry_working_place.get() == EMPTY_STRING
            or self.__entry_job_description.get() == EMPTY_STRING
            or self.__entry_working_place.get() == EMPTY_STRING
            or self.__entry_vacation_description.get() == EMPTY_STRING
            or self.__entry_rights_and_obligations.get() == EMPTY_STRING
        ):
            tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE)
        else:
            if self.__entry_working_shift_description.winfo_ismapped():
                if self.__entry_working_shift_description.get() == EMPTY_STRING:
                    tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE)
                else:
                    tkMessageBox.showinfo(MessageBox.VALIDATION_INFO_TITLE, MessageBox.VALIDATION_INFO_MESSAGE)
                    self.__button_generate_pdf.configure(state=ctk.NORMAL)
            else:
                tkMessageBox.showinfo(MessageBox.VALIDATION_INFO_TITLE, MessageBox.VALIDATION_INFO_MESSAGE)
                self.__button_generate_pdf.configure(state=ctk.NORMAL)

    def __set_defaults(self) -> None:
        self.__combobox_employers.set(EMPTY_STRING)
        entry_delete_insert_readonly(self.__entry_employer_info)
        entry_delete_insert_readonly(self.__entry_director)
        self.__combobox_employees.set(EMPTY_STRING)
        self.__combobox_employees.configure(values=[])
        entry_delete_insert_readonly(self.__entry_employee_personal_id)
        self.__date_entry_contract_date.set_date(datetime.date.today())

        entry_insert_and_delete(self.__entry_job_description, Entry.JOB_DESCRIPTION_DEFAULT)
        self.__combobox_select_trail_numbers.set(Cb.NUMBERS_1_TO_30[1])
        self.__combobox_select_trail_numbers.configure(values=Cb.NUMBERS_1_TO_30)
        self.__combobox_select_trail_option.set(Cb.TRAIL_OPTIONS[0])
        self.__combobox_select_trail_option.configure(values=Cb.TRAIL_OPTIONS)
        entry_delete_insert_readonly(self.__entry_working_place, Entry.WORK_PLACE_DEFAULT)
        self.__checkbox_start_job_date.configure(state=ctk.NORMAL)
        self.__checkbox_start_job_description.configure(state=ctk.NORMAL)
        self.__checkbox_start_job_date.select()
        self.__checkbox_start_job_description.deselect()
        self.__toggle_description_checkbox(
            checkbox=self.__checkbox_start_job_date,
            strvar=self.__checkbox_start_job_description_strvar,
            entry=self.__entry_start_job_description,
        )
        self.__date_entry_start_date.set_date(datetime.date.today())

        entry_insert_and_delete(self.__entry_salary, Entry.SALARY_DEFAULT)
        entry_insert_and_delete(self.__entry_salary_bonus, Entry.SALARY_DEFAULT)
        entry_insert_and_delete(self.__entry_salary_increment_1, Entry.PERCENTAGE_20)
        entry_insert_and_delete(self.__entry_salary_increment_2, Entry.PERCENTAGE_30)
        entry_insert_and_delete(self.__entry_salary_increment_3, Entry.PERCENTAGE_50)
        entry_insert_and_delete(self.__entry_salary_increment_4, Entry.PERCENTAGE_20)
        entry_insert_and_delete(self.__entry_salary_increment_5, Entry.PERCENTAGE_20)
        entry_insert_and_delete(self.__entry_salary_increment_6, Entry.PERCENTAGE_20)

        self.__combobox_work_type.set(Cb.WORK_TIME_TYPE[0])
        self.__validate_combobox_work_type()
        self.__combobox_working_shift.set(Cb.WORK_TIME_SHIFT[0])
        self.__validate_combobox_working_shift()
        self.__combobox_weekly_time_off.set(Cb.WEEKLY_TIME_OFF[2])
        self.__combobox_vacation.set(Cb.VACATION[16])
        entry_insert_and_delete(self.__entry_vacation_description, Entry.DASH_DEFAULT)

        self.__spinbox_contract_termination_employer.set(str(15))
        self.__spinbox_contract_termination_employee.set(str(15))

        entry_insert_and_delete(self.__entry_rights_and_obligations, Entry.RIGHTS_AND_OBLIGATIONS_DEFAULT)

        self.__combobox_court.set(Cb.COURTS[14])
        self.__date_entry_contract_starting_with.set_date(datetime.date.today())
        self.__checkbox_contract_starts_with_date.configure(state=ctk.NORMAL)
        self.__checkbox_contract_starts_with_description.configure(state=ctk.NORMAL)
        self.__checkbox_contract_starts_with_date.select()
        self.__checkbox_contract_starts_with_description.deselect()
        self.__toggle_description_checkbox(
            checkbox=self.__checkbox_contract_starts_with_date,
            strvar=self.__checkbox_contract_starts_with_description_strvar,
            entry=self.__entry_contract_starts_with_description,
        )

        self.__button_generate_pdf.configure(state=ctk.DISABLED)

    def scroll_up(self) -> None:
        self.__contract_frame._parent_canvas.yview_scroll(-1, ctk.UNITS)

    def scroll_down(self) -> None:
        self.__contract_frame._parent_canvas.yview_scroll(1, ctk.UNITS)

    def __generate_contract_form(self, container: ctk.CTkScrollableFrame) -> None:
        frame_1: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        self._form_font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_14,
            weight=Font.NORMAL,
        )

        label_1: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=FTC.label_1, font=self._form_font)
        self.__combobox_employers: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_1,
            font=self._form_font,
            values=DatabaseHandler.get_list_of_employer_names(),
            state=Cb.READ_ONLY,
            command=lambda choice: self.__populate_employer_info(
                choice=choice,
            ),
            justify=ctk.CENTER,
        )
        self.__entry_employer_info: ctk.CTkEntry = ctk.CTkEntry(
            frame_1, font=self._form_font, state=Entry.READ_ONLY, justify=ctk.CENTER
        )
        self.__entry_director: ctk.CTkEntry = ctk.CTkEntry(
            frame_1, font=self._form_font, state=Entry.READ_ONLY, justify=ctk.CENTER
        )
        lable_2: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=FTC.label_2, font=self._form_font)
        label_3: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=FTC.label_3, font=self._form_font)
        frame_2: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        self.__combobox_employees: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_2,
            font=self._form_font,
            values=[],
            state=Cb.READ_ONLY,
            command=lambda choice: self.__populate_employee_info(
                choice=choice, entry=self.__entry_employee_personal_id
            ),
            justify=ctk.CENTER,
        )
        self.__entry_employee_personal_id: ctk.CTkEntry = ctk.CTkEntry(
            frame_2, font=self._form_font, state=Entry.READ_ONLY, justify=ctk.CENTER
        )
        label_4: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=FTC.label_4, font=self._form_font)
        self.__date_entry_contract_date: DateEntry = DateEntry(
            frame_2,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            state=De.READ_ONLY,
            justify=ctk.CENTER,
            locale=LOCALE_CROATIA,
        )
        label_5: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=FTC.label_5, font=self._form_font)
        self._form_font.configure(weight=Font.NORMAL)
        label_6: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_6, font=self._form_font)
        label_7: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_7, font=self._form_font)
        label_8: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_8, font=self._form_font)
        label_9: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_9, font=self._form_font)
        self.__entry_job_description: ctk.CTkEntry = ctk.CTkEntry(container, font=self._form_font, justify=ctk.CENTER)
        self.__entry_job_description.insert(0, Entry.JOB_DESCRIPTION_DEFAULT)
        frame_3: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_10: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_10, font=self._form_font)
        self.__combobox_select_trail_numbers: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_3,
            font=self._form_font,
            values=Cb.NUMBERS_1_TO_30,
            state=Cb.READ_ONLY,
            justify=ctk.CENTER,
        )
        self.__combobox_select_trail_numbers.set(Cb.NUMBERS_1_TO_30[0])
        self.__combobox_select_trail_option_strvar: ctk.StringVar = ctk.StringVar()
        self.__combobox_select_trail_option: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_3,
            command=lambda _: self.__set_trail_connection(),
            font=self._form_font,
            values=Cb.TRAIL_OPTIONS,
            state=Cb.READ_ONLY,
            justify=ctk.CENTER,
            variable=self.__combobox_select_trail_option_strvar,
        )
        self.__combobox_select_trail_option.set(Cb.TRAIL_OPTIONS[0])
        frame_4: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_11: ctk.CTkLabel = ctk.CTkLabel(frame_4, text=FTC.label_11, font=self._form_font)
        self.__entry_working_place: ctk.CTkEntry = ctk.CTkEntry(frame_4, font=self._form_font, justify=ctk.CENTER)
        self.__entry_working_place.insert(0, Entry.WORK_PLACE_DEFAULT)
        label_12: ctk.CTkLabel = ctk.CTkLabel(frame_4, text=FTC.label_12, font=self._form_font)
        label_13: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_13, font=self._form_font)
        frame_5: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_14: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=FTC.label_14, font=self._form_font)
        self.__checkbox_start_job_date_strvar: ctk.StringVar() = ctk.StringVar()
        self.__checkbox_start_job_date: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_5,
            text=Chbx.DATE,
            command=lambda: self.__toggle_date_checkbox(
                checkbox=self.__checkbox_start_job_description,
                strvar=self.__checkbox_start_job_date_strvar,
                date_entry=self.__date_entry_start_date,
            ),
            state=ctk.DISABLED,
            variable=self.__checkbox_start_job_date_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.__checkbox_start_job_date.select()
        self.__checkbox_start_job_description_strvar: ctk.StringVar = ctk.StringVar()
        self.__checkbox_start_job_description: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_5,
            text=Chbx.DESCRIPTION,
            command=lambda: self.__toggle_description_checkbox(
                checkbox=self.__checkbox_start_job_date,
                strvar=self.__checkbox_start_job_description_strvar,
                entry=self.__entry_start_job_description,
            ),
            variable=self.__checkbox_start_job_description_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.__checkbox_start_job_description.deselect()
        self.__date_entry_start_date: DateEntry = DateEntry(
            frame_5,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            justify=ctk.CENTER,
            state=De.READ_ONLY,
            locale=LOCALE_CROATIA,
        )
        self.__entry_start_job_description: ctk.CTkEntry = ctk.CTkEntry(
            frame_5, font=self._form_font, justify=ctk.CENTER, state=Entry.READ_ONLY
        )

        label_15: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_15, font=self._form_font)
        frame_6: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_16: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=FTC.label_16, font=self._form_font)
        self.__entry_salary_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary: ctk.CTkEntry = ctk.CTkEntry(
            frame_6, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_strvar
        )
        self.__entry_salary.insert(0, Entry.SALARY_DEFAULT)
        self.__entry_salary.bind(
            FOCUS_IN, lambda *args: self.__entry_numeric_add_bindings(*args, entry=self.__entry_salary)
        )
        self.__entry_salary.bind(
            FOCUS_OUT, lambda *args: self.__entry_numeric_remove_bindings(*args, entry=self.__entry_salary)
        )
        self.__entry_salary_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_numeric(*args, entry=self.__entry_salary, strvar=self.__entry_salary_strvar),
        )
        label_17: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=FTC.label_17, font=self._form_font)
        label_18: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_18, font=self._form_font)
        frame_7: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_19: ctk.CTkLabel = ctk.CTkLabel(frame_7, text=FTC.label_19, font=self._form_font)
        self.__entry_salary_bonus_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_bonus: ctk.CTkEntry = ctk.CTkEntry(
            frame_7, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_bonus_strvar
        )
        self.__entry_salary_bonus.insert(0, Entry.SALARY_DEFAULT)
        self.__entry_salary_bonus.bind(
            FOCUS_IN, lambda *args: self.__entry_numeric_add_bindings(*args, entry=self.__entry_salary_bonus)
        )
        self.__entry_salary_bonus.bind(
            FOCUS_OUT, lambda *args: self.__entry_numeric_remove_bindings(*args, entry=self.__entry_salary_bonus)
        )
        self.__entry_salary_bonus_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_numeric(
                *args, entry=self.__entry_salary_bonus, strvar=self.__entry_salary_bonus_strvar
            ),
        )
        label_20: ctk.CTkLabel = ctk.CTkLabel(frame_7, text=FTC.label_20, font=self._form_font)
        label_21: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_21, font=self._form_font)
        frame_8: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_22: ctk.CTkLabel = ctk.CTkLabel(frame_8, text=FTC.label_22, font=self._form_font)
        self.__entry_salary_increment_1_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_1: ctk.CTkEntry = ctk.CTkEntry(
            frame_8, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_1_strvar
        )
        self.__entry_salary_increment_1_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_1, strvar=self.__entry_salary_increment_1_strvar, minimum=20
            ),
        )
        self.__entry_salary_increment_1.insert(0, Entry.PERCENTAGE_20)
        frame_9: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_23: ctk.CTkLabel = ctk.CTkLabel(frame_9, text=FTC.label_23, font=self._form_font)
        self.__entry_salary_increment_2_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_2: ctk.CTkEntry = ctk.CTkEntry(
            frame_9, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_2_strvar
        )
        self.__entry_salary_increment_2_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_2, strvar=self.__entry_salary_increment_2_strvar, minimum=30
            ),
        )
        self.__entry_salary_increment_2.insert(0, Entry.PERCENTAGE_30)
        frame_10: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_24: ctk.CTkLabel = ctk.CTkLabel(frame_10, text=FTC.label_24, font=self._form_font)
        self.__entry_salary_increment_3_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_3: ctk.CTkEntry = ctk.CTkEntry(
            frame_10, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_3_strvar
        )
        self.__entry_salary_increment_3_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_3, strvar=self.__entry_salary_increment_3_strvar, minimum=50
            ),
        )
        self.__entry_salary_increment_3.insert(0, Entry.PERCENTAGE_50)
        frame_11: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_25: ctk.CTkLabel = ctk.CTkLabel(frame_11, text=FTC.label_25, font=self._form_font)
        self.__entry_salary_increment_4_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_4: ctk.CTkEntry = ctk.CTkEntry(
            frame_11, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_4_strvar
        )
        self.__entry_salary_increment_4_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_4, strvar=self.__entry_salary_increment_4_strvar, minimum=20
            ),
        )
        self.__entry_salary_increment_4.insert(0, Entry.PERCENTAGE_20)
        frame_12: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_26: ctk.CTkLabel = ctk.CTkLabel(frame_12, text=FTC.label_26, font=self._form_font)
        self.__entry_salary_increment_5_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_5: ctk.CTkEntry = ctk.CTkEntry(
            frame_12, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_5_strvar
        )
        self.__entry_salary_increment_5_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_5, strvar=self.__entry_salary_increment_5_strvar, minimum=20
            ),
        )
        self.__entry_salary_increment_5.insert(0, Entry.PERCENTAGE_20)
        frame_13: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_27: ctk.CTkLabel = ctk.CTkLabel(frame_13, text=FTC.label_27, font=self._form_font)
        self.__entry_salary_increment_6_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_6: ctk.CTkEntry = ctk.CTkEntry(
            frame_13, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_6_strvar
        )
        self.__entry_salary_increment_6_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_6, strvar=self.__entry_salary_increment_6_strvar, minimum=20
            ),
        )
        self.__entry_salary_increment_6.insert(0, Entry.PERCENTAGE_20)
        label_28: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_28, font=self._form_font)
        label_29: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_29, font=self._form_font)
        label_30: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_30, font=self._form_font)
        frame_14: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_31: ctk.CTkLabel = ctk.CTkLabel(frame_14, text=FTC.label_31, font=self._form_font)
        self.__combobox_work_type: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_14,
            font=self._form_font,
            values=Cb.WORK_TIME_TYPE,
            state=Cb.READ_ONLY,
            command=lambda _: self.__validate_combobox_work_type(),
            justify=ctk.CENTER,
        )
        self.__combobox_work_type.set(Cb.WORK_TIME_TYPE[0])
        label_32: ctk.CTkLabel = ctk.CTkLabel(frame_14, text=FTC.label_32, font=self._form_font)
        self.__spinbox_weekly_working_hours: FloatSpinbox = FloatSpinbox(
            frame_14, width=200, step_size=0.5, numeric_type=float, start_from=40.0
        )
        self.__spinbox_weekly_working_hours._entry_str_var.trace_add(
            WRITE, lambda *args: self.__set_up_spinbox_weekly_working_hours_for_full_time(*args)
        )
        label_33: ctk.CTkLabel = ctk.CTkLabel(frame_14, text=FTC.label_33, font=self._form_font)
        frame_15: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_34: ctk.CTkLabel = ctk.CTkLabel(frame_15, text=FTC.label_34, font=self._form_font)
        self.__combobox_working_shift: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_15,
            font=self._form_font,
            values=Cb.WORK_TIME_SHIFT,
            state=Cb.READ_ONLY,
            command=lambda _: self.__validate_combobox_working_shift(),
            justify=ctk.CENTER,
        )
        self.__combobox_working_shift.set(Cb.WORK_TIME_SHIFT[0])
        self.label_35: ctk.CTkLabel = ctk.CTkLabel(frame_15, text=FTC.label_35, font=self._form_font)
        self.__time_picker_working_time_start: TimePicker = TimePicker(frame_15)
        self.__time_picker_working_time_end: TimePicker = TimePicker(frame_15)
        self.__entry_working_shift_description: ctk.CTkEntry = ctk.CTkEntry(
            frame_15, font=self._form_font, justify=ctk.CENTER
        )
        label_36: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_36, font=self._form_font)
        frame_16: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_37: ctk.CTkLabel = ctk.CTkLabel(frame_16, text=FTC.label_37, font=self._form_font)
        self.__combobox_weekly_time_off: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_16,
            font=self._form_font,
            values=Cb.WEEKLY_TIME_OFF,
            state=Cb.READ_ONLY,
            command=None,
            justify=ctk.CENTER,
        )
        self.__combobox_weekly_time_off.set(Cb.WEEKLY_TIME_OFF[2])
        frame_17: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_38: ctk.CTkLabel = ctk.CTkLabel(frame_17, text=FTC.label_38, font=self._form_font)
        self.__combobox_vacation: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_17, font=self._form_font, values=Cb.VACATION, state=Cb.READ_ONLY, command=None, justify=ctk.CENTER
        )
        self.__combobox_vacation.set(Cb.VACATION[16])
        self.__entry_vacation_description: ctk.CTkEntry = ctk.CTkEntry(
            frame_17, font=self._form_font, justify=ctk.CENTER
        )
        self.__entry_vacation_description.insert(0, Entry.DASH_DEFAULT)
        label_39: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_39, font=self._form_font)
        label_40: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_40, font=self._form_font)
        label_41: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_41, font=self._form_font)
        label_42: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_42, font=self._form_font)
        frame_18: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_43: ctk.CTkLabel = ctk.CTkLabel(frame_18, text=FTC.label_43, font=self._form_font)
        self.__spinbox_contract_termination_employer: FloatSpinbox = FloatSpinbox(
            frame_18, step_size=1, numeric_type=int, start_from=15
        )
        self.__spinbox_contract_termination_employer._entry_str_var.trace(
            ctk.W,
            lambda *args: self.__spinbox_positive_only(*args, spinbox=self.__spinbox_contract_termination_employer),
        )
        label_44: ctk.CTkLabel = ctk.CTkLabel(frame_18, text=FTC.label_44, font=self._form_font)
        self.__spinbox_contract_termination_employee: FloatSpinbox = FloatSpinbox(
            frame_18, step_size=1, numeric_type=int, start_from=15
        )
        self.__spinbox_contract_termination_employee._entry_str_var.trace(
            ctk.W,
            lambda *args: self.__spinbox_positive_only(*args, spinbox=self.__spinbox_contract_termination_employee),
        )
        label_45: ctk.CTkLabel = ctk.CTkLabel(frame_18, text=FTC.label_45, font=self._form_font)
        label_46: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_46, font=self._form_font)
        self.__entry_rights_and_obligations: ctk.CTkEntry = ctk.CTkEntry(
            container, font=self._form_font, justify=ctk.CENTER
        )
        self.__entry_rights_and_obligations.insert(0, Entry.RIGHTS_AND_OBLIGATIONS_DEFAULT)
        label_47: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_47, font=self._form_font)
        frame_19: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_48: ctk.CTkLabel = ctk.CTkLabel(frame_19, text=FTC.label_48, font=self._form_font)
        self.__combobox_court: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_19,
            font=self._form_font,
            values=Cb.COURTS,
            state=Cb.READ_ONLY,
            command=None,
            justify=ctk.CENTER,
        )
        self.__combobox_court.set(Cb.COURTS[14])
        frame_20: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_49: ctk.CTkLabel = ctk.CTkLabel(frame_20, text=FTC.label_49, font=self._form_font)
        self.__checkbox_contract_starts_with_date_strvar: ctk.StringVar() = ctk.StringVar()
        self.__checkbox_contract_starts_with_date: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_20,
            text=Chbx.DATE,
            command=lambda: self.__toggle_date_checkbox(
                checkbox=self.__checkbox_contract_starts_with_description,
                strvar=self.__checkbox_contract_starts_with_date_strvar,
                date_entry=self.__date_entry_contract_starting_with,
            ),
            state=ctk.DISABLED,
            variable=self.__checkbox_contract_starts_with_date_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.__checkbox_contract_starts_with_date.select()
        self.__checkbox_contract_starts_with_description_strvar: ctk.StringVar = ctk.StringVar()
        self.__checkbox_contract_starts_with_description: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_20,
            text=Chbx.DESCRIPTION,
            command=lambda: self.__toggle_description_checkbox(
                checkbox=self.__checkbox_contract_starts_with_date,
                strvar=self.__checkbox_contract_starts_with_description_strvar,
                entry=self.__entry_contract_starts_with_description,
            ),
            variable=self.__checkbox_contract_starts_with_description_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.__checkbox_contract_starts_with_description.deselect()
        self.__date_entry_contract_starting_with: DateEntry = DateEntry(
            frame_20, selectmode=De.DAY_MODE, state=De.READ_ONLY, justify=ctk.CENTER, locale=LOCALE_CROATIA
        )
        self.__entry_contract_starts_with_description: ctk.CTkEntry = ctk.CTkEntry(
            frame_20, font=self._form_font, justify=ctk.CENTER, state=Entry.READ_ONLY
        )
        label_50: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_50, font=self._form_font)
        frame_bottom: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)

        frame_1.pack(padx=10, pady=(20, 5), side=ctk.TOP, fill=ctk.X)
        label_1.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_employers.pack(pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        self.__entry_employer_info.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        lable_2.pack(padx=(0, 10), pady=10, side=ctk.LEFT)
        self.__entry_director.pack(pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_3.pack(padx=10, pady=10, side=ctk.LEFT)

        frame_2.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        self.__combobox_employees.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        self.__entry_employee_personal_id.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_4.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__date_entry_contract_date.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_5.pack(padx=10, pady=5, side=ctk.LEFT)

        label_6.pack(pady=10, side=ctk.TOP)
        label_7.pack(pady=10, side=ctk.TOP)
        label_8.pack(padx=20, pady=5, side=ctk.TOP, anchor=ctk.NW)
        label_9.pack(padx=20, pady=5, side=ctk.TOP, anchor=ctk.NW)
        self.__entry_job_description.pack(padx=20, pady=5, side=ctk.TOP, fill=ctk.X, expand=True)

        frame_3.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_10.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_select_trail_numbers.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        self.__combobox_select_trail_option.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)

        frame_4.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_11.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_working_place.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_12.pack(padx=10, pady=5, side=ctk.LEFT)

        label_13.pack(padx=20, pady=5, side=ctk.TOP, anchor=ctk.NW)

        frame_5.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_14.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__checkbox_start_job_date.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__checkbox_start_job_description.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__date_entry_start_date.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_start_job_description.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)

        label_15.pack(pady=10, side=ctk.TOP)

        frame_6.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_16.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary.pack(padx=10, pady=5, side=ctk.LEFT)
        label_17.pack(padx=10, pady=5, side=ctk.LEFT)

        label_18.pack(padx=20, pady=5, side=ctk.TOP, anchor=ctk.NW)

        frame_7.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_19.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_bonus.pack(padx=10, pady=5, side=ctk.LEFT)
        label_20.pack(padx=10, pady=5, side=ctk.LEFT)

        label_21.pack(padx=20, pady=5, side=ctk.TOP, anchor=ctk.NW)

        frame_8.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_22.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_1.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        frame_9.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_23.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_2.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        frame_10.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_24.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_3.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        frame_11.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_25.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_4.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        frame_12.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_26.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_5.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        frame_13.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_27.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_6.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        label_28.pack(pady=10, side=ctk.TOP)
        label_29.pack(padx=20, pady=5, side=ctk.TOP, anchor=ctk.NW)
        label_30.pack(padx=10, pady=10, side=ctk.TOP)

        frame_14.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_31.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_work_type.pack(padx=10, pady=5, side=ctk.LEFT)
        label_32.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__spinbox_weekly_working_hours.pack(padx=10, pady=5, side=ctk.LEFT)
        label_33.pack(padx=10, pady=5, side=ctk.LEFT)

        frame_15.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_34.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_working_shift.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__set_up_ui_for_working_shift_one_time_and_flexible()

        label_36.pack(padx=20, pady=5, side=ctk.TOP, anchor=ctk.NW)

        frame_16.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_37.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_weekly_time_off.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)

        frame_17.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_38.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_vacation.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_vacation_description.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)

        label_39.pack(padx=10, pady=10, side=ctk.TOP)
        label_40.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.NW)
        label_41.pack(padx=10, pady=10, side=ctk.TOP)
        label_42.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.NW)

        frame_18.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_43.pack(padx=10, pady=10, side=ctk.LEFT)
        self.__spinbox_contract_termination_employer.pack(padx=10, pady=10, side=ctk.LEFT)
        label_44.pack(padx=10, pady=10, side=ctk.LEFT)
        self.__spinbox_contract_termination_employee.pack(padx=10, pady=10, side=ctk.LEFT)
        label_45.pack(padx=10, pady=10, side=ctk.LEFT)

        label_46.pack(padx=10, pady=10, side=ctk.TOP)
        self.__entry_rights_and_obligations.pack(padx=20, pady=5, side=ctk.TOP, fill=ctk.BOTH, expand=True)
        label_47.pack(padx=10, pady=10, side=ctk.TOP)

        frame_19.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_48.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_court.pack(padx=10, pady=10, side=ctk.LEFT)

        frame_20.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_49.pack(padx=10, pady=10, side=ctk.LEFT)
        self.__checkbox_contract_starts_with_date.pack(padx=10, pady=10, side=ctk.LEFT)
        self.__checkbox_contract_starts_with_description.pack(padx=10, pady=10, side=ctk.LEFT)
        self.__date_entry_contract_starting_with.pack(padx=10, pady=10, side=ctk.LEFT)
        self.__entry_contract_starts_with_description.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)

        label_50.pack(padx=20, pady=5, side=ctk.TOP, anchor=ctk.NW)
        frame_bottom.pack(pady=50)

        self.__entry_job_description.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())
        self.__entry_working_place.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())
        self.__entry_start_job_description.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())
        self.__entry_vacation_description.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())
        self.__entry_rights_and_obligations.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())
        self.__entry_contract_starts_with_description.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())

    def __disable_generate_button(self) -> None:
        self.__button_generate_pdf.configure(state=ctk.DISABLED)

    def __toggle_date_checkbox(self, **kwrgs):
        strvar: ctk.StringVar = kwrgs[STRVAR]
        date_entry: DateEntry = kwrgs[DATE_ENTRY]
        checkbox: ctk.CTkCheckBox = kwrgs[CHECKBOX]

        checkbox_date_state: str = strvar.get()
        if checkbox_date_state == Chbx.ON_STATE:
            date_entry.configure(state=De.READ_ONLY)
            checkbox.configure(state=ctk.NORMAL)
        else:
            date_entry.configure(state=De.DISABLED)
            checkbox.configure(state=ctk.DISABLED)

    def __toggle_description_checkbox(self, **kwrgs):
        strvar: ctk.StringVar = kwrgs[STRVAR]
        entry: ctk.CTkEntry = kwrgs[ENTRY]
        checkbox: ctk.CTkCheckBox = kwrgs[CHECKBOX]

        checkbox_description_state: str = strvar.get()
        entry.delete(0, ctk.END)
        if checkbox_description_state == Chbx.ON_STATE:
            entry.configure(state=Entry.WRITE)
            entry.insert(0, Entry.START_DATE_DESCRIPTION_DEFAULT)
            checkbox.configure(state=ctk.NORMAL)
        else:
            entry.configure(state=Entry.READ_ONLY)
            checkbox.configure(state=ctk.DISABLED)

    def __spinbox_positive_only(self, *args, spinbox: FloatSpinbox):
        try:
            current_value: int = spinbox.get()
            if current_value < 0:
                entry_delete_insert_readonly(spinbox._entry, str(0))
        except TypeError:
            pass

    def __entry_numeric_add_bindings(self, *args, entry: ctk.CTkEntry) -> None:
        entry.bind(BUTTON_1, "break")
        entry.bind(ARROW_LEFT, "break")
        entry.bind(ARROW_RIGHT, "break")

    def __entry_numeric_remove_bindings(self, *args, entry: ctk.CTkEntry) -> None:
        entry.unbind(BUTTON_1)
        entry.unbind(ARROW_LEFT)
        entry.unbind(ARROW_RIGHT)

    def __validate_combobox_working_shift(self) -> None:
        current_value: str = self.__combobox_working_shift.get()
        if current_value == ONE_TIME:
            self.__set_up_ui_for_working_shift_one_time_and_flexible()
        elif current_value == TWICE:
            self.__set_up_ui_for_working_shift_twice_and_description()
        elif current_value == FLEXIBLE:
            self.__set_up_ui_for_working_shift_one_time_and_flexible()
        else:
            self.__set_up_ui_for_working_shift_twice_and_description()

    def __set_up_ui_for_working_shift_one_time_and_flexible(self) -> None:
        self.__entry_working_shift_description.pack_forget()
        self.label_35.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__time_picker_working_time_start.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__time_picker_working_time_end.pack(padx=10, pady=5, side=ctk.LEFT)

    def __set_up_ui_for_working_shift_twice_and_description(self) -> None:
        self.label_35.grid_remove()
        self.__time_picker_working_time_start.pack_forget()
        self.__time_picker_working_time_end.pack_forget()
        self.__entry_working_shift_description.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        self.__entry_working_shift_description.delete(0, ctk.END)
        self.__entry_working_shift_description.insert(0, Entry.WORKING_SHIFT_DESCRIPTION_DEFAULT)

    def __validate_combobox_work_type(self) -> None:
        current_value: str = self.__combobox_work_type.get()
        if current_value == FULL_TIME:
            self.__spinbox_weekly_working_hours._entry_str_var.trace_remove(
                WRITE, self.__spinbox_weekly_working_hours._entry_str_var.trace_info()[0][1]
            )
            entry_delete_insert_readonly(self.__spinbox_weekly_working_hours._entry, str(40.0))
            self.__spinbox_weekly_working_hours._entry_str_var.trace_add(
                WRITE, lambda *args: self.__set_up_spinbox_weekly_working_hours_for_full_time(*args)
            )
        else:
            self.__spinbox_weekly_working_hours._entry_str_var.trace_remove(
                WRITE, self.__spinbox_weekly_working_hours._entry_str_var.trace_info()[0][1]
            )
            entry_delete_insert_readonly(self.__spinbox_weekly_working_hours._entry, str(20.0))
            self.__spinbox_weekly_working_hours._entry_str_var.trace_add(
                WRITE, lambda *args: self.__set_up_spinbox_weekly_working_hours_for_part_time(*args)
            )
            self.__set_up_spinbox_weekly_working_hours_for_part_time()

    def __set_up_spinbox_weekly_working_hours_for_full_time(self, *args) -> None:
        try:
            current_value: float = round(float(self.__spinbox_weekly_working_hours.get()), 2)
            if current_value < 40.0:
                entry_delete_insert_readonly(self.__spinbox_weekly_working_hours._entry, str(40.0))
            if current_value > 56.0:
                entry_delete_insert_readonly(self.__spinbox_weekly_working_hours._entry, str(56.0))
        except TypeError:
            pass

    def __set_up_spinbox_weekly_working_hours_for_part_time(self, *args) -> None:
        try:
            current_value: float = round(float(self.__spinbox_weekly_working_hours.get()), 2)
            if current_value < 0.5:
                entry_delete_insert_readonly(self.__spinbox_weekly_working_hours._entry, str(0.5))
            if current_value > 39.5:
                entry_delete_insert_readonly(self.__spinbox_weekly_working_hours._entry, str(39.5))
        except TypeError:
            pass

    def __set_up_frame_grid(self, frame: ctk.CTkFrame, grid_size: int) -> None:
        for cell in range(grid_size):
            frame.rowconfigure(cell, weight=1)
            frame.columnconfigure(cell, weight=1)

    def __populate_employee_info(self, choice: str, entry: ctk.CTkEntry) -> None:
        personal_id = parse_personal_id_from_string(choice)
        entry_delete_insert_readonly(entry, personal_id)
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

    def __set_trail_connection(self) -> None:
        value: str = self.__combobox_select_trail_option_strvar.get()
        self.__combobox_select_trail_numbers.set(Cb.TRAIL[value][0])
        self.__combobox_select_trail_numbers.configure(values=Cb.TRAIL[value])

    def __validate_salary_increment(self, *args, **kwargs) -> None:
        entry: ctk.CTkEntry = kwargs[ENTRY]
        entry_str_var: ctk.StringVar = kwargs[STRVAR]
        minimum: int = kwargs[MINIMUM]

        if entry_str_var.get().endswith(PERCENTAGE):
            entry.delete(len(entry.get()) - 1, ctk.END)

        last_character_index = entry.index(ctk.INSERT)
        item = entry_str_var.get()

        try:
            item_type = type(float(item))
            if item_type == type(float(1.0)):
                pass
        except:
            entry.delete(last_character_index - 1, last_character_index)

        try:
            if int(entry.get()) < minimum:
                entry.delete(0, ctk.END)
                entry.insert(0, str(minimum))
        except ValueError:
            pass

        if not entry.get().endswith(PERCENTAGE):
            entry.insert(ctk.END, PERCENTAGE)

        if last_character_index == len(entry.get()) - 1:
            entry.icursor(len(entry.get()) - 1)
