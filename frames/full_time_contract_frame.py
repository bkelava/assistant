import customtkinter as ctk
import datetime
import re
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
import constants.full_time_contract as FTC

from database import DatabaseHandler
from constants.bindings import BUTTON_4, BUTTON_5, FOCUS_IN, FOCUS_OUT
from constants.part_time_contract_pdf import *
from constants.regex import (
    TWO_DECIMALS_REGEX,
    ONE_DECIMAL_REGEX,
    BACKSPACE_TWO_DECIMAL_REGEX,
    BACKSPACE_ONE_DECIMAL_REGEX,
)
from constants.specials import *
from pdf import PDFGenerator
from utils import DatabaseHelper
from widgets import FloatSpinbox, TimePicker

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

        self.reset_to_defaults: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.RESET_TO_DEFAULTS,
            font=self._font,
            command=self.__set_defaults,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self.reset_to_defaults.grid(padx=10, pady=10, column=0, row=0, columnspan=5, sticky=ctk.NSEW)

        self.button_validate_contract: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.VALIDATE_CONTRACT,
            font=self._font,
            command=self.__validate_input_fields,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self.button_validate_contract.grid(padx=(0, 10), pady=10, column=5, row=0, columnspan=5, sticky=ctk.NSEW)

        self.button_generate_pdf: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.GENERATE_PDF,
            font=self._font,
            state=ctk.DISABLED,
            command=self.__generate_pdf,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self.button_generate_pdf.grid(
            padx=(0, 10),
            pady=10,
            column=10,
            row=0,
            columnspan=5,
            sticky=ctk.NSEW,
        )

        self.button_print: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.PRINT,
            font=self._font,
            state=ctk.DISABLED,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self.button_print.grid(
            padx=(0, 10),
            pady=10,
            column=15,
            row=0,
            columnspan=5,
            sticky=ctk.NSEW,
        )

        self.contract_frame: ctk.CTkScrollableFrame = ctk.CTkScrollableFrame(self, fg_color=Color.BLACK_1529)
        self.contract_frame.grid(
            padx=10,
            pady=(0, 10),
            column=0,
            row=1,
            rowspan=19,
            columnspan=20,
            sticky=ctk.NSEW,
        )
        self.contract_frame.bind(BUTTON_4, lambda _: self.scroll_up())
        self.contract_frame.bind(BUTTON_5, lambda _: self.scroll_down())

        self.__generate_contract_form(self.contract_frame)

    def __generate_pdf(self) -> None:
        data: Dict = {
            EMPLOYERS: self.combobox_employers.get(),
            EMPLOYER_INFO: self.entry_employer_info.get(),
            DIRECTOR: self.entry_director.get(),
            EMPLOYEES: self.combobox_employees.get(),
            EMPLOYEE_PERSONAL_ID: self.entry_employee_personal_id.get(),
            CONTRACT_DATE: str((self.date_entry_contract_date.get_date()).strftime(DATE_FORMAT)),
            JOB_DESCRIPTION: self.entry_job_description.get(),
            TRAIL_NUMBERS: self.combobox_select_trail_numbers.get(),
            TRAIL_OPTION: self.combobox_select_trail_option.get(),
            WORKING_PLACE: self.entry_working_place.get(),
            SALARY: self.entry_salary.get(),
            SALARY_BONUS: self.entry_salary_bonus.get(),
            SALARY_INCREMENT_1: self.entry_salary_increment_1.get(),
            SALARY_INCREMENT_2: self.entry_salary_increment_2.get(),
            SALARY_INCREMENT_3: self.entry_salary_increment_3.get(),
            SALARY_INCREMENT_4: self.entry_salary_increment_4.get(),
            SALARY_INCREMENT_5: self.entry_salary_increment_5.get(),
            SALARY_INCREMENT_6: self.entry_salary_increment_6.get(),
            WORK_TYPE: self.combobox_work_type.get(),
            WEEKLY_WORKING_HOURS: self.spinbox_weekly_working_hours.get(),
            WEEKLY_TIME_OFF: self.combobox_weekly_time_off.get(),
            VACATION: self.combobox_vacation.get(),
            VACATION_DESCRIPTION: self.entry_vacation_description.get(),
            CONTRACT_TERMINATION_EMPLOYER: self.spinbox_contract_termination_employer.get(),
            CONTRACT_TERMINATION_EMPLOYEE: self.spinbox_contract_termination_employee.get(),
            RIGHTS_AND_OBLIGATIONS: self.entry_rights_and_obligations.get(),
            COURT: self.combobox_court.get(),
        }
        if str(self.date_entry_start_date.cget("state")) == De.DISABLED:
            data[START_DATE] = EMPTY_STRING
        else:
            data[START_DATE] = str((self.date_entry_start_date.get_date()).strftime(DATE_FORMAT))
        data[START_DATE_DESCRIPTION] = self.entry_start_date_description.get()

        if str(self.date_entry_contract_starting_with.cget("state")) == De.DISABLED:
            data[CONTRACT_STARTING_WITH] = EMPTY_STRING
        else:
            data[CONTRACT_STARTING_WITH] = str(
                (self.date_entry_contract_starting_with.get_date()).strftime(DATE_FORMAT)
            )
        data[CONTRACT_START_WITH_DESCRIPTION] = self.entry_contract_starts_with_description.get()

        data[WORKING_SHIFT] = self.combobox_working_shift.get()
        if (
            self.combobox_working_shift.get() == Cb.WORK_TIME_SHIFT[0]
            or self.combobox_working_shift.get() == Cb.WORK_TIME_SHIFT[2]
        ):
            data[WORKING_TIME_START] = self.time_picker_working_time_start.get()
            data[WORKING_TIME_END] = self.time_picker_working_time_end.get()
            data[WORKING_SHIFT_DESCRIPTION] = EMPTY_STRING
        else:
            data[WORKING_SHIFT_DESCRIPTION] = self.entry_working_shift_description.get()
            data[WORKING_TIME_START] = EMPTY_STRING
            data[WORKING_TIME_END] = EMPTY_STRING

        PDFGenerator.generate_full_time_contract(data)

    def __validate_input_fields(self) -> None:
        if str(self.entry_start_date_description.cget("state")) == De.WRITE:
            if self.entry_start_date_description.get() != EMPTY_STRING:
                pass
            else:
                tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE)
                return

        if str(self.entry_contract_starts_with_description.cget("state")) == De.WRITE:
            if self.entry_contract_starts_with_description.get() != EMPTY_STRING:
                pass
            else:
                tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE)
                return

        if (
            self.combobox_employers.get() == EMPTY_STRING
            or self.combobox_employees.get() == EMPTY_STRING
            or self.entry_working_place.get() == EMPTY_STRING
            or self.entry_job_description.get() == EMPTY_STRING
            or self.entry_working_place.get() == EMPTY_STRING
            or self.entry_vacation_description.get() == EMPTY_STRING
            or self.entry_rights_and_obligations.get() == EMPTY_STRING
        ):
            tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE)
        else:
            if self.entry_working_shift_description.winfo_ismapped():
                if self.entry_working_shift_description.get() == EMPTY_STRING:
                    tkMessageBox.showwarning(MessageBox.VALIDATION_WARNING_TITLE, MessageBox.VALIDATION_WARNING_MESSAGE)
                else:
                    tkMessageBox.showinfo(MessageBox.VALIDATION_INFO_TITLE, MessageBox.VALIDATION_INFO_MESSAGE)
                    self.button_generate_pdf.configure(state=ctk.NORMAL)
            else:
                tkMessageBox.showinfo(MessageBox.VALIDATION_INFO_TITLE, MessageBox.VALIDATION_INFO_MESSAGE)
                self.button_generate_pdf.configure(state=ctk.NORMAL)

    def __entry_delete_insert_readonly(self, entry: ctk.CTkEntry, text: str = "") -> None:
        entry.configure(state=Entry.WRITE)
        entry.delete(0, ctk.END)
        entry.insert(0, text)
        entry.configure(state=Entry.READ_ONLY)

    def __set_defaults(self) -> None:
        self.combobox_employers.set("")
        self.__entry_delete_insert_readonly(self.entry_employer_info)
        self.__entry_delete_insert_readonly(self.entry_director)
        self.combobox_employees.set("")
        self.__entry_delete_insert_readonly(self.entry_employee_personal_id)
        self.date_entry_contract_date.set_date(datetime.date.today())

        self.__entry_delete_and_insert(self.entry_job_description, Entry.JOB_DESCRIPTION_DEFAULT)
        self.combobox_select_trail_numbers.set(Cb.NUMBERS_1_TO_30[1])
        self.combobox_select_trail_numbers.configure(values=Cb.NUMBERS_1_TO_30)
        self.combobox_select_trail_option.set(Cb.TRAIL_OPTIONS[0])
        self.combobox_select_trail_option.configure(values=Cb.TRAIL_OPTIONS)
        self.__entry_delete_insert_readonly(self.entry_working_place, Entry.WORK_PLACE_DEFAULT)
        self.checkbox_start_job_date.configure(state=ctk.NORMAL)
        self.checkbox_start_job_description.configure(state=ctk.NORMAL)
        self.checkbox_start_job_date.select()
        self.checkbox_start_job_description.deselect()
        self.__toggle_start_job_description_checkbox()
        self.date_entry_start_date.configure(state=ctk.NORMAL)
        self.date_entry_start_date.set_date(datetime.date.today())

        self.__entry_delete_and_insert(self.entry_salary, Entry.SALARY_DEFAUL)
        self.__entry_delete_and_insert(self.entry_salary_bonus, Entry.SALARY_DEFAUL)
        self.__entry_delete_and_insert(self.entry_salary_increment_1, Entry.PERCENTAGE_20)
        self.__entry_delete_and_insert(self.entry_salary_increment_2, Entry.PERCENTAGE_30)
        self.__entry_delete_and_insert(self.entry_salary_increment_3, Entry.PERCENTAGE_50)
        self.__entry_delete_and_insert(self.entry_salary_increment_4, Entry.PERCENTAGE_20)
        self.__entry_delete_and_insert(self.entry_salary_increment_5, Entry.PERCENTAGE_20)
        self.__entry_delete_and_insert(self.entry_salary_increment_6, Entry.PERCENTAGE_20)

        self.combobox_work_type.set(Cb.WORK_TIME_TYPE[0])
        self.__validate_combobox_work_type()
        self.combobox_working_shift.set(Cb.WORK_TIME_SHIFT[0])
        self.__validate_combobox_working_shift()
        self.combobox_weekly_time_off.set(Cb.WEEKLY_TIME_OFF[2])
        self.combobox_vacation.set(Cb.VACATION[16])
        self.__entry_delete_and_insert(self.entry_vacation_description, Entry.DASH_DEFAULT)

        self.spinbox_contract_termination_employer.set(str(15))
        self.spinbox_contract_termination_employee.set(str(15))

        self.__entry_delete_and_insert(self.entry_rights_and_obligations, Entry.RIGHTS_AND_OBLIGATIONS_DEFAULT)

        self.combobox_court.set(Cb.COURTS[14])
        self.date_entry_contract_starting_with.set_date(datetime.date.today())
        self.checkbox_contract_starts_with_date.configure(state=ctk.NORMAL)
        self.checkbox_contract_starts_with_description.configure(state=ctk.NORMAL)
        self.checkbox_contract_starts_with_date.select()
        self.checkbox_contract_starts_with_description.deselect()
        self.__toggle_contract_starts_with_description_checkbox()

        self.button_generate_pdf.configure(state=ctk.DISABLED)

    def scroll_up(self) -> None:
        self.contract_frame._parent_canvas.yview_scroll(-1, ctk.UNITS)

    def scroll_down(self) -> None:
        self.contract_frame._parent_canvas.yview_scroll(1, ctk.UNITS)

    def __generate_contract_form(self, container: ctk.CTkScrollableFrame) -> None:
        frame_1: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        self._font.configure(size=Font.SIZE_14, weight=Font.NORMAL)

        label_1: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=FTC.label_1, font=self._font)
        self.combobox_employers: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_1,
            font=self._font,
            values=DatabaseHelper.get_list_of_employers(),
            state=Cb.READ_ONLY,
            command=lambda choice: self.__populate_employer_info(
                choice=choice,
            ),
            justify=ctk.CENTER,
        )
        self.entry_employer_info: ctk.CTkEntry = ctk.CTkEntry(
            frame_1, font=self._font, state=Entry.READ_ONLY, justify=ctk.CENTER
        )
        self.entry_director: ctk.CTkEntry = ctk.CTkEntry(
            frame_1, font=self._font, state=Entry.READ_ONLY, justify=ctk.CENTER
        )
        lable_2: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=FTC.label_2, font=self._font)
        label_3: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=FTC.label_3, font=self._font)
        self.entry_employee_personal_id: ctk.CTkEntry = ctk.CTkEntry(
            frame_1, font=self._font, state=Entry.READ_ONLY, justify=ctk.CENTER
        )
        self.combobox_employees: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_1,
            font=self._font,
            values=DatabaseHelper.get_list_of_employee_names(),
            state=Cb.READ_ONLY,
            command=lambda choice: self.__populate_employee_info(choice=choice, entry=self.entry_employee_personal_id),
            justify=ctk.CENTER,
        )
        label_4: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=FTC.label_4, font=self._font)
        self.date_entry_contract_date: DateEntry = DateEntry(
            frame_1,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            state=De.READ_ONLY,
            justify=ctk.CENTER,
            locale="hr_HR",
        )
        label_5: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=FTC.label_5, font=self._font)

        self._font.configure(weight=Font.NORMAL)
        label_6: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_6, font=self._font)
        label_7: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_7, font=self._font)

        frame_2: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_8: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=FTC.label_8, font=self._font)
        label_9: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=FTC.label_9, font=self._font)
        self.entry_job_description: ctk.CTkEntry = ctk.CTkEntry(frame_2, font=self._font, justify=ctk.CENTER)
        self.entry_job_description.insert(0, Entry.JOB_DESCRIPTION_DEFAULT)
        label_10: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=FTC.label_10, font=self._font)
        self.combobox_select_trail_numbers: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_2,
            font=self._font,
            values=Cb.NUMBERS_1_TO_30,
            state=Cb.READ_ONLY,
            justify=ctk.CENTER,
        )
        self.combobox_select_trail_numbers.set(Cb.NUMBERS_1_TO_30[0])
        self.combobox_select_trail_option_strvar: ctk.StringVar = ctk.StringVar()
        self.combobox_select_trail_option: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_2,
            command=lambda _: self.__set_trail_connection(),
            font=self._font,
            values=Cb.TRAIL_OPTIONS,
            state=Cb.READ_ONLY,
            justify=ctk.CENTER,
            variable=self.combobox_select_trail_option_strvar,
        )
        self.combobox_select_trail_option.set(Cb.TRAIL_OPTIONS[0])

        label_11: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=FTC.label_11, font=self._font)
        self.entry_working_place: ctk.CTkEntry = ctk.CTkEntry(frame_2, font=self._font, justify=ctk.CENTER)
        self.entry_working_place.insert(0, Entry.WORK_PLACE_DEFAULT)
        label_12: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=FTC.label_12, font=self._font)
        label_13: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=FTC.label_13, font=self._font)
        label_14: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=FTC.label_14, font=self._font)
        self.checkbox_start_job_date_strvar: ctk.StringVar() = ctk.StringVar()
        self.checkbox_start_job_date: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_2,
            text=Chbx.DATE,
            command=self.__toggle_start_job_date_checkbox,
            state=ctk.DISABLED,
            variable=self.checkbox_start_job_date_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.checkbox_start_job_date.select()
        self.checkbox_start_job_description_strvar: ctk.StringVar = ctk.StringVar()
        self.checkbox_start_job_description: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_2,
            text=Chbx.DESCRIPTION,
            command=self.__toggle_start_job_description_checkbox,
            variable=self.checkbox_start_job_description_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.checkbox_start_job_description.deselect()
        self.date_entry_start_date: DateEntry = DateEntry(
            frame_2,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            justify=ctk.CENTER,
            state=De.READ_ONLY,
            locale="hr_HR",
        )
        self.entry_start_date_description: ctk.CTkEntry = ctk.CTkEntry(
            frame_2, font=self._font, justify=ctk.CENTER, state=Entry.READ_ONLY
        )
        # label_16: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=FTC.label_16, font=self._font)
        label_15: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_15, font=self._font)
        frame_3: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)

        label_16: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_16, font=self._font)
        self.entry_salary_strvar: ctk.StringVar = ctk.StringVar()
        self.entry_salary: ctk.CTkEntry = ctk.CTkEntry(
            frame_3, font=self._font, justify=ctk.CENTER, textvariable=self.entry_salary_strvar
        )
        self.entry_salary.insert(0, Entry.SALARY_DEFAUL)
        self.entry_salary.bind(FOCUS_IN, lambda *args: self.__entry_salary_focus_in(*args))
        self.entry_salary.bind(FOCUS_OUT, lambda *args: self.__entry_salary_focus_out(*args))
        self.entry_salary_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_numeric(
                *args, entry=self.entry_salary, entry_str_var=self.entry_salary_strvar
            ),
        )
        label_17: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_17, font=self._font)
        label_18: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_18, font=self._font)
        label_19: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_19, font=self._font)
        self.entry_salary_bonus_strvar: ctk.StringVar = ctk.StringVar()
        self.entry_salary_bonus: ctk.CTkEntry = ctk.CTkEntry(
            frame_3, font=self._font, justify=ctk.CENTER, textvariable=self.entry_salary_bonus_strvar
        )
        self.entry_salary_bonus.insert(0, Entry.SALARY_DEFAUL)
        self.entry_salary_bonus_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_numeric(
                *args, entry=self.entry_salary_bonus, entry_str_var=self.entry_salary_bonus_strvar
            ),
        )
        label_20: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_20, font=self._font)
        label_21: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_21, font=self._font)
        label_22: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_22, font=self._font)
        label_23: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_23, font=self._font)
        label_24: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_24, font=self._font)
        label_25: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_25, font=self._font)
        label_26: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_26, font=self._font)
        label_27: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=FTC.label_27, font=self._font)

        self.entry_salary_increment_1_strvar: ctk.StringVar = ctk.StringVar()
        self.entry_salary_increment_1: ctk.CTkEntry = ctk.CTkEntry(
            frame_3, font=self._font, justify=ctk.CENTER, textvariable=self.entry_salary_increment_1_strvar
        )
        self.entry_salary_increment_1_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args,
                entry=self.entry_salary_increment_1,
                entry_str_var=self.entry_salary_increment_1_strvar,
                minimum=20
            ),
        )
        self.entry_salary_increment_1.insert(0, Entry.PERCENTAGE_20)

        self.entry_salary_increment_2_strvar: ctk.StringVar = ctk.StringVar()
        self.entry_salary_increment_2: ctk.CTkEntry = ctk.CTkEntry(
            frame_3, font=self._font, justify=ctk.CENTER, textvariable=self.entry_salary_increment_2_strvar
        )
        self.entry_salary_increment_2_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args,
                entry=self.entry_salary_increment_2,
                entry_str_var=self.entry_salary_increment_2_strvar,
                minimum=30
            ),
        )
        self.entry_salary_increment_2.insert(0, Entry.PERCENTAGE_30)

        self.entry_salary_increment_3_strvar: ctk.StringVar = ctk.StringVar()
        self.entry_salary_increment_3: ctk.CTkEntry = ctk.CTkEntry(
            frame_3, font=self._font, justify=ctk.CENTER, textvariable=self.entry_salary_increment_3_strvar
        )
        self.entry_salary_increment_3_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args,
                entry=self.entry_salary_increment_3,
                entry_str_var=self.entry_salary_increment_3_strvar,
                minimum=50
            ),
        )
        self.entry_salary_increment_3.insert(0, Entry.PERCENTAGE_50)

        self.entry_salary_increment_4_strvar: ctk.StringVar = ctk.StringVar()
        self.entry_salary_increment_4: ctk.CTkEntry = ctk.CTkEntry(
            frame_3, font=self._font, justify=ctk.CENTER, textvariable=self.entry_salary_increment_4_strvar
        )
        self.entry_salary_increment_4_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args,
                entry=self.entry_salary_increment_4,
                entry_str_var=self.entry_salary_increment_4_strvar,
                minimum=20
            ),
        )
        self.entry_salary_increment_4.insert(0, Entry.PERCENTAGE_20)

        self.entry_salary_increment_5_strvar: ctk.StringVar = ctk.StringVar()
        self.entry_salary_increment_5: ctk.CTkEntry = ctk.CTkEntry(
            frame_3, font=self._font, justify=ctk.CENTER, textvariable=self.entry_salary_increment_5_strvar
        )
        self.entry_salary_increment_5_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args,
                entry=self.entry_salary_increment_5,
                entry_str_var=self.entry_salary_increment_5_strvar,
                minimum=20
            ),
        )
        self.entry_salary_increment_5.insert(0, Entry.PERCENTAGE_20)

        self.entry_salary_increment_6_strvar: ctk.StringVar = ctk.StringVar()
        self.entry_salary_increment_6: ctk.CTkEntry = ctk.CTkEntry(
            frame_3, font=self._font, justify=ctk.CENTER, textvariable=self.entry_salary_increment_6_strvar
        )
        self.entry_salary_increment_6_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_salary_increment(
                *args,
                entry=self.entry_salary_increment_6,
                entry_str_var=self.entry_salary_increment_6_strvar,
                minimum=20
            ),
        )
        self.entry_salary_increment_6.insert(0, Entry.PERCENTAGE_20)

        label_28: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_28, font=self._font)
        frame_4: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)

        label_29: ctk.CTkLabel = ctk.CTkLabel(frame_4, text=FTC.label_29, font=self._font)

        frame_5: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_30: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_30, font=self._font)
        label_31: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=FTC.label_31, font=self._font)
        self.combobox_work_type: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_5,
            font=self._font,
            values=Cb.WORK_TIME_TYPE,
            state=Cb.READ_ONLY,
            command=lambda _: self.__validate_combobox_work_type(),
            justify=ctk.CENTER,
        )
        self.combobox_work_type.set(Cb.WORK_TIME_TYPE[0])
        label_32: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=FTC.label_32, font=self._font)
        self.spinbox_weekly_working_hours: FloatSpinbox = FloatSpinbox(
            frame_5, width=200, step_size=0.5, numeric_type=float, start_from=40.0
        )
        self.spinbox_weekly_working_hours.entry_str_var.trace_add(
            WRITE, lambda *args: self.__set_up_spinbox_weekly_working_hours_for_full_time(*args)
        )
        label_33: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=FTC.label_33, font=self._font)

        label_34: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=FTC.label_34, font=self._font)
        self.combobox_working_shift: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_5,
            font=self._font,
            values=Cb.WORK_TIME_SHIFT,
            state=Cb.READ_ONLY,
            command=lambda _: self.__validate_combobox_working_shift(),
            justify=ctk.CENTER,
        )
        self.combobox_working_shift.set(Cb.WORK_TIME_SHIFT[0])
        self.label_35: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=FTC.label_35, font=self._font)
        self.time_picker_working_time_start: TimePicker = TimePicker(frame_5)
        self.time_picker_working_time_end: TimePicker = TimePicker(frame_5)
        self.entry_working_shift_description: ctk.CTkEntry = ctk.CTkEntry(frame_5, font=self._font, justify=ctk.CENTER)
        label_36: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=FTC.label_36, font=self._font)
        label_37: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=FTC.label_37, font=self._font)
        self.combobox_weekly_time_off: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_5, font=self._font, values=Cb.WEEKLY_TIME_OFF, state=Cb.READ_ONLY, command=None, justify=ctk.CENTER
        )
        self.combobox_weekly_time_off.set(Cb.WEEKLY_TIME_OFF[2])
        label_38: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=FTC.label_38, font=self._font)
        self.combobox_vacation: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_5, font=self._font, values=Cb.VACATION, state=Cb.READ_ONLY, command=None, justify=ctk.CENTER
        )
        self.combobox_vacation.set(Cb.VACATION[16])
        self.entry_vacation_description: ctk.CTkEntry = ctk.CTkEntry(frame_5, font=self._font, justify=ctk.CENTER)
        self.entry_vacation_description.insert(0, Entry.DASH_DEFAULT)
        label_39: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_39, font=self._font)
        label_40: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_40, font=self._font)
        label_41: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_41, font=self._font)

        frame_6: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_42: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=FTC.label_42, font=self._font)
        label_43: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=FTC.label_43, font=self._font)
        self.spinbox_contract_termination_employer: FloatSpinbox = FloatSpinbox(
            frame_6, step_size=1, numeric_type=int, start_from=15
        )
        self.spinbox_contract_termination_employer.entry_str_var.trace(
            ctk.W, lambda *args: self.__spinbox_positive_only(*args, spinbox=self.spinbox_contract_termination_employer)
        )
        label_44: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=FTC.label_44, font=self._font)
        self.spinbox_contract_termination_employee: FloatSpinbox = FloatSpinbox(
            frame_6, step_size=1, numeric_type=int, start_from=15
        )
        self.spinbox_contract_termination_employee.entry_str_var.trace(
            ctk.W, lambda *args: self.__spinbox_positive_only(*args, spinbox=self.spinbox_contract_termination_employee)
        )
        label_45: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=FTC.label_45, font=self._font)

        label_46: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_46, font=self._font)
        self.entry_rights_and_obligations: ctk.CTkEntry = ctk.CTkEntry(container, font=self._font, justify=ctk.CENTER)
        self.entry_rights_and_obligations.insert(0, Entry.RIGHTS_AND_OBLIGATIONS_DEFAULT)

        label_47: ctk.CTkLabel = ctk.CTkLabel(container, text=FTC.label_47, font=self._font)

        frame_7: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK_1529)
        label_48: ctk.CTkLabel = ctk.CTkLabel(frame_7, text=FTC.label_48, font=self._font)
        self.combobox_court: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_7,
            font=self._font,
            values=Cb.COURTS,
            state=Cb.READ_ONLY,
            command=None,
            justify=ctk.CENTER,
        )
        self.combobox_court.set(Cb.COURTS[14])
        label_49: ctk.CTkLabel = ctk.CTkLabel(frame_7, text=FTC.label_49, font=self._font)

        self.checkbox_contract_starts_with_date_strvar: ctk.StringVar() = ctk.StringVar()
        self.checkbox_contract_starts_with_date: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_7,
            text=Chbx.DATE,
            command=self.__toggle_contract_starts_with_date_checkbox,
            state=ctk.DISABLED,
            variable=self.checkbox_contract_starts_with_date_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.checkbox_contract_starts_with_date.select()
        self.checkbox_contract_starts_with_description_strvar: ctk.StringVar = ctk.StringVar()
        self.checkbox_contract_starts_with_description: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_7,
            text=Chbx.DESCRIPTION,
            command=self.__toggle_contract_starts_with_description_checkbox,
            variable=self.checkbox_contract_starts_with_description_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.checkbox_contract_starts_with_description.deselect()

        self.date_entry_contract_starting_with: DateEntry = DateEntry(
            frame_7, selectmode=De.DAY_MODE, state=De.READ_ONLY, justify=ctk.CENTER, locale="hr_HR"
        )
        self.entry_contract_starts_with_description: ctk.CTkEntry = ctk.CTkEntry(
            frame_7, font=self._font, justify=ctk.CENTER, state=Entry.READ_ONLY
        )
        label_50: ctk.CTkLabel = ctk.CTkLabel(frame_7, text=FTC.label_50, font=self._font)

        # # CONTAINER, LINE 1
        # # FRAME 1
        # # LINE 1
        frame_1.pack(side=ctk.TOP)
        label_1.pack(padx=10, pady=10, side=ctk.LEFT)
        self.combobox_employers.pack(pady=10, side=ctk.LEFT)
        self.entry_employer_info.pack(padx=10, pady=10, side=ctk.LEFT)
        lable_2.pack(padx=(0, 10), pady=10, side=ctk.LEFT)
        self.entry_director.pack(pady=10, side=ctk.LEFT)
        label_3.pack(padx=10, pady=10, side=ctk.LEFT)
        self.combobox_employees.pack(pady=10, side=ctk.LEFT)
        self.entry_employee_personal_id.pack(padx=10, pady=10, side=ctk.LEFT)
        label_4.pack(pady=10, side=ctk.LEFT)
        self.date_entry_contract_date.pack(padx=10, pady=10, side=ctk.LEFT)
        label_5.pack(pady=10, side=ctk.LEFT)

        # # CONTAINER, LINE 2 AND 3
        label_6.pack(pady=10, side=ctk.TOP)
        label_7.pack(side=ctk.TOP)

        # # CONTAINER, LINE 4
        # # FRAME 2
        frame_2.pack(padx=10, pady=10, side=ctk.TOP)
        self.__set_up_frame_grid(frame_2, App.APP_GRID_SIZE)
        # LINE 1
        label_8.grid(padx=10, pady=5, column=0, row=0, columnspan=20, sticky=ctk.W)
        # # LINE 2
        label_9.grid(padx=10, column=0, row=1, columnspan=20, sticky=ctk.W)
        # # LINE 3
        self.entry_job_description.grid(padx=10, pady=5, column=0, row=2, columnspan=20, sticky=ctk.EW)
        # # LINE 4
        label_10.grid(padx=10, column=0, row=3, columnspan=12, sticky=ctk.W)
        self.combobox_select_trail_numbers.grid(padx=10, pady=5, column=12, row=3, columnspan=4, sticky=ctk.EW)
        self.combobox_select_trail_option.grid(padx=10, pady=5, column=16, row=3, columnspan=4, sticky=ctk.EW)
        # # LINE 5
        label_11.grid(padx=10, column=0, row=4, columnspan=5, sticky=ctk.W)
        self.entry_working_place.grid(padx=10, column=5, row=4, columnspan=7, sticky=ctk.EW)
        label_12.grid(padx=10, column=12, row=4, columnspan=8, sticky=ctk.W)
        # # LINE 6
        label_13.grid(padx=10, pady=5, column=0, row=5, columnspan=20, sticky=ctk.W)
        # # LINE 7
        label_14.grid(padx=10, pady=5, column=0, row=6, columnspan=5, sticky=ctk.W)
        self.checkbox_start_job_date.grid(padx=10, pady=5, column=6, row=6, sticky=ctk.EW)
        self.checkbox_start_job_description.grid(padx=10, pady=5, column=7, row=6, sticky=ctk.EW)
        self.date_entry_start_date.grid(padx=10, column=8, row=6, columnspan=5, sticky=ctk.EW)
        self.entry_start_date_description.grid(padx=10, column=13, row=6, columnspan=7, sticky=ctk.EW)

        # # CONTAINER, LINE 5
        label_15.pack(pady=10, side=ctk.TOP)
        # # CONTAINER, LINE 7,
        # # FRAME 2
        frame_3.pack(padx=10, pady=10, side=ctk.TOP)
        self.__set_up_frame_grid(frame_3, App.APP_GRID_SIZE)
        # # LINE 1
        label_16.grid(padx=10, pady=5, column=0, row=0, columnspan=5, sticky=ctk.W)
        self.entry_salary.grid(padx=10, pady=5, column=5, row=0, columnspan=13, sticky=ctk.EW)
        label_17.grid(padx=10, pady=5, column=18, row=0, columnspan=2, sticky=ctk.W)
        # # LINE 2
        label_18.grid(padx=10, column=0, row=1, columnspan=20, sticky=ctk.W)
        # # LINE 3
        label_19.grid(padx=10, pady=5, column=0, row=2, columnspan=5, sticky=ctk.W)
        self.entry_salary_bonus.grid(padx=10, pady=5, column=5, row=2, columnspan=5, sticky=ctk.EW)
        label_20.grid(padx=10, pady=5, column=10, row=2, columnspan=10, sticky=ctk.W)
        # # LINE 4
        label_21.grid(padx=10, column=0, row=3, columnspan=5, sticky=ctk.W)
        # # LINE 5
        label_22.grid(padx=10, column=0, row=5, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_1.grid(padx=10, column=5, row=5, columnspan=5, sticky=ctk.NE)
        # # LINE 6
        label_23.grid(padx=10, pady=5, column=0, row=6, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_2.grid(padx=10, pady=5, column=5, row=6, columnspan=5, sticky=ctk.NE)
        # # LINE 7
        label_24.grid(padx=10, column=0, row=7, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_3.grid(padx=10, column=5, row=7, columnspan=5, sticky=ctk.NE)
        # # LINE 8
        label_25.grid(padx=10, pady=5, column=0, row=8, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_4.grid(padx=10, pady=5, column=5, row=8, columnspan=5, sticky=ctk.NE)
        # # LINE 9
        label_26.grid(padx=10, column=0, row=9, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_5.grid(padx=10, column=5, row=9, columnspan=5, sticky=ctk.NE)
        # # LINE 10
        label_27.grid(padx=10, pady=5, column=0, row=10, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_6.grid(padx=10, pady=5, column=5, row=10, columnspan=5, sticky=ctk.NE)

        # # CONTAINER, LINE 7
        label_28.pack(pady=(10, 0), side=ctk.TOP)
        # # CONTAINER, LINE 8, FRAME 4
        frame_4.pack(padx=10, pady=10, side=ctk.TOP)

        # # FRAME 4, LINE 1
        label_29.pack(padx=10, pady=10, side=ctk.TOP)

        # # CONTAINER, LINE 9
        label_30.pack(padx=10, pady=10, side=ctk.TOP)
        # # LINE 10, FRAME 5
        frame_5.pack(padx=10, pady=(0, 10), side=ctk.TOP)
        self.__set_up_frame_grid(frame_5, App.APP_GRID_SIZE)
        # # FRAME 5 LINE 1
        label_31.grid(padx=10, pady=5, column=0, row=0, sticky=ctk.W)
        self.combobox_work_type.grid(padx=10, pady=5, column=1, row=0, columnspan=7, sticky=ctk.EW)
        label_32.grid(padx=10, pady=5, column=8, row=0, columnspan=2, sticky=ctk.W)
        self.spinbox_weekly_working_hours.grid(padx=10, pady=5, column=10, row=0, columnspan=4, sticky=ctk.EW)
        label_33.grid(padx=10, pady=5, column=14, row=0, sticky=ctk.W)
        # # LINE 2
        label_34.grid(padx=10, column=0, row=1, columnspan=3, sticky=ctk.W)
        self.combobox_working_shift.grid(padx=10, column=3, row=1, columnspan=4, sticky=ctk.EW)
        self.__set_up_ui_for_working_shift_one_time_and_flexible()
        # # LINE 3
        label_36.grid(padx=10, pady=5, column=0, row=2, columnspan=20, sticky=ctk.W)
        # # LINE 4
        label_37.grid(padx=10, column=0, row=3, columnspan=3, sticky=ctk.W)
        self.combobox_weekly_time_off.grid(padx=10, column=3, row=3, columnspan=7, sticky=ctk.EW)
        # # LINE 5
        label_38.grid(padx=10, pady=5, column=0, row=4, columnspan=6, sticky=ctk.W)
        self.combobox_vacation.grid(padx=10, pady=5, column=6, row=4, columnspan=3, sticky=ctk.EW)
        self.entry_vacation_description.grid(padx=10, pady=5, column=9, row=4, columnspan=11, sticky=ctk.EW)

        # # CONTAINER, LINE 11
        label_39.pack(padx=10, pady=10, side=ctk.TOP)
        # # LINE 12
        label_40.pack(padx=10, pady=(0, 10), side=ctk.TOP)
        # # LINE 13
        label_41.pack(padx=10, pady=10, side=ctk.TOP)
        # # LINE 14, FRAME 6
        frame_6.pack(padx=10, side=ctk.TOP)
        self.__set_up_frame_grid(frame_6, App.APP_GRID_SIZE)
        # # LINE 1
        label_42.grid(padx=10, pady=5, column=0, columnspan=20, row=0, sticky=ctk.W)
        # LINE 2
        label_43.grid(padx=10, column=0, row=1, sticky=ctk.W)
        self.spinbox_contract_termination_employer.grid(padx=10, pady=5, column=1, row=1, sticky=ctk.EW)
        label_44.grid(padx=10, column=2, row=1, sticky=ctk.W)
        self.spinbox_contract_termination_employee.grid(padx=10, pady=5, column=3, row=1, sticky=ctk.EW)
        label_45.grid(padx=10, column=4, row=1, sticky=ctk.W)

        # # CONTAINER, LINE 15
        label_46.pack(padx=10, pady=10, side=ctk.TOP)
        # # LINE 16
        self.entry_rights_and_obligations.pack(padx=125, pady=5, side=ctk.TOP, fill=ctk.BOTH)

        # # LINE 17
        label_47.pack(padx=10, pady=10, side=ctk.TOP)
        # # LINE 18, FRAME 8
        frame_7.pack(padx=10, pady=(5, 200), side=ctk.TOP)
        self.__set_up_frame_grid(frame_7, App.APP_GRID_SIZE)
        # # FRAME 8, LINE 1
        label_48.grid(padx=10, pady=5, column=0, row=0, columnspan=4, sticky=ctk.W)
        self.combobox_court.grid(padx=(0, 500), column=4, row=0, columnspan=16, sticky=ctk.EW)
        # # LINE 2
        label_49.grid(padx=10, pady=5, column=0, row=1, sticky=ctk.W)
        self.checkbox_contract_starts_with_date.grid(padx=10, pady=5, column=1, row=1, sticky=ctk.W)
        self.checkbox_contract_starts_with_description.grid(padx=10, pady=5, column=2, row=1, sticky=ctk.W)
        self.date_entry_contract_starting_with.grid(padx=10, column=3, row=1, columnspan=3, sticky=ctk.EW)
        self.entry_contract_starts_with_description.grid(padx=10, pady=5, column=6, row=1, columnspan=14, sticky=ctk.EW)
        # # LINE 3
        label_50.grid(padx=10, pady=5, column=0, row=2, columnspan=20, sticky=ctk.W)

    def __toggle_contract_starts_with_date_checkbox(self) -> None:
        checkbox_date_state: str = self.checkbox_contract_starts_with_date_strvar.get()
        if checkbox_date_state == Chbx.ON_STATE:
            self.date_entry_contract_starting_with.configure(state=De.READ_ONLY)
            self.checkbox_contract_starts_with_description.configure(state=ctk.NORMAL)
        else:
            self.date_entry_contract_starting_with.configure(state=De.DISABLED)
            self.checkbox_contract_starts_with_description.configure(state=ctk.DISABLED)

    def __toggle_contract_starts_with_description_checkbox(self):
        checkbox_description_state: str = self.checkbox_contract_starts_with_description_strvar.get()
        self.entry_contract_starts_with_description.delete(0, ctk.END)
        if checkbox_description_state == Chbx.ON_STATE:
            self.entry_contract_starts_with_description.configure(state=Entry.WRITE)
            self.entry_contract_starts_with_description.insert(0, Entry.START_DATE_DESCRIPTION_DEFAULT)
            self.checkbox_contract_starts_with_date.configure(state=ctk.NORMAL)
        else:
            self.entry_contract_starts_with_description.configure(state=Entry.READ_ONLY)
            self.checkbox_contract_starts_with_date.configure(state=ctk.DISABLED)

    def __toggle_start_job_date_checkbox(self) -> None:
        checkbox_date_state: str = self.checkbox_start_job_date_strvar.get()
        if checkbox_date_state == Chbx.ON_STATE:
            self.date_entry_start_date.configure(state=De.READ_ONLY)
            self.checkbox_start_job_description.configure(state=ctk.NORMAL)
        else:
            self.date_entry_start_date.configure(state=De.DISABLED)
            self.checkbox_start_job_description.configure(state=ctk.DISABLED)

    def __toggle_start_job_description_checkbox(self) -> None:
        checkbox_description_state: str = self.checkbox_start_job_description_strvar.get()
        self.entry_start_date_description.delete(0, ctk.END)
        if checkbox_description_state == Chbx.ON_STATE:
            self.entry_start_date_description.configure(state=Entry.WRITE)
            self.entry_start_date_description.insert(0, Entry.START_DATE_DESCRIPTION_DEFAULT)
            self.checkbox_start_job_date.configure(state=ctk.NORMAL)
        else:
            self.entry_start_date_description.configure(state=Entry.READ_ONLY)
            self.checkbox_start_job_date.configure(state=ctk.DISABLED)

    def __spinbox_positive_only(self, *args, spinbox: FloatSpinbox):
        try:
            current_value: int = spinbox.get()
            if current_value < 0:
                self.__entry_delete_insert_readonly(spinbox.entry, str(0))
        except TypeError:
            pass

    def __entry_salary_focus_in(self, *args) -> None:
        self.entry_salary.bind("<Button-1>", "break")

    def __entry_salary_focus_out(self, *args) -> None:
        self.entry_salary.unbind("<Button-1>")

    def __validate_combobox_working_shift(self) -> None:
        current_value: str = self.combobox_working_shift.get()
        if current_value == ONE_TIME:
            self.__set_up_ui_for_working_shift_one_time_and_flexible()
        elif current_value == TWICE:
            self.__set_up_ui_for_working_shift_twice_and_description()
        elif current_value == FLEXIBLE:
            self.__set_up_ui_for_working_shift_one_time_and_flexible()
        else:
            self.__set_up_ui_for_working_shift_twice_and_description()

    def __set_up_ui_for_working_shift_one_time_and_flexible(self) -> None:
        self.entry_working_shift_description.grid_remove()
        self.label_35.grid(padx=10, column=7, row=1, columnspan=3, sticky=ctk.W)
        self.time_picker_working_time_start.grid(padx=10, column=10, row=1, columnspan=4, sticky=ctk.EW)
        self.time_picker_working_time_end.grid(padx=10, column=14, row=1, sticky=ctk.EW)

    def __set_up_ui_for_working_shift_twice_and_description(self) -> None:
        self.label_35.grid_remove()
        self.time_picker_working_time_start.grid_remove()
        self.time_picker_working_time_end.grid_remove()
        self.entry_working_shift_description.grid(padx=10, column=7, row=1, columnspan=13, sticky=ctk.EW)
        self.entry_working_shift_description.delete(0, ctk.END)
        self.entry_working_shift_description.insert(0, Entry.WORKING_SHIFT_DESCRIPTION_DEFAULT)

    def __validate_combobox_work_type(self) -> None:
        current_value: str = self.combobox_work_type.get()
        if current_value == FULL_TIME:
            self.spinbox_weekly_working_hours.entry_str_var.trace_remove(
                WRITE, self.spinbox_weekly_working_hours.entry_str_var.trace_info()[0][1]
            )
            self.__entry_delete_insert_readonly(self.spinbox_weekly_working_hours.entry, str(40.0))
            self.spinbox_weekly_working_hours.entry_str_var.trace_add(
                WRITE, lambda *args: self.__set_up_spinbox_weekly_working_hours_for_full_time(*args)
            )
        else:
            self.spinbox_weekly_working_hours.entry_str_var.trace_remove(
                WRITE, self.spinbox_weekly_working_hours.entry_str_var.trace_info()[0][1]
            )
            self.__entry_delete_insert_readonly(self.spinbox_weekly_working_hours.entry, str(20.0))
            self.spinbox_weekly_working_hours.entry_str_var.trace_add(
                WRITE, lambda *args: self.__set_up_spinbox_weekly_working_hours_for_part_time(*args)
            )
            self.__set_up_spinbox_weekly_working_hours_for_part_time()

    def __set_up_spinbox_weekly_working_hours_for_full_time(self, *args) -> None:
        try:
            current_value: float = round(float(self.spinbox_weekly_working_hours.get()), 2)
            if current_value < 40.0:
                self.__entry_delete_insert_readonly(self.spinbox_weekly_working_hours.entry, str(40.0))
            if current_value > 56.0:
                self.__entry_delete_insert_readonly(self.spinbox_weekly_working_hours.entry, str(56.0))
        except TypeError:
            pass

    def __set_up_spinbox_weekly_working_hours_for_part_time(self, *args) -> None:
        try:
            current_value: float = round(float(self.spinbox_weekly_working_hours.get()), 2)
            if current_value < 0.5:
                self.__entry_delete_insert_readonly(self.spinbox_weekly_working_hours.entry, str(0.5))
            if current_value > 39.5:
                self.__entry_delete_insert_readonly(self.spinbox_weekly_working_hours.entry, str(39.5))
        except TypeError:
            pass

    def __set_up_frame_grid(self, frame: ctk.CTkFrame, grid_size: int) -> None:
        for cell in range(grid_size):
            frame.rowconfigure(cell, weight=1)
            frame.columnconfigure(cell, weight=1)

    def __populate_employee_info(self, choice: str, entry: ctk.CTkEntry) -> None:
        personal_id = DatabaseHandler.get_employee_personal_id_from_name_and_last_name(choice)
        entry.configure(state=Entry.WRITE)
        entry.delete(0, Entry.DELETE)
        entry.insert(0, personal_id)
        entry.configure(state=Entry.READ_ONLY)

    def __populate_employer_info(self, choice: str) -> None:
        address: str = DatabaseHandler.get_company_info(choice)
        self.__entry_delete_insert_readonly(self.entry_employer_info, address)

        director: str = DatabaseHandler.get_company_director_from_company_name(choice)
        self.__entry_delete_insert_readonly(self.entry_director, director)

    def __entry_delete_and_insert(self, entry: ctk.CTkEntry, text: str = "") -> None:
        entry.insert(0, text)
        entry.delete(len(text), ctk.END)

    def __validate_numeric(self, *args, **kwargs) -> None:
        entry: ctk.CTkEntry = kwargs[ENTRY]
        entry_str_var: ctk.StringVar = kwargs[ENTRY_STR_VAR]

        last_character_index: int = entry.index(ctk.INSERT)
        item: str = entry_str_var.get()
        try:
            item_type = type(float(item))
            if item_type == type(float(1.0)):
                if re.search(TWO_DECIMALS_REGEX, entry.get()):
                    self.__entry_delete_and_insert(entry, str(0.0) + entry.get()[-1])
                elif re.search(ONE_DECIMAL_REGEX, entry.get()):
                    self.__entry_delete_and_insert(entry, str(0) + DOT + entry.get()[len(entry.get()) - 2 :])
                elif re.search(BACKSPACE_TWO_DECIMAL_REGEX, entry.get()):
                    self.__entry_delete_and_insert(entry, str(0) + DOT + entry.get()[0] + entry.get()[-1])
                elif re.search(BACKSPACE_ONE_DECIMAL_REGEX, entry.get()):
                    self.__entry_delete_and_insert(entry, str(0.00))
                else:
                    digits: List = [digit for digit in entry.get() if digit.isdigit()]
                    output: str = EMPTY_STRING
                    for index in range(len(digits) - 2):
                        if index == 0 and digits[index] == str(0):
                            pass
                        else:
                            output += digits[index]
                    output += DOT + digits[-2] + digits[-1]
                    self.__entry_delete_and_insert(entry, output)
        except:
            entry.delete(last_character_index - 1, last_character_index)

    def __set_trail_connection(self) -> None:
        value: str = self.combobox_select_trail_option_strvar.get()
        self.combobox_select_trail_numbers.set(Cb.TRAIL[value][0])
        self.combobox_select_trail_numbers.configure(values=Cb.TRAIL[value])

    def __validate_salary_increment(self, *args, **kwargs) -> None:
        entry: ctk.CTkEntry = kwargs[ENTRY]
        entry_str_var: ctk.StringVar = kwargs[ENTRY_STR_VAR]
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
