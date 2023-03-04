import customtkinter as ctk

from math import isclose
from tkcalendar import DateEntry
from typing import Any

import constants.application as App
import constants.buttons as Btn
import constants.checkbox as Chbx
import constants.colors as Color
import constants.combobox as Cb
import constants.date_entry as De
import constants.entry as Entry
import constants.fonts as Font
import constants.part_time_contract as PTC

from database import DatabaseHandler
from constants.specials import *
from utils import ComboboxHelper
from widgets import FloatSpinbox, ScrollbarFrame, TimePicker

from .program_frame import ProgramFrame

WRITE = "write"


class PartTimeContractFrame(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(PartTimeContractFrame, self).__init__(*args, **kwargs)

        self.configure(fg_color=Color.GREEN)
        self._set_up_grid(20, 20)
        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        _button_clear_fields: ctk.CTkButton = ctk.CTkButton(self, text=Btn.CLEAR_FIELD, font=self._font)
        _button_clear_fields.grid(padx=10, pady=10, column=0, row=0, columnspan=5, sticky=ctk.NSEW)

        _button_validate_contract: ctk.CTkButton = ctk.CTkButton(self, text=Btn.VALIDATE_CONTRACT, font=self._font)
        _button_validate_contract.grid(
            padx=(0, 10),
            pady=10,
            column=5,
            row=0,
            columnspan=5,
            sticky=ctk.NSEW,
        )

        _button_generate_pdf: ctk.CTkButton = ctk.CTkButton(self, text=Btn.GENERATE_PDF, font=self._font)
        _button_generate_pdf.grid(
            padx=(0, 10),
            pady=10,
            column=10,
            row=0,
            columnspan=5,
            sticky=ctk.NSEW,
        )

        _button_print: ctk.CTkButton = ctk.CTkButton(self, text=Btn.PRINT, font=self._font)
        _button_print.grid(
            padx=(0, 10),
            pady=10,
            column=15,
            row=0,
            columnspan=5,
            sticky=ctk.NSEW,
        )

        self._contract_frame: ctk.CTkScrollableFrame = ctk.CTkScrollableFrame(self, fg_color=Color.BLACK)
        self._contract_frame.grid(
            padx=10,
            pady=(0, 10),
            column=0,
            row=1,
            rowspan=19,
            columnspan=20,
            sticky=ctk.NSEW,
        )
        self._contract_frame.bind("<Button-4>", lambda _: self.scroll_up())
        self._contract_frame.bind("<Button-5>", lambda _: self.scroll_down())

        self.__generate_contract_form(self._contract_frame)

    def scroll_up(self) -> None:
        self._contract_frame._parent_canvas.yview_scroll(-1, ctk.UNITS)

    def scroll_down(self) -> None:
        self._contract_frame._parent_canvas.yview_scroll(1, ctk.UNITS)

    def __generate_contract_form(self, container: ctk.CTkScrollableFrame) -> None:
        frame_1: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK)
        self._font.configure(size=Font.SIZE_14, weight=Font.NORMAL)

        label_1: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=PTC.label_1, font=self._font)
        self.entry_employer_info: ctk.CTkEntry = ctk.CTkEntry(
            frame_1, font=self._font, state=Entry.READ_ONLY, justify=ctk.CENTER
        )
        entry_director: ctk.CTkEntry = ctk.CTkEntry(frame_1, font=self._font, state=Entry.READ_ONLY, justify=ctk.CENTER)
        self.combobox_employers: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_1,
            font=self._font,
            values=ComboboxHelper.get_list_of_employers(),
            state=Cb.READ_ONLY,
            command=lambda choice: self.__populate_employer_info(
                choice=choice,
                entry_info=self.entry_employer_info,
                entry_director=entry_director,
            ),
            justify=ctk.CENTER,
        )
        lable_2: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=PTC.label_2, font=self._font)
        label_3: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=PTC.label_3, font=self._font)
        self.entry_employee_personal_id: ctk.CTkEntry = ctk.CTkEntry(
            frame_1, font=self._font, state=Entry.READ_ONLY, justify=ctk.CENTER
        )
        self.combobox_employees: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_1,
            font=self._font,
            values=ComboboxHelper.get_list_of_employee_names(),
            state=Cb.READ_ONLY,
            command=lambda choice: self.__populate_employee_info(choice=choice, entry=self.entry_employee_personal_id),
            justify=ctk.CENTER,
        )
        label_4: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=PTC.label_4, font=self._font)
        self.date_entry_contract_date: DateEntry = DateEntry(
            frame_1,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            state=De.READ_ONLY,
            justify=ctk.CENTER,
            locale="hr_HR",
        )
        label_5: ctk.CTkLabel = ctk.CTkLabel(frame_1, text=PTC.label_5, font=self._font)

        self._font.configure(weight=Font.NORMAL)
        label_6: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_6, font=self._font)
        label_7: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_7, font=self._font)

        frame_2: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK)
        label_8: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=PTC.label_8, font=self._font)
        label_9: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=PTC.label_9, font=self._font)
        self.date_entry_end_job_date: DateEntry = DateEntry(
            frame_2,
            date_pattern=De.DATE_PATTERN,
            selectmode=De.DAY_MODE,
            state=De.READ_ONLY,
            justify=ctk.CENTER,
            locale="hr_HR",
        )
        label_10: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=PTC.label_10, font=self._font)
        self.entry_job_description: ctk.CTkEntry = ctk.CTkEntry(frame_2, font=self._font, justify=ctk.CENTER)
        self.entry_job_description.insert(0, Entry.JOB_DESCRIPTION_DEFAULT)
        label_11: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=PTC.label_11, font=self._font)
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
        # LABEL 12 IS NO LONGER NEEDED
        label_13: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=PTC.label_13, font=self._font)
        self.entry_working_place: ctk.CTkEntry = ctk.CTkEntry(frame_2, font=self._font, justify=ctk.CENTER)
        self.entry_working_place.insert(0, Entry.WORK_PLACE_DEFAULT)
        label_14: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=PTC.label_14, font=self._font)
        label_15: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=PTC.label_15, font=self._font)
        label_16: ctk.CTkLabel = ctk.CTkLabel(frame_2, text=PTC.label_16, font=self._font)
        self.checkbox_date_strvar: ctk.StringVar() = ctk.StringVar()
        self.checkbox_date: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_2,
            text=Chbx.DATE,
            command=self.__toggle_date_checkbox,
            state=ctk.DISABLED,
            variable=self.checkbox_date_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.checkbox_date.select()
        self.checkbox_description_strvar: ctk.StringVar = ctk.StringVar()
        self.checkbox_description: ctk.CTkCheckBox = ctk.CTkCheckBox(
            frame_2,
            text=Chbx.DESCRIPTION,
            command=self.__togglee_description_checkbox,
            variable=self.checkbox_description_strvar,
            onvalue=Chbx.ON_STATE,
            offvalue=Chbx.OFF_STATE,
        )
        self.checkbox_description.deselect()
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
        label_18: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_18, font=self._font)
        frame_3: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK)

        label_19: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_19, font=self._font)
        self.entry_salary_strvar: ctk.StringVar = ctk.StringVar()
        self.entry_salary: ctk.CTkEntry = ctk.CTkEntry(
            frame_3, font=self._font, justify=ctk.CENTER, textvariable=self.entry_salary_strvar
        )
        self.entry_salary.insert(0, Entry.SALARY_DEFAUL)
        self.entry_salary_strvar.trace_add(
            WRITE,
            lambda *args: self.__validate_numeric(
                *args, entry=self.entry_salary, entry_str_var=self.entry_salary_strvar
            ),
        )
        label_20: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_20, font=self._font)
        # LABEL 21 IS NO LONGER NEEDED
        label_22: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_22, font=self._font)
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
        label_23: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_23, font=self._font)
        label_24: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_24, font=self._font)
        label_25: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_25, font=self._font)
        label_26: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_26, font=self._font)
        label_27: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_27, font=self._font)
        label_28: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_28, font=self._font)
        label_29: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_29, font=self._font)
        label_30: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_30, font=self._font)
        label_31: ctk.CTkLabel = ctk.CTkLabel(frame_3, text=PTC.label_31, font=self._font)

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
        self.entry_salary_increment_1.insert(0, PERCENTAGE_20)

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
                minimum=50
            ),
        )
        self.entry_salary_increment_2.insert(0, PERCENTAGE_50)

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
                minimum=30
            ),
        )
        self.entry_salary_increment_3.insert(0, PERCENTAGE_30)

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
        self.entry_salary_increment_4.insert(0, PERCENTAGE_20)

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
        self.entry_salary_increment_5.insert(0, PERCENTAGE_20)

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
        self.entry_salary_increment_6.insert(0, PERCENTAGE_20)

        label_32: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_32, font=self._font)
        frame_4: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK)

        label_33: ctk.CTkLabel = ctk.CTkLabel(frame_4, text=PTC.label_33, font=self._font)

        frame_5: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK)
        label_34: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_34, font=self._font)
        label_35: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=PTC.label_35, font=self._font)
        self.combobox_work_type: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_5,
            font=self._font,
            values=Cb.WORK_TIME_TYPE,
            state=Cb.READ_ONLY,
            command=lambda _: self.__validate_combobox_work_type(),
            justify=ctk.CENTER,
        )
        self.combobox_work_type.set(Cb.WORK_TIME_TYPE[0])
        label_36: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=PTC.label_36, font=self._font)
        self.spinbox_weekly_working_hours: FloatSpinbox = FloatSpinbox(
            frame_5, width=200, step_size=0.5, numeric_type=float, start_from=40.0
        )
        self.spinbox_weekly_working_hours.entry_str_var.trace_add(
            WRITE, lambda *args: self.__set_up_spinbox_weekly_working_hours_for_full_time(*args)
        )
        label_37: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=PTC.label_37, font=self._font)

        label_38: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=PTC.label_38, font=self._font)
        self.combobox_working_shift: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_5,
            font=self._font,
            values=Cb.WORK_TIME_SHIFT,
            state=Cb.READ_ONLY,
            command=lambda _: self.__validate_combobox_working_shift(),
            justify=ctk.CENTER,
        )
        self.combobox_working_shift.set(Cb.WORK_TIME_SHIFT[0])
        self.label_39: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=PTC.label_39, font=self._font)
        self.time_picker_working_time_start: TimePicker = TimePicker(frame_5)
        self.time_picker_working_time_end: TimePicker = TimePicker(frame_5)
        self.entry_working_shift_description: ctk.CTkEntry = ctk.CTkEntry(frame_5, font=self._font, justify=ctk.CENTER)
        label_40: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=PTC.label_40, font=self._font)
        label_41: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=PTC.label_41, font=self._font)
        self.combobox_weekly_time_off: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_5, font=self._font, values=Cb.WEEKLY_TIME_OFF, state=Cb.READ_ONLY, command=None, justify=ctk.CENTER
        )
        self.combobox_weekly_time_off.set(Cb.WEEKLY_TIME_OFF[2])
        label_42: ctk.CTkLabel = ctk.CTkLabel(frame_5, text=PTC.label_42, font=self._font)
        self.combobox_vacation: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_5, font=self._font, values=Cb.VACATION, state=Cb.READ_ONLY, command=None, justify=ctk.CENTER
        )
        self.combobox_vacation.set(Cb.VACATION[17])
        self.entry_vacation_description: ctk.CTkEntry = ctk.CTkEntry(frame_5, font=self._font, justify=ctk.CENTER)
        self.entry_vacation_description.insert(0, Entry.DASH_DEFAULT)
        label_43: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_43, font=self._font)
        label_44: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_44, font=self._font)
        # LABEL 45 IS NO LONGER NEEDED
        label_46: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_46, font=self._font)

        frame_6: ctk.CTkFrame = ctk.CTkFrame(container, fg_color=Color.BLACK)
        label_47: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=PTC.label_47, font=self._font)
        self.combobox_contract_termination: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_6,
            font=self._font,
            values=Cb.CONTRACT_TERMINATION,
            state=Cb.READ_ONLY,
            command=None,
            justify=ctk.CENTER,
        )
        self.combobox_contract_termination.set(Cb.CONTRACT_TERMINATION[0])
        label_48: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=PTC.label_48, font=self._font)
        label_49: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=PTC.label_49, font=self._font)
        label_50: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=PTC.label_50, font=self._font)
        self.entry_contract_termination_employer: ctk.CTkEntry = ctk.CTkEntry(
            frame_6, font=self._font, validatecommand=None, justify=ctk.CENTER
        )
        self.entry_contract_termination_employer.insert(0, str(15))
        label_51: ctk.CTkLabel = ctk.CTkLabel(frame_6, text=PTC.label_51, font=self._font)
        self.entry_contract_termination_employee: ctk.CTkEntry = ctk.CTkEntry(
            frame_6, font=self._font, validatecommand=None, justify=ctk.CENTER
        )
        self.entry_contract_termination_employee.insert(0, str(15))

        label_52: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_52, font=self._font)

        # FRAME 7 IS NO LONGER NEEDED
        self.entry_rights_and_obligations: ctk.CTkEntry = ctk.CTkEntry(
            container, font=self._font, validatecommand=None, justify=ctk.CENTER
        )
        self.entry_rights_and_obligations.insert(0, Entry.RIGHTS_AND_OBLIGATIONS_DEFAULT)

        label_53: ctk.CTkLabel = ctk.CTkLabel(container, text=PTC.label_53, font=self._font)

        frame_8: ctk.CTkFrame = ctk.CTkFrame(container)
        label_54: ctk.CTkLabel = ctk.CTkLabel(frame_8, text=PTC.label_54, font=self._font)
        self.combobox_court: ctk.CTkComboBox = ctk.CTkComboBox(
            frame_8,
            font=self._font,
            values=Cb.COURTS,
            state=Cb.READ_ONLY,
            command=None,
            justify=ctk.CENTER,
        )
        self.combobox_court.set(Cb.COURTS[14])
        label_55: ctk.CTkLabel = ctk.CTkLabel(frame_8, text=PTC.label_55, font=self._font)
        self.date_entry_contract_starting_with: DateEntry = DateEntry(
            frame_8, selectmode=De.DAY_MODE, state=De.READ_ONLY, justify=ctk.CENTER, locale="hr_HR"
        )
        label_56: ctk.CTkLabel = ctk.CTkLabel(frame_8, text=PTC.label_56, font=self._font)

        # label_53:ctk.CTkLabel=ctk.CTkLabel(_, text=label_53, font=self._font)

        # CONTAINER, LINE 1
        # FRAME 1
        # LINE 1
        frame_1.pack(side=ctk.TOP)
        label_1.pack(padx=10, pady=10, side=ctk.LEFT)
        self.combobox_employers.pack(pady=10, side=ctk.LEFT)
        self.entry_employer_info.pack(padx=10, pady=10, side=ctk.LEFT)
        lable_2.pack(padx=(0, 10), pady=10, side=ctk.LEFT)
        entry_director.pack(pady=10, side=ctk.LEFT)
        label_3.pack(padx=10, pady=10, side=ctk.LEFT)
        self.combobox_employees.pack(pady=10, side=ctk.LEFT)
        self.entry_employee_personal_id.pack(padx=10, pady=10, side=ctk.LEFT)
        label_4.pack(pady=10, side=ctk.LEFT)
        self.date_entry_contract_date.pack(padx=10, pady=10, side=ctk.LEFT)
        label_5.pack(pady=10, side=ctk.LEFT)

        # CONTAINER, LINE 2 AND 3
        label_6.pack(pady=10, side=ctk.TOP)
        label_7.pack(side=ctk.TOP)

        # CONTAINER, LINE 4
        # FRAME 2
        frame_2.pack(padx=10, pady=10, side=ctk.TOP)
        self.__set_up_frame_grid(frame_2, App.APP_GRID_SIZE)
        # LINE 1
        label_8.grid(padx=10, pady=5, column=0, row=0, columnspan=20, sticky=ctk.W)
        # LINE 2
        label_9.grid(padx=10, column=0, row=1, columnspan=7, sticky=ctk.W)
        self.date_entry_end_job_date.grid(padx=10, pady=5, column=7, row=1, columnspan=5, sticky=ctk.EW)
        label_10.grid(padx=10, column=12, row=1, columnspan=8, sticky=ctk.W)
        # LINE 3
        self.entry_job_description.grid(padx=10, pady=5, column=0, row=2, columnspan=20, sticky=ctk.EW)
        # LINE 4
        label_11.grid(padx=10, column=0, row=3, columnspan=7, sticky=ctk.W)
        self.combobox_select_trail_numbers.grid(padx=10, pady=5, column=7, row=3, columnspan=8, sticky=ctk.EW)
        self.combobox_select_trail_option.grid(padx=10, pady=5, column=15, row=3, columnspan=5, sticky=ctk.EW)
        # LINE 5
        label_13.grid(padx=10, pady=5, column=0, row=4, columnspan=3, sticky=ctk.W)
        self.entry_working_place.grid(padx=10, pady=5, column=3, row=4, columnspan=7, sticky=ctk.EW)
        label_14.grid(padx=10, pady=5, column=10, row=4, columnspan=10, sticky=ctk.W)
        # LINE 6
        label_15.grid(padx=10, column=0, row=5, columnspan=20, sticky=ctk.W)
        # LINE 7
        label_16.grid(padx=10, pady=5, column=0, row=6, columnspan=3, sticky=ctk.W)
        self.checkbox_date.grid(padx=10, pady=5, column=3, row=6, sticky=ctk.EW)
        self.checkbox_description.grid(padx=10, pady=5, column=4, row=6, sticky=ctk.EW)
        self.date_entry_start_date.grid(padx=10, column=5, row=6, columnspan=5, sticky=ctk.EW)
        self.entry_start_date_description.grid(padx=10, column=10, row=6, columnspan=10, sticky=ctk.EW)

        # CONTAINER, LINE 5
        label_18.pack(pady=10, side=ctk.TOP)
        # CONTAINER, LINE 7,
        # FRAME 2
        frame_3.pack(padx=10, pady=10, side=ctk.TOP)
        self.__set_up_frame_grid(frame_3, App.APP_GRID_SIZE)
        # LINE 1
        label_19.grid(padx=10, pady=5, column=0, row=0, columnspan=5, sticky=ctk.W)
        self.entry_salary.grid(padx=10, pady=5, column=5, row=0, columnspan=13, sticky=ctk.EW)
        label_20.grid(padx=10, pady=5, column=18, row=0, columnspan=2, sticky=ctk.W)
        # LINE 2
        label_22.grid(padx=10, column=0, row=1, columnspan=20, sticky=ctk.W)
        # LINE 3
        label_23.grid(padx=10, pady=5, column=0, row=2, columnspan=5, sticky=ctk.W)
        self.entry_salary_bonus.grid(padx=10, pady=5, column=5, row=2, columnspan=5, sticky=ctk.EW)
        label_24.grid(padx=10, pady=5, column=10, row=2, columnspan=10, sticky=ctk.W)
        # LINE 4
        label_25.grid(padx=10, column=0, row=3, columnspan=5, sticky=ctk.W)
        # LINE 5
        label_26.grid(padx=10, column=0, row=5, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_1.grid(padx=10, column=5, row=5, columnspan=5, sticky=ctk.NE)
        # LINE 6
        label_27.grid(padx=10, pady=5, column=0, row=6, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_2.grid(padx=10, pady=5, column=5, row=6, columnspan=5, sticky=ctk.NE)
        # LINE 7
        label_28.grid(padx=10, column=0, row=7, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_3.grid(padx=10, column=5, row=7, columnspan=5, sticky=ctk.NE)
        # LINE 8
        label_29.grid(padx=10, pady=5, column=0, row=8, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_4.grid(padx=10, pady=5, column=5, row=8, columnspan=5, sticky=ctk.NE)
        # LINE 9
        label_30.grid(padx=10, column=0, row=9, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_5.grid(padx=10, column=5, row=9, columnspan=5, sticky=ctk.NE)
        # LINE 10
        label_31.grid(padx=10, column=0, row=10, columnspan=5, sticky=ctk.W)
        self.entry_salary_increment_6.grid(padx=10, pady=5, column=5, row=10, columnspan=5, sticky=ctk.NE)

        # CONTAINER, LINE 7
        label_32.pack(pady=(10, 0), side=ctk.TOP)
        # CONTAINER, LINE 8, FRAME 4
        frame_4.pack(padx=10, pady=10, side=ctk.TOP)

        # FRAME 4, LINE 1
        label_33.pack(padx=10, pady=10, side=ctk.TOP)

        # CONTAINER, LINE 9
        label_34.pack(padx=10, pady=10, side=ctk.TOP)
        # LINE 10, FRAME 5
        frame_5.pack(padx=10, pady=(0, 10), side=ctk.TOP)
        self.__set_up_frame_grid(frame_5, App.APP_GRID_SIZE)
        # FRAME 5 LINE 1
        label_35.grid(padx=10, pady=5, column=0, row=0, sticky=ctk.W)
        self.combobox_work_type.grid(padx=10, pady=5, column=1, row=0, columnspan=7, sticky=ctk.EW)
        label_36.grid(padx=10, pady=5, column=8, row=0, columnspan=2, sticky=ctk.W)
        self.spinbox_weekly_working_hours.grid(padx=10, pady=5, column=10, row=0, columnspan=4, sticky=ctk.EW)
        label_37.grid(padx=10, pady=5, column=14, row=0, sticky=ctk.W)
        # LINE 2
        label_38.grid(padx=10, column=0, row=1, columnspan=3, sticky=ctk.W)
        self.combobox_working_shift.grid(padx=10, column=3, row=1, columnspan=4, sticky=ctk.EW)
        self.__set_up_ui_for_working_shift_one_time_and_flexible()
        # # LINE 3
        label_40.grid(padx=10, pady=5, column=0, row=2, columnspan=20, sticky=ctk.W)
        # # LINE 4
        label_41.grid(padx=10, column=0, row=3, columnspan=3, sticky=ctk.W)
        self.combobox_weekly_time_off.grid(padx=10, column=3, row=3, columnspan=7, sticky=ctk.EW)
        # # LINE 5
        label_42.grid(padx=10, pady=5, column=0, row=4, columnspan=6, sticky=ctk.W)
        self.combobox_vacation.grid(padx=10, pady=5, column=6, row=4, columnspan=3, sticky=ctk.EW)
        self.entry_vacation_description.grid(padx=10, pady=5, column=9, row=4, columnspan=11, sticky=ctk.EW)

        # CONTAINER, LINE 11
        label_43.pack(padx=10, pady=10, side=ctk.TOP)
        # LINE 12
        label_44.pack(padx=10, pady=(0, 10), side=ctk.TOP)
        # LINE 13
        label_46.pack(padx=10, pady=10, side=ctk.TOP)
        # LINE 14, FRAME 6
        frame_6.pack(padx=10, side=ctk.TOP)
        self.__set_up_frame_grid(frame_6, App.APP_GRID_SIZE)
        # LINE 1
        label_47.grid(padx=10, pady=5, column=0, row=0, sticky=ctk.W)
        self.combobox_contract_termination.grid(padx=10, column=1, row=0, sticky=ctk.EW)
        label_48.grid(padx=10, pady=5, column=2, row=0, columnspan=18, sticky=ctk.W)
        # LINE 2
        label_49.grid(padx=10, column=0, row=1, columnspan=6, sticky=ctk.W)
        self.entry_contract_termination_employer.grid(padx=10, pady=5, column=6, row=1, sticky=ctk.EW)
        label_50.grid(padx=10, column=7, row=1, columnspan=11, sticky=ctk.W)
        self.entry_contract_termination_employee.grid(padx=10, pady=5, column=18, row=1, sticky=ctk.EW)
        label_51.grid(padx=10, column=19, row=1, sticky=ctk.W)

        # CONTAINER, LINE 15
        label_52.pack(padx=10, pady=10, side=ctk.TOP)
        # LINE 16
        self.entry_rights_and_obligations.pack(padx=125, pady=5, side=ctk.TOP, fill=ctk.BOTH)

        # LINE 17
        label_53.pack(padx=10, pady=10, side=ctk.TOP)
        # LINE 18, FRAME 8
        frame_8.pack(padx=10, pady=(5, 200), side=ctk.TOP)
        self.__set_up_frame_grid(frame_8, App.APP_GRID_SIZE)
        # FRAME 8, LINE 1
        label_54.grid(padx=10, pady=5, column=0, row=0, columnspan=10, sticky=ctk.W)
        self.combobox_court.grid(padx=10, column=10, row=0, columnspan=5, sticky=ctk.EW)
        # LINE 2
        label_55.grid(padx=10, pady=5, column=0, row=1, columnspan=5, sticky=ctk.W)
        self.date_entry_contract_starting_with.grid(padx=10, column=5, row=1, columnspan=3, sticky=ctk.EW)
        # LINE 3
        label_56.grid(padx=10, pady=5, column=0, row=2, columnspan=20, sticky=ctk.W)

    def __validate_combobox_working_shift(self) -> None:
        current_value: str = self.combobox_working_shift.get()
        if current_value == ONE_TIME:
            print(ONE_TIME)
            self.__set_up_ui_for_working_shift_one_time_and_flexible()
        elif current_value == TWICE:
            print(TWICE)
            self.__set_up_ui_for_working_shift_twice_and_description()
        elif current_value == FLEXIBLE:
            print(FLEXIBLE)
            self.__set_up_ui_for_working_shift_one_time_and_flexible()
        else:
            print(DESCRIPTION)
            self.__set_up_ui_for_working_shift_twice_and_description()

    def __set_up_ui_for_working_shift_one_time_and_flexible(self) -> None:
        self.entry_working_shift_description.grid_remove()
        self.label_39.grid(padx=10, column=7, row=1, columnspan=3, sticky=ctk.W)
        self.time_picker_working_time_start.grid(padx=10, column=10, row=1, columnspan=4, sticky=ctk.EW)
        self.time_picker_working_time_end.grid(padx=10, column=14, row=1, sticky=ctk.EW)

    def __set_up_ui_for_working_shift_twice_and_description(self) -> None:
        self.label_39.grid_remove()
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
            self.spinbox_weekly_working_hours.entry.delete(0, ctk.END)
            self.spinbox_weekly_working_hours.entry.insert(0, str(40.0))
            self.spinbox_weekly_working_hours.entry_str_var.trace_add(
                WRITE, lambda *args: self.__set_up_spinbox_weekly_working_hours_for_full_time(*args)
            )
        else:
            self.spinbox_weekly_working_hours.entry_str_var.trace_remove(
                WRITE, self.spinbox_weekly_working_hours.entry_str_var.trace_info()[0][1]
            )
            self.spinbox_weekly_working_hours.entry.delete(0, ctk.END)
            self.spinbox_weekly_working_hours.entry.insert(0, str(20.0))
            self.spinbox_weekly_working_hours.entry_str_var.trace_add(
                WRITE, lambda *args: self.__set_up_spinbox_weekly_working_hours_for_part_time(*args)
            )
            self.__set_up_spinbox_weekly_working_hours_for_part_time()

    def __set_up_spinbox_weekly_working_hours_for_full_time(self, *args) -> None:
        try:
            current_value: float = round(float(self.spinbox_weekly_working_hours.get()), 2)
            if current_value < 40.0:
                self.spinbox_weekly_working_hours.entry.delete(0, ctk.END)
                self.spinbox_weekly_working_hours.entry.insert(0, str(40.0))
            if current_value > 56.0:
                self.spinbox_weekly_working_hours.entry.delete(0, ctk.END)
                self.spinbox_weekly_working_hours.entry.insert(0, str(56.0))
        except TypeError:
            pass

    def __set_up_spinbox_weekly_working_hours_for_part_time(self, *args) -> None:
        try:
            current_value: float = round(float(self.spinbox_weekly_working_hours.get()), 2)
            if current_value < 0.5:
                self.spinbox_weekly_working_hours.entry.delete(0, ctk.END)
                self.spinbox_weekly_working_hours.entry.insert(0, str(0.5))
            if current_value > 39.5:
                self.spinbox_weekly_working_hours.entry.delete(0, ctk.END)
                self.spinbox_weekly_working_hours.entry.insert(0, str(39.5))
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

    def __populate_employer_info(
        self,
        choice: str,
        entry_info: ctk.CTkEntry,
        entry_director: ctk.CTkEntry,
    ) -> None:
        address: str = DatabaseHandler.get_company_address_from_company_name(choice)
        entry_info.configure(state=Entry.WRITE)
        entry_info.delete(0, Entry.DELETE)
        entry_info.insert(0, address)
        entry_info.configure(state=Entry.READ_ONLY)

        director: str = DatabaseHandler.get_company_director_from_company_name(choice)
        entry_director.configure(state=Entry.WRITE)
        entry_director.delete(0, Entry.DELETE)
        entry_director.insert(0, director)
        entry_director.configure(state=Entry.READ_ONLY)

    def __validate_numeric(self, *args, **kwargs) -> None:
        entry: ctk.CTkEntry = kwargs[ENTRY]
        entry_str_var: ctk.StringVar = kwargs[ENTRY_STR_VAR]

        last_character_index: int = entry.index(ctk.INSERT)
        item: str = entry_str_var.get()
        try:
            item_type = type(float(item))
            if item_type == type(float(1.0)):
                entry.icursor(entry.index(ctk.INSERT) - 1)
        except:
            entry.delete(last_character_index - 1, last_character_index)

        if item == "":
            entry.insert(0, str(0))

    def __set_trail_connection(self) -> None:
        value: str = self.combobox_select_trail_option_strvar.get()
        self.combobox_select_trail_numbers.set(Cb.TRAIL[value][0])
        self.combobox_select_trail_numbers.configure(values=Cb.TRAIL[value])

    def __toggle_date_checkbox(self) -> None:
        checkbox_date_state: str = self.checkbox_date_strvar.get()
        if checkbox_date_state == Chbx.ON_STATE:
            self.date_entry_start_date.configure(state=De.READ_ONLY)
            self.checkbox_description.configure(state=ctk.NORMAL)
        else:
            self.date_entry_start_date.configure(state=De.DISABLED)
            self.checkbox_description.configure(state=ctk.DISABLED)

    def __togglee_description_checkbox(self) -> None:
        checkbox_description_state: str = self.checkbox_description_strvar.get()
        self.entry_start_date_description.delete(0, ctk.END)
        if checkbox_description_state == Chbx.ON_STATE:
            self.entry_start_date_description.configure(state=Entry.WRITE)
            self.entry_start_date_description.insert(0, Entry.START_DATE_DESCRIPTION_DEFAULT)
            self.checkbox_date.configure(state=ctk.NORMAL)
        else:
            self.entry_start_date_description.configure(state=Entry.READ_ONLY)
            self.checkbox_date.configure(state=ctk.DISABLED)

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
