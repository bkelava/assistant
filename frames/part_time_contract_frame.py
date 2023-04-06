import customtkinter as ctk
import datetime
import re
import os
import tkinter.messagebox as tkMessageBox

from tkcalendar import DateEntry
from typing import Dict, List

import constants.application as App
import constants.buttons as Btn
import constants.checkbox as Chbx
import constants.colors as Color
import constants.combobox as Cb
import constants.date_entry as De
import constants.entry as Entry
import constants.fonts as Font
import constants.message_box as MessageBox
import constants.part_time_contract as PTC

from database import DatabaseHandler
from constants.bindings import ARROW_LEFT, ARROW_RIGHT, BUTTON_1, BUTTON_4, BUTTON_5, FOCUS_IN, FOCUS_OUT, KEY_RELEASE
from constants.contract_pdf import *
from constants.regex import (
    TWO_DECIMALS_REGEX,
    ONE_DECIMAL_REGEX,
    BACKSPACE_TWO_DECIMAL_REGEX,
    BACKSPACE_ONE_DECIMAL_REGEX,
)
from constants.specials import *
from pdf import PDFGenerator
from utils import (
    parse_personal_id_from_string,
    parse_employee_name_and_lastname_from_string,
    entry_delete_insert_readonly,
    entry_insert_and_delete,
)
from widgets import FloatSpinbox, TimePicker

from .program_frame import ProgramFrame


class PartTimeContractFrame(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(PartTimeContractFrame, self).__init__(*args, **kwargs)

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

        self._contract_frame: ctk.CTkScrollableFrame = ctk.CTkScrollableFrame(self, fg_color=Color.BLACK_1529)
        self._contract_frame.grid(
            padx=10,
            pady=(0, 10),
            column=0,
            row=1,
            rowspan=19,
            columnspan=20,
            sticky=ctk.NSEW,
        )
        self._contract_frame.bind(BUTTON_4, lambda _: self.scroll_up())
        self._contract_frame.bind(BUTTON_5, lambda _: self.scroll_down())

        self.__generate_contract_form(self._contract_frame)

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
            CONTRACT_TERMINATION: self.__combobox_contract_termination.get(),
            CONTRACT_TERMINATION_EMPLOYER: self.__spinbox_contract_termination_employer.get(),
            CONTRACT_TERMINATION_EMPLOYEE: self.__spinbox_contract_termination_employee.get(),
            RIGHTS_AND_OBLIGATIONS: self.__entry_rights_and_obligations.get(),
            COURT: self.__combobox_court.get(),
        }
        if str(self.__date_entry_start_job_date.cget(STATE)) == De.DISABLED:
            data[START_DATE] = EMPTY_STRING
        else:
            data[START_DATE] = str((self.__date_entry_start_job_date.get_date()).strftime(DATE_FORMAT))
        data[START_DATE_DESCRIPTION] = self.__entry_start_job_description.get()

        if str(self.__date_entry_contract_starting_with.cget(STATE)) == De.DISABLED:
            data[CONTRACT_STARTING_WITH] = EMPTY_STRING
        else:
            data[CONTRACT_STARTING_WITH] = str(
                (self.__date_entry_contract_starting_with.get_date()).strftime(DATE_FORMAT)
            )
        data[CONTRACT_START_WITH_DESCRIPTION] = self.__entry_contract_starts_with_description.get()

        if str(self.__date_entry_end_job_date.cget(STATE)) == De.DISABLED:
            data[END_JOB_DATE] = EMPTY_STRING
        else:
            data[END_JOB_DATE] = str((self.__date_entry_end_job_date.get_date()).strftime(DATE_FORMAT))
        data[END_JOB_DESCRIPTION] = self.__entry_end_job_description.get()

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

        PDFGenerator.generate_part_time_contract(data)

        tkMessageBox.showinfo(
            MessageBox.GENERATE_CONRACT_SUCCESSFULL_TITLE, MessageBox.GENERATE_CONRACT_SUCCESSFULL_MESSAGE + os.getcwd()
        )

    def __validate_input_fields(self) -> None:
        if str(self.__entry_start_job_description.cget(STATE)) == De.WRITE:
            if self.__entry_start_job_description.get() != EMPTY_STRING:
                pass
            else:
                tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE)
                return

        if str(self.__entry_contract_starts_with_description.cget(STATE)) == De.WRITE:
            if self.__entry_contract_starts_with_description.get() != EMPTY_STRING:
                pass
            else:
                tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE)
                return

        if str(self.__entry_end_job_description.cget(STATE)) == De.WRITE:
            if self.__entry_end_job_description.get() != EMPTY_STRING:
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
                    self._button_generate_pdf.configure(state=ctk.NORMAL)
            else:
                tkMessageBox.showinfo(MessageBox.VALIDATION_INFO_TITLE, MessageBox.VALIDATION_INFO_MESSAGE)
                self._button_generate_pdf.configure(state=ctk.NORMAL)

    def __disable_generate_button(self) -> None:
        self._button_generate_pdf.configure(state=ctk.DISABLED)

    def __set_defaults(self) -> None:
        self.__combobox_employers.set(EMPTY_STRING)
        entry_delete_insert_readonly(self.__entry_employer_info)
        entry_delete_insert_readonly(self.__entry_director)
        self.__combobox_employees.set(EMPTY_STRING)
        self.__combobox_employees.configure(values=[])
        entry_delete_insert_readonly(self.__entry_employee_personal_id)
        self.__date_entry_contract_date.set_date(datetime.date.today())
        self.__date_entry_end_job_date.configure(state=De.READ_ONLY)
        self.__date_entry_end_job_date.set_date(datetime.date.today())
        self.__checkbox_end_job_date.configure(state=ctk.NORMAL)
        self.__checkbox_end_job_description.configure(state=ctk.NORMAL)
        self.__checkbox_end_job_date.select()
        self.__checkbox_end_job_description.deselect()
        self.__toggle_description_checkbox(
            checkbox=self.__checkbox_end_job_date,
            strvar=self.__checkbox_end_job_description_strvar,
            entry=self.__entry_end_job_description,
        )
        entry_insert_and_delete(self.__entry_job_description, Entry.JOB_DESCRIPTION_DEFAULT)
        self.__combobox_select_trail_numbers.set(Cb.NUMBERS_1_TO_30[0])
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
        self.__date_entry_start_job_date.configure(state=De.READ_ONLY)
        self.__date_entry_start_job_date.set_date(datetime.date.today())
        entry_insert_and_delete(self.__entry_salary, Entry.SALARY_DEFAUL)
        entry_insert_and_delete(self.__entry_salary_bonus, Entry.SALARY_DEFAUL)
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
        self.__combobox_contract_termination.set(Cb.CONTRACT_TERMINATION[0])
        self.__set_up_contract_termination()
        self.__spinbox_contract_termination_employer.set(str(15))
        self.__spinbox_contract_termination_employee.set(str(15))
        entry_insert_and_delete(self.__entry_rights_and_obligations, Entry.RIGHTS_AND_OBLIGATIONS_DEFAULT)
        self.__combobox_court.set(Cb.COURTS[14])
        self.__date_entry_contract_starting_with.configure(state=De.READ_ONLY)
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
        self._button_generate_pdf.configure(state=ctk.DISABLED)

    def scroll_up(self) -> None:
        self._contract_frame._parent_canvas.yview_scroll(-1, ctk.UNITS)

    def scroll_down(self) -> None:
        self._contract_frame._parent_canvas.yview_scroll(1, ctk.UNITS)

    def __generate_contract_form(self, container: ctk.CTkScrollableFrame) -> None:
        frame_1: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        self._form_font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_14,
            weight=Font.NORMAL,
        )

        label_1: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=PTC.label_1, font=self._form_font)
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
        lable_2: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=PTC.label_2, font=self._form_font)
        label_3: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=PTC.label_3, font=self._form_font)

        frame_2: ctk.CTkFrame = ctk.CTkFrame(container)
        self.__entry_employee_personal_id: ctk.CTkEntry = ctk.CTkEntry(
            frame_2, font=self._form_font, state=Entry.READ_ONLY, justify=ctk.CENTER
        )
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
        label_4: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=PTC.label_4, font=self._form_font)
        self.__date_entry_contract_date: DateEntry = DateEntry(
            frame_2,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            state=De.READ_ONLY,
            justify=ctk.CENTER,
            locale="hr_HR",
        )
        label_5: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=PTC.label_5, font=self._form_font)

        label_6: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_6, font=self._form_font)
        label_7: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_7, font=self._form_font)

        frame_3: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_8: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_8, font=self._form_font)
        label_9: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_9, font=self._form_font)
        self.__checkbox_end_job_date_strvar: ctk.StringVar = ctk.StringVar()
        self.__checkbox_end_job_date: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_3,
            text=Chbx.DATE,
            command=lambda: self.__toggle_date_checkbox(
                checkbox=self.__checkbox_end_job_description,
                strvar=self.__checkbox_end_job_date_strvar,
                date_entry=self.__date_entry_end_job_date,
            ),
            variable=self.__checkbox_end_job_date_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.__checkbox_end_job_date.select()
        self.__checkbox_end_job_description_strvar: ctk.StringVar = ctk.StringVar()
        self.__checkbox_end_job_description: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_3,
            text=Chbx.DESCRIPTION,
            command=lambda: self.__toggle_description_checkbox(
                checkbox=self.__checkbox_end_job_date,
                strvar=self.__checkbox_end_job_description_strvar,
                entry=self.__entry_end_job_description,
            ),
            variable=self.__checkbox_end_job_description_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.__checkbox_end_job_description.deselect()
        self.__date_entry_end_job_date: DateEntry = DateEntry(
            frame_3,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            state=De.READ_ONLY,
            justify=ctk.CENTER,
            locale=LOCALE_CROATIA,
        )
        self.__entry_end_job_description: ctk.CTkEntry = ctk.CTkEntry(
            frame_3, font=self._form_font, justify=ctk.CENTER, state=ctk.DISABLED
        )
        entry_insert_and_delete(self.__entry_end_job_description, Entry.END_JOB_DATE_DESCRIPTION_DEFAULT)
        frame_4: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_10: ctk.CTkLabel = ctk.CTkLabel(frame_4, text=PTC.label_10, font=self._form_font)
        self.__entry_job_description: ctk.CTkEntry = ctk.CTkEntry(frame_4, font=self._form_font, justify=ctk.CENTER)
        self.__entry_job_description.insert(0, Entry.JOB_DESCRIPTION_DEFAULT)
        frame_5: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_11: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=PTC.label_11, font=self._form_font)
        self.__combobox_select_trail_numbers: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_5,
            font=self._form_font,
            values=Cb.NUMBERS_1_TO_30,
            state=Cb.READ_ONLY,
            justify=ctk.CENTER,
        )
        self.__combobox_select_trail_numbers.set(Cb.NUMBERS_1_TO_30[0])
        self.__combobox_select_trail_option_strvar: ctk.StringVar = ctk.StringVar()
        self.__combobox_select_trail_option: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_5,
            command=lambda _: self.__set_combobox_trail_connection(),
            font=self._form_font,
            values=Cb.TRAIL_OPTIONS,
            state=Cb.READ_ONLY,
            justify=ctk.CENTER,
            variable=self.__combobox_select_trail_option_strvar,
        )
        self.__combobox_select_trail_option.set(Cb.TRAIL_OPTIONS[0])
        frame_6: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_12: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=PTC.label_12, font=self._form_font)
        self.__entry_working_place: ctk.CTkEntry = ctk.CTkEntry(frame_6, font=self._form_font, justify=ctk.CENTER)
        self.__entry_working_place.insert(0, Entry.WORK_PLACE_DEFAULT)
        label_13: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=PTC.label_13, font=self._form_font)
        label_14: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_14, font=self._form_font)
        frame_7: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_15: ctk.CTkLabel = ctk.CTkLabel(frame_7, text=PTC.label_15, font=self._form_font)
        self.__date_entry_start_job_date: DateEntry = DateEntry(
            frame_7,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            justify=ctk.CENTER,
            state=De.READ_ONLY,
            locale=LOCALE_CROATIA,
        )
        self.__entry_start_job_description: ctk.CTkEntry = ctk.CTkEntry(
            frame_7, font=self._form_font, justify=ctk.CENTER, state=Entry.READ_ONLY
        )
        self.__checkbox_start_job_date_strvar: ctk.StringVar() = ctk.StringVar()
        self.__checkbox_start_job_date: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_7,
            text=Chbx.DATE,
            command=lambda: self.__toggle_date_checkbox(
                checkbox=self.__checkbox_start_job_description,
                strvar=self.__checkbox_start_job_date_strvar,
                date_entry=self.__date_entry_start_job_date,
            ),
            state=ctk.DISABLED,
            variable=self.__checkbox_start_job_date_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.__checkbox_start_job_date.select()
        self.__checkbox_start_job_description_strvar: ctk.StringVar = ctk.StringVar()
        self.__checkbox_start_job_description: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_7,
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
        label_16: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_16, font=self._form_font)
        frame_8: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_17: ctk.CTkLabel = ctk.CTkLabel(frame_8, text=PTC.label_17, font=self._form_font)
        self.__entry_salary_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary: ctk.CTkEntry = ctk.CTkEntry(
            frame_8, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_strvar
        )
        self.__entry_salary.insert(0, Entry.SALARY_DEFAUL)
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
        label_18: ctk.CTkLabel = ctk.CTkLabel(frame_8, text=PTC.label_18, font=self._form_font)
        label_19: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_19, font=self._form_font)
        frame_9: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_20: ctk.CTkLabel = ctk.CTkLabel(frame_9, text=PTC.label_20, font=self._form_font)
        self.__entry_salary_bonus_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_bonus: ctk.CTkEntry = ctk.CTkEntry(
            frame_9, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_bonus_strvar
        )
        self.__entry_salary_bonus.insert(0, Entry.SALARY_DEFAUL)
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
        label_21: ctk.CTkLabel = ctk.CTkLabel(frame_9, text=PTC.label_21, font=self._form_font)
        label_22: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_22, font=self._form_font)
        frame_10: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_23: ctk.CTkLabel = ctk.CTkLabel(frame_10, text=PTC.label_23, font=self._form_font)
        self.__entry_salary_increment_1_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_1: ctk.CTkEntry = ctk.CTkEntry(
            frame_10, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_1_strvar
        )
        self.__entry_salary_increment_1_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_1, strvar=self.__entry_salary_increment_1_strvar, minimum=20
            ),
        )
        self.__entry_salary_increment_1.insert(0, Entry.PERCENTAGE_20)
        frame_11: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_24: ctk.CTkLabel = ctk.CTkLabel(frame_11, text=PTC.label_24, font=self._form_font)
        self.__entry_salary_increment_2_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_2: ctk.CTkEntry = ctk.CTkEntry(
            frame_11, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_2_strvar
        )
        self.__entry_salary_increment_2_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_2, strvar=self.__entry_salary_increment_2_strvar, minimum=30
            ),
        )
        self.__entry_salary_increment_2.insert(0, Entry.PERCENTAGE_30)
        frame_12: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_25: ctk.CTkLabel = ctk.CTkLabel(frame_12, text=PTC.label_25, font=self._form_font)
        self.__entry_salary_increment_3_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_3: ctk.CTkEntry = ctk.CTkEntry(
            frame_12, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_3_strvar
        )
        self.__entry_salary_increment_3_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_3, strvar=self.__entry_salary_increment_3_strvar, minimum=50
            ),
        )
        self.__entry_salary_increment_3.insert(0, Entry.PERCENTAGE_50)

        frame_13: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_26: ctk.CTkLabel = ctk.CTkLabel(frame_13, text=PTC.label_26, font=self._form_font)
        self.__entry_salary_increment_4_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_4: ctk.CTkEntry = ctk.CTkEntry(
            frame_13, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_4_strvar
        )
        self.__entry_salary_increment_4_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_4, strvar=self.__entry_salary_increment_4_strvar, minimum=20
            ),
        )
        self.__entry_salary_increment_4.insert(0, Entry.PERCENTAGE_20)
        frame_14: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_27: ctk.CTkLabel = ctk.CTkLabel(frame_14, text=PTC.label_27, font=self._form_font)
        self.__entry_salary_increment_5_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_5: ctk.CTkEntry = ctk.CTkEntry(
            frame_14, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_5_strvar
        )
        self.__entry_salary_increment_5_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_5, strvar=self.__entry_salary_increment_5_strvar, minimum=20
            ),
        )
        self.__entry_salary_increment_5.insert(0, Entry.PERCENTAGE_20)
        frame_15: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_28: ctk.CTkLabel = ctk.CTkLabel(frame_15, text=PTC.label_28, font=self._form_font)
        self.__entry_salary_increment_6_strvar: ctk.StringVar = ctk.StringVar()
        self.__entry_salary_increment_6: ctk.CTkEntry = ctk.CTkEntry(
            frame_15, font=self._form_font, justify=ctk.CENTER, textvariable=self.__entry_salary_increment_6_strvar
        )
        self.__entry_salary_increment_6_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args, entry=self.__entry_salary_increment_6, strvar=self.__entry_salary_increment_6_strvar, minimum=20
            ),
        )
        self.__entry_salary_increment_6.insert(0, Entry.PERCENTAGE_20)
        label_29: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_29, font=self._form_font)
        label_30: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_30, font=self._form_font)
        label_31: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_31, font=self._form_font)
        frame_16: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_32: ctk.CTkLabel = ctk.CTkLabel(frame_16, text=PTC.label_32, font=self._form_font)
        self.__combobox_work_type: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_16,
            font=self._form_font,
            values=Cb.WORK_TIME_TYPE,
            state=Cb.READ_ONLY,
            command=lambda _: self.__validate_combobox_work_type(),
            justify=ctk.CENTER,
        )
        self.__combobox_work_type.set(Cb.WORK_TIME_TYPE[0])
        label_33: ctk.CTkLabel = ctk.CTkLabel(frame_16, text=PTC.label_33, font=self._form_font)
        self.__spinbox_weekly_working_hours: FloatSpinbox = FloatSpinbox(
            frame_16, width=200, step_size=0.5, numeric_type=float, start_from=40.0
        )
        self.__spinbox_weekly_working_hours._entry_str_var.trace_add(
            WRITE, lambda *args: self.__set_up_spinbox_weekly_working_hours_for_full_time(*args)
        )
        label_34: ctk.CTkLabel = ctk.CTkLabel(frame_16, text=PTC.label_34, font=self._form_font)
        frame_17: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_35: ctk.CTkLabel = ctk.CTkLabel(frame_17, text=PTC.label_35, font=self._form_font)
        self.__combobox_working_shift: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_17,
            font=self._form_font,
            values=Cb.WORK_TIME_SHIFT,
            state=Cb.READ_ONLY,
            command=lambda _: self.__validate_combobox_working_shift(),
            justify=ctk.CENTER,
        )
        self.__combobox_working_shift.set(Cb.WORK_TIME_SHIFT[0])
        self.label_36: ctk.CTkLabel = ctk.CTkLabel(frame_17, text=PTC.label_36, font=self._form_font)
        self.__time_picker_working_time_start: TimePicker = TimePicker(frame_17)
        self.__time_picker_working_time_end: TimePicker = TimePicker(frame_17)
        self.__entry_working_shift_description: ctk.CTkEntry = ctk.CTkEntry(
            frame_17, font=self._form_font, justify=ctk.CENTER
        )
        label_37: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_37, font=self._form_font)
        frame_18: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_38: ctk.CTkLabel = ctk.CTkLabel(frame_18, text=PTC.label_38, font=self._form_font)
        self.__combobox_weekly_time_off: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_18,
            font=self._form_font,
            values=Cb.WEEKLY_TIME_OFF,
            state=Cb.READ_ONLY,
            command=None,
            justify=ctk.CENTER,
        )
        self.__combobox_weekly_time_off.set(Cb.WEEKLY_TIME_OFF[2])
        frame_19: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_39: ctk.CTkLabel = ctk.CTkLabel(frame_19, text=PTC.label_39, font=self._form_font)
        self.__combobox_vacation: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_19, font=self._form_font, values=Cb.VACATION, state=Cb.READ_ONLY, command=None, justify=ctk.CENTER
        )
        self.__combobox_vacation.set(Cb.VACATION[16])
        self.__entry_vacation_description: ctk.CTkEntry = ctk.CTkEntry(
            frame_19, font=self._form_font, justify=ctk.CENTER
        )
        self.__entry_vacation_description.insert(0, Entry.DASH_DEFAULT)
        label_40: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_40, font=self._form_font)
        label_41: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_41, font=self._form_font)
        label_42: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_42, font=self._form_font)
        frame_20: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_43: ctk.CTkLabel = ctk.CTkLabel(frame_20, text=PTC.label_43, font=self._form_font)
        self.__combobox_contract_termination: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_20,
            font=self._form_font,
            values=Cb.CONTRACT_TERMINATION,
            state=Cb.READ_ONLY,
            command=lambda _: self.__set_up_contract_termination(),
            justify=ctk.CENTER,
        )
        self.__combobox_contract_termination.set(Cb.CONTRACT_TERMINATION[0])
        label_44: ctk.CTkLabel = ctk.CTkLabel(frame_20, text=PTC.label_44, font=self._form_font)
        frame_21: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_45: ctk.CTkLabel = ctk.CTkLabel(frame_21, text=PTC.label_45, font=self._form_font)
        label_46: ctk.CTkLabel = ctk.CTkLabel(frame_21, text=PTC.label_46, font=self._form_font)
        self.__spinbox_contract_termination_employer: FloatSpinbox = FloatSpinbox(
            frame_21, step_size=1, numeric_type=int, start_from=15
        )
        self.__spinbox_contract_termination_employer._entry_str_var.trace(
            ctk.W,
            lambda *args: self.__spinbox_positive_only(*args, spinbox=self.__spinbox_contract_termination_employer),
        )
        label_47: ctk.CTkLabel = ctk.CTkLabel(frame_21, text=PTC.label_47, font=self._form_font)
        self.__spinbox_contract_termination_employee: FloatSpinbox = FloatSpinbox(
            frame_21, step_size=1, numeric_type=int, start_from=15
        )
        self.__spinbox_contract_termination_employee._entry_str_var.trace(
            ctk.W,
            lambda *args: self.__spinbox_positive_only(*args, spinbox=self.__spinbox_contract_termination_employee),
        )

        label_48: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_48, font=self._form_font)

        self.__entry_rights_and_obligations: ctk.CTkEntry = ctk.CTkEntry(
            container, font=self._form_font, justify=ctk.CENTER
        )
        self.__entry_rights_and_obligations.insert(0, Entry.RIGHTS_AND_OBLIGATIONS_DEFAULT)

        label_49: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_49, font=self._form_font)

        frame_22: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_50: ctk.CTkLabel = ctk.CTkLabel(frame_22, text=PTC.label_50, font=self._form_font)
        self.__combobox_court: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_22,
            font=self._form_font,
            values=Cb.COURTS,
            state=Cb.READ_ONLY,
            command=None,
            justify=ctk.CENTER,
        )
        self.__combobox_court.set(Cb.COURTS[14])
        frame_23: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_51: ctk.CTkLabel = ctk.CTkLabel(frame_23, text=PTC.label_51, font=self._form_font)
        self.__checkbox_contract_starts_with_date_strvar: ctk.StringVar() = ctk.StringVar()
        self.__checkbox_contract_starts_with_date: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_23,
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
            frame_23,
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
            frame_23, selectmode=De.DAY_MODE, state=De.READ_ONLY, justify=ctk.CENTER, locale="hr_HR"
        )
        self.__entry_contract_starts_with_description: ctk.CTkEntry = ctk.CTkEntry(
            frame_23, font=self._form_font, justify=ctk.CENTER, state=Entry.READ_ONLY
        )
        label_52: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_52, font=self._form_font)
        frame_bottom: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)

        frame_1.pack(padx=20, pady=(20, 5), side=ctk.TOP, fill=ctk.X)
        label_1.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_employers.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        self.__entry_employer_info.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        lable_2.pack(padx=(0, 10), pady=5, side=ctk.LEFT)
        self.__entry_director.pack(pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_3.pack(padx=10, pady=5, side=ctk.LEFT)

        frame_2.pack(padx=20, pady=5, side=ctk.TOP, fill=ctk.X)
        self.__combobox_employees.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        self.__entry_employee_personal_id.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_4.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__date_entry_contract_date.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_5.pack(pady=5, side=ctk.LEFT)

        label_6.pack(pady=10, side=ctk.TOP)
        label_7.pack(pady=10, side=ctk.TOP)
        label_8.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.NW)

        frame_3.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_9.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__checkbox_end_job_date.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X)
        self.__checkbox_end_job_description.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X)
        self.__date_entry_end_job_date.pack(padx=5, pady=5, side=ctk.LEFT, fill=ctk.X)
        self.__entry_end_job_description.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)

        frame_4.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_10.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_job_description.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)

        frame_5.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_11.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_select_trail_numbers.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        self.__combobox_select_trail_option.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)

        frame_6.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_12.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_working_place.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)
        label_13.pack(padx=20, pady=10, side=ctk.LEFT)

        label_14.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.NW)

        frame_7.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_15.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__checkbox_start_job_date.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__checkbox_start_job_description.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__date_entry_start_job_date.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X)
        self.__entry_start_job_description.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)

        label_16.pack(pady=10, side=ctk.TOP)

        frame_8.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_17.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary.pack(padx=10, pady=5, side=ctk.LEFT)
        label_18.pack(padx=10, pady=5, side=ctk.LEFT)

        label_19.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.NW)

        frame_9.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_20.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_bonus.pack(padx=10, pady=5, side=ctk.LEFT)
        label_21.pack(padx=10, pady=5, side=ctk.LEFT)

        label_22.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.NW)

        frame_10.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_23.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_1.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        frame_11.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_24.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_2.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        frame_12.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_25.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_3.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        frame_13.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_26.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_4.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        frame_14.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_27.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_5.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        frame_15.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_28.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_salary_increment_6.pack(padx=(10, 500), pady=5, side=ctk.RIGHT)

        label_29.pack(pady=10, side=ctk.TOP)
        label_30.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.NW)
        label_31.pack(pady=10, side=ctk.TOP)

        frame_16.pack(padx=10, pady=10, side=ctk.TOP, anchor=ctk.NW, fill=ctk.X)
        label_32.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_work_type.pack(padx=10, pady=5, side=ctk.LEFT)
        label_33.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__spinbox_weekly_working_hours.pack(padx=10, pady=5, side=ctk.LEFT)
        label_34.pack(padx=10, pady=5, side=ctk.LEFT)

        frame_17.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_35.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_working_shift.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__set_up_ui_for_working_shift_one_time_and_flexible()

        label_37.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.NW)

        frame_18.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_38.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_weekly_time_off.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)

        frame_19.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_39.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_vacation.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__entry_vacation_description.pack(padx=10, pady=5, side=ctk.LEFT, fill=ctk.X, expand=True)

        label_40.pack(pady=10, side=ctk.TOP)
        label_41.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.NW)
        label_42.pack(pady=10, side=ctk.TOP)

        frame_20.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_43.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_contract_termination.pack(padx=10, pady=5, side=ctk.LEFT)
        label_44.pack(padx=10, pady=5, side=ctk.LEFT)

        frame_21.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_45.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__spinbox_contract_termination_employer.pack(padx=10, pady=5, side=ctk.LEFT)
        label_46.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__spinbox_contract_termination_employee.pack(padx=10, pady=5, side=ctk.LEFT)
        label_47.pack(padx=10, pady=5, side=ctk.LEFT)

        label_48.pack(pady=10, side=ctk.TOP)
        self.__entry_rights_and_obligations.pack(padx=20, pady=10, side=ctk.TOP, fill=ctk.X, expand=True)

        label_49.pack(padx=10, pady=5, side=ctk.TOP)
        frame_22.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_50.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__combobox_court.pack(padx=10, pady=5, side=ctk.LEFT)

        frame_23.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.X)
        label_51.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__checkbox_contract_starts_with_date.pack(padx=10, pady=10, side=ctk.LEFT)
        self.__checkbox_contract_starts_with_description.pack(padx=10, pady=10, side=ctk.LEFT)
        self.__date_entry_contract_starting_with.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)
        self.__entry_contract_starts_with_description.pack(padx=10, pady=10, side=ctk.LEFT, fill=ctk.X, expand=True)

        label_52.pack(padx=20, pady=10, side=ctk.TOP, anchor=ctk.NW)

        frame_bottom.pack(pady=50)

        self.__entry_job_description.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())
        self.__entry_end_job_description.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())
        self.__entry_working_place.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())
        self.__entry_start_job_description.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())
        self.__entry_vacation_description.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())
        self.__entry_rights_and_obligations.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())
        self.__entry_contract_starts_with_description.bind(KEY_RELEASE, lambda _: self.__disable_generate_button())

    def __set_up_contract_termination(self):
        if self.__combobox_contract_termination.get() == Cb.CONTRACT_TERMINATION[0]:
            self.__spinbox_contract_termination_employer._add_button.configure(state=ctk.NORMAL)
            self.__spinbox_contract_termination_employer._subtract_button.configure(state=ctk.NORMAL)
            entry_delete_insert_readonly(self.__spinbox_contract_termination_employer._entry, str(15))
            self.__spinbox_contract_termination_employee._add_button.configure(state=ctk.NORMAL)
            self.__spinbox_contract_termination_employee._subtract_button.configure(state=ctk.NORMAL)
            entry_delete_insert_readonly(self.__spinbox_contract_termination_employee._entry, str(15))
        else:
            self.__spinbox_contract_termination_employer._add_button.configure(state=ctk.DISABLED)
            self.__spinbox_contract_termination_employer._subtract_button.configure(state=ctk.DISABLED)
            entry_delete_insert_readonly(self.__spinbox_contract_termination_employer._entry, str(0))
            self.__spinbox_contract_termination_employee._add_button.configure(state=ctk.DISABLED)
            self.__spinbox_contract_termination_employee._subtract_button.configure(state=ctk.DISABLED)
            entry_delete_insert_readonly(self.__spinbox_contract_termination_employee._entry, str(0))

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
        self.label_36.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__time_picker_working_time_start.pack(padx=10, pady=5, side=ctk.LEFT)
        self.__time_picker_working_time_end.pack(padx=10, pady=5, side=ctk.LEFT)

    def __set_up_ui_for_working_shift_twice_and_description(self) -> None:
        self.label_36.pack_forget()
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

    def __set_combobox_trail_connection(self) -> None:
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
