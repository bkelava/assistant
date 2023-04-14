import customtkinter as ctk
import tkinter.messagebox as tkMessageBox

from typing import List, Tuple

import src.constants.application as App
import src.constants.buttons as Btn
import src.constants.colors as Color
import src.constants.fonts as Font
import src.constants.label as Label
import src.constants.message_box as MessageBox

from src.constants.bindings import LISTBOX_SELECT, KEY_RELEASE
from src.constants.specials import EMPTY_STRING, LEFT, RIGHT
from src.database import DatabaseHandler
from src.tables import Employee
from src.utils import ErrorCode, entry_insert_and_delete, parse_personal_id_from_string
from src.widgets import Switchbox, SearchBox

from .program_frame import ProgramFrame


class EmployeeFrame(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(EmployeeFrame, self).__init__(*args, **kwargs)
        self._set_up_grid(App.APP_GRID_SIZE, App.APP_GRID_SIZE)
        self.configure(fg_color=Color.BLUE_1529)

        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        self._create_employee_workspace: ctk.CTkFrame = None
        self._delete_employee_workspace: ctk.CTkFrame = None
        self._alter_employee_workspace: ctk.CTkFrame = None

        self._button_create_employee: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.CREATE_EMPLOYEE,
            font=self._font,
            command=self.__add_create_employee_workspace,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_create_employee.grid(padx=10, pady=10, column=0, row=0, columnspan=7, sticky=ctk.NSEW)

        self._button_delete_employee: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.DELETE_EMPLOYEE,
            font=self._font,
            command=self.__add_delete_employee_workspace,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_delete_employee.grid(padx=10, pady=10, column=7, row=0, columnspan=6, sticky=ctk.NSEW)

        self._button_alter_employee: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.ALTER_EMPLOYEE,
            font=self._font,
            command=self.__add_alter_employee_workspace,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_alter_employee.grid(padx=10, pady=10, column=13, row=0, columnspan=7, sticky=ctk.NSEW)

        self._employee_frame: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLACK_1529)
        self.__set_up_frame_grid(self._employee_frame, App.APP_GRID_SIZE)
        self._employee_frame.grid(padx=10, pady=10, column=0, row=1, columnspan=20, rowspan=19, sticky=ctk.NSEW)

    def __add_create_employee_workspace(self) -> None:
        self.__remove_workspace(self._delete_employee_workspace, self._button_delete_employee)
        self.__remove_workspace(self._alter_employee_workspace, self._button_alter_employee)
        self._create_employee_workspace = InsertEmployeeWorkspace(self._employee_frame)
        self._create_employee_workspace.grid(
            padx=10, pady=10, column=0, row=0, columnspan=20, rowspan=20, sticky=ctk.NSEW
        )
        self._button_create_employee.configure(state=ctk.DISABLED)

    def __add_delete_employee_workspace(self) -> None:
        self.__remove_workspace(self._alter_employee_workspace, self._button_alter_employee)
        self.__remove_workspace(self._create_employee_workspace, self._button_create_employee)
        self._delete_employee_workspace = DeleteEmployeeWorkspace(self._employee_frame)
        self._delete_employee_workspace.grid(
            padx=10, pady=10, column=0, row=0, columnspan=20, rowspan=20, sticky=ctk.NSEW
        )
        self._button_delete_employee.configure(state=ctk.DISABLED)

    def __add_alter_employee_workspace(self) -> None:
        self.__remove_workspace(self._create_employee_workspace, self._button_create_employee)
        self.__remove_workspace(self._delete_employee_workspace, self._button_delete_employee)
        self._alter_employee_workspace = AlterEmployeeWorkspace(self._employee_frame)
        self._alter_employee_workspace.grid(
            padx=10, pady=10, column=0, row=0, columnspan=20, rowspan=20, sticky=ctk.NSEW
        )
        self._button_alter_employee.configure(state=ctk.DISABLED)

    def __remove_workspace(self, workspace: ctk.CTkFrame, button: ctk.CTkButton):
        if workspace != None:
            workspace.grid_remove()
            workspace = None
            button.configure(state=ctk.NORMAL)

    def __set_up_frame_grid(self, frame: ctk.CTkFrame, grid_size: int) -> None:
        for cell in range(grid_size):
            frame.rowconfigure(cell, weight=1)
            frame.columnconfigure(cell, weight=1)


class InsertEmployeeWorkspace(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(InsertEmployeeWorkspace, self).__init__(*args, **kwargs)
        self._set_up_grid(App.APP_GRID_SIZE, App.APP_GRID_SIZE)
        self.configure(fg_color=Color.BLACK_1529)

        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        self._label_employee_name: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.NAME, font=self._font)
        self._entry_employee_name: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._entry_employee_lastname: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employee_lastname: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.LASTNAME, font=self._font)
        self._label_employee_street: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.CITY, font=self._font)
        self._entry_employee_street: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employee_city: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.CITY, font=self._font)
        self._entry_employee_city: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employee_postal: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.POTSAL, font=self._font)
        self._entry_employee_postal: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employee_personal_id: ctk.CTkLabel = ctk.CTkLabel(
            self, text=Label.EMPLOYEE_PERSONAL_ID, font=self._font
        )
        self._entry_employee_personal_id: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._switchbox: Switchbox = Switchbox(
            self,
            left_box_data=DatabaseHandler.get_list_of_employers_names(),
            left_box_title=Label.EMPLOYER_LIST,
            right_box_title=Label.EMPLOYEE_EMPLOYER_LST,
        )

        self._label_employee_name.grid(padx=(100, 0), pady=(100, 5), column=0, row=0, columnspan=5, sticky=ctk.W)
        self._entry_employee_name.grid(padx=(0, 100), pady=(100, 5), column=5, row=0, columnspan=15, sticky=ctk.EW)
        self._label_employee_lastname.grid(padx=(100, 0), pady=5, column=0, row=1, columnspan=5, sticky=ctk.W)
        self._entry_employee_lastname.grid(padx=(0, 100), pady=5, column=5, row=1, columnspan=15, sticky=ctk.EW)
        self._label_employee_street.grid(padx=(100, 0), pady=5, column=0, row=2, columnspan=5, sticky=ctk.W)
        self._entry_employee_street.grid(padx=(0, 100), pady=5, column=5, row=2, columnspan=15, sticky=ctk.EW)
        self._label_employee_city.grid(padx=(100, 0), pady=5, column=0, row=3, columnspan=5, sticky=ctk.W)
        self._entry_employee_city.grid(padx=(0, 100), pady=5, column=5, row=3, columnspan=15, sticky=ctk.EW)
        self._label_employee_postal.grid(padx=(100, 0), pady=5, column=0, row=4, columnspan=5, sticky=ctk.W)
        self._entry_employee_postal.grid(padx=(0, 100), pady=5, column=5, row=4, columnspan=15, sticky=ctk.EW)
        self._label_employee_personal_id.grid(padx=(100, 0), pady=5, column=0, row=5, columnspan=5, sticky=ctk.W)
        self._entry_employee_personal_id.grid(padx=(0, 100), pady=5, column=5, row=5, columnspan=15, sticky=ctk.EW)

        self._frame_listboxes: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.RED)

        self._frame_buttons: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLACK_1529)
        self._button_insert: ctk.CTkButton = ctk.CTkButton(
            self._frame_buttons, text=Btn.INSERT, font=self._font, command=self.__insert_employee
        )
        self._button_clear_fields: ctk.CTkButton = ctk.CTkButton(
            self._frame_buttons, text=Btn.CLEAR, font=self._font, command=self.__clear_fields
        )

        self._switchbox.grid(padx=100, pady=25, column=0, row=6, columnspan=20)

        self._frame_buttons.grid(padx=100, pady=25, column=0, row=7, columnspan=20, sticky=ctk.NSEW)
        self._button_insert.pack(padx=20, side=ctk.LEFT, fill=ctk.BOTH, expand=True)
        self._button_clear_fields.pack(padx=20, side=ctk.LEFT, fill=ctk.BOTH, expand=True)

    def __clear_fields(self) -> None:
        entry_insert_and_delete(self._entry_employee_name)
        entry_insert_and_delete(self._entry_employee_lastname)
        entry_insert_and_delete(self._entry_employee_street)
        entry_insert_and_delete(self._entry_employee_city)
        entry_insert_and_delete(self._entry_employee_postal)
        entry_insert_and_delete(self._entry_employee_personal_id)

        self._switchbox._left_listbox_data = DatabaseHandler.get_list_of_employers_names()
        self._switchbox._update(LEFT)
        self._switchbox._right_listbox_data = []
        self._switchbox._update(RIGHT)

    def __insert_employee(self) -> None:
        employee_name: str = self._entry_employee_name.get()
        employee_lastname: str = self._entry_employee_lastname.get()
        employee_street: str = self._entry_employee_street.get()
        employee_city: str = self._entry_employee_city.get()
        employee_postal: str = self._entry_employee_postal.get()
        employee_personal_id: str = self._entry_employee_personal_id.get()
        employee_employers_list: Tuple = self._switchbox._listbox_right.get(0, ctk.END)

        if (
            employee_name == EMPTY_STRING
            or employee_lastname == EMPTY_STRING
            or employee_personal_id == EMPTY_STRING
            or len(employee_employers_list) < 1
        ):
            tkMessageBox.showwarning(
                MessageBox.CREATE_EMPLOYEE_VALIDATION_TITLE, MessageBox.CREATE_EMPLOYEE_VALIDATION_MESSAGE
            )
            return
        employee: Employee = Employee(
            name=employee_name,
            lastname=employee_lastname,
            street=employee_street,
            city=employee_city,
            postal=employee_postal,
            personal_id=employee_personal_id,
            employer_name=employee_employers_list,
        )
        status_code: ErrorCode = DatabaseHandler.insert_employee(employee)
        if status_code == ErrorCode.ERROR:
            tkMessageBox.showerror(
                MessageBox.CREATE_EMPLOYEE_EXISTING_EMPLOYEE_ERROR_TITLE,
                MessageBox.CREATE_EMPLOYEE_EXISTING_EMPLOYEE_ERROR_MESSAGE,
            )
            return
        else:
            tkMessageBox.showinfo(
                MessageBox.CREATE_EMPLOYEE_INSERT_SUCCESSFULL_TITLE,
                MessageBox.CREATE_EMPLOYEE_INSERT_SUCCESSFULL_MESSAGE,
            )
            self.__clear_fields()


class DeleteEmployeeWorkspace(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(DeleteEmployeeWorkspace, self).__init__(*args, **kwargs)
        self._set_up_grid(App.APP_GRID_SIZE, App.APP_GRID_SIZE)
        self.configure(fg_color=Color.BLACK_1529)

        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        self._employees: List = DatabaseHandler.get_list_of_employee_names_with_personal_id()
        self._searchbox = SearchBox(self, self._employees)
        self._searchbox.pack(padx=50, pady=50, side=ctk.TOP, fill=ctk.BOTH)
        button_remove_employee: ctk.CTkButton = ctk.CTkButton(
            self, width=200, height=50, text=Btn.DELETE, font=self._font, command=self.delete_employee
        )
        button_remove_employee.pack(pady=10, side=ctk.TOP)

    def delete_employee(self) -> None:
        employee = self._searchbox.get()
        if employee == EMPTY_STRING:
            tkMessageBox.showerror(
                MessageBox.DELETE_EMPLOYEE_EMPTY_SEARCH_ERROR_TITLE,
                MessageBox.DELETE_EMPLOYEE_EMPTY_SEARCH_ERROR_MESSAGE,
            )
            return
        personal_id: str = parse_personal_id_from_string(employee)
        employee = DatabaseHandler.get_employee_from_personal_id(personal_id)
        if employee == None:
            tkMessageBox.showerror(
                MessageBox.DELETE_EMPLOYEE_FAILED_FINDING_EMPLOYEE_TITLE,
                MessageBox.DELETE_EMPLOYEE_FAILED_FINDING_EMPLOYEE_MESSAGE,
            )
            return
        status_code: ErrorCode = DatabaseHandler.drop_employee(employee)
        if status_code == ErrorCode.ERROR:
            tkMessageBox.showerror(
                MessageBox.DELETE_EMPLOYEE_FAILED_DELETING_TITLE, MessageBox.DELETE_EMPLOYEE_FAILED_DELETING_MESSAGE
            )
            return
        else:
            tkMessageBox.showinfo(
                MessageBox.DELETE_EMPLOYEE_SUCCESSFULL_TITLE,
                MessageBox.DELETE_EMPLOYEE_SUCCESSFULL_MESSAGE,
            )
            employees = DatabaseHandler.get_list_of_employee_names_with_personal_id()
            self._searchbox._update(employees)
            self._searchbox.set(EMPTY_STRING)


class AlterEmployeeWorkspace(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(AlterEmployeeWorkspace, self).__init__(*args, **kwargs)
        self._set_up_grid(App.APP_GRID_SIZE, App.APP_GRID_SIZE)
        self.configure(fg_color=Color.BLACK_1529)
        self._employee: Employee = None

        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        employees: List[str] = DatabaseHandler.get_list_of_employee_names_with_personal_id()
        self._searchbox = SearchBox(self, employees)
        self._searchbox.grid(padx=50, pady=50, row=0, column=0, rowspan=6, columnspan=5, sticky=ctk.NSEW)

        self._label_employee_name: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.NAME, font=self._font)
        self._entry_employee_name: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._entry_employee_lastname: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employee_lastname: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.LASTNAME, font=self._font)
        self._label_employee_street: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.CITY, font=self._font)
        self._entry_employee_street: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employee_city: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.CITY, font=self._font)
        self._entry_employee_city: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employee_postal: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.POTSAL, font=self._font)
        self._entry_employee_postal: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employee_personal_id: ctk.CTkLabel = ctk.CTkLabel(
            self, text=Label.EMPLOYEE_PERSONAL_ID, font=self._font
        )
        self._entry_employee_personal_id: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._switchbox: Switchbox = Switchbox(
            self, left_box_title=Label.EMPLOYER_LIST, right_box_title=Label.EMPLOYEE_EMPLOYER_LST
        )

        self._button_clear_fields: ctk.CTkButton = ctk.CTkButton(
            self, text=Btn.CLEAR, font=self._font, command=self.__clear_fields
        )
        self._button_alter_employer: ctk.CTkButton = ctk.CTkButton(
            self, text=Btn.ALTER, font=self._font, command=self.__alter_employer, state=ctk.DISABLED
        )

        self._button_alter_employer.grid(padx=(100, 0), pady=10, column=5, row=1, columnspan=6, sticky=ctk.N)
        self._button_clear_fields.grid(padx=(0, 100), pady=10, column=11, row=1, columnspan=9, sticky=ctk.N)

        self._label_employee_name.grid(padx=(100, 0), pady=(100, 5), column=6, row=1, columnspan=5, sticky=ctk.W)
        self._entry_employee_name.grid(padx=(0, 100), pady=(100, 5), column=11, row=1, columnspan=9, sticky=ctk.EW)
        self._label_employee_lastname.grid(padx=(100, 0), column=6, row=2, columnspan=5, sticky=ctk.W)
        self._entry_employee_lastname.grid(padx=(0, 100), column=11, row=2, columnspan=9, sticky=ctk.EW)
        self._label_employee_street.grid(padx=(100, 0), column=6, row=3, columnspan=5, sticky=ctk.W)
        self._entry_employee_street.grid(padx=(0, 100), column=11, row=3, columnspan=9, sticky=ctk.EW)
        self._label_employee_city.grid(padx=(100, 0), column=6, row=4, columnspan=5, sticky=ctk.W)
        self._entry_employee_city.grid(padx=(0, 100), column=11, row=4, columnspan=9, sticky=ctk.EW)
        self._label_employee_postal.grid(padx=(100, 0), column=6, row=5, columnspan=5, sticky=ctk.W)
        self._entry_employee_postal.grid(padx=(0, 100), column=11, row=5, columnspan=9, sticky=ctk.EW)
        self._label_employee_personal_id.grid(padx=(100, 0), column=6, row=6, columnspan=5, sticky=ctk.W)
        self._entry_employee_personal_id.grid(padx=(0, 100), column=11, row=6, columnspan=9, sticky=ctk.EW)

        self._switchbox.grid(padx=(100, 75), pady=10, column=5, row=7, columnspan=15, sticky=ctk.N)

        self._entry_employee_name.bind(KEY_RELEASE, lambda _: self.__check_fields())
        self._entry_employee_lastname.bind(KEY_RELEASE, lambda _: self.__check_fields())
        self._entry_employee_street.bind(KEY_RELEASE, lambda _: self.__check_fields())
        self._entry_employee_city.bind(KEY_RELEASE, lambda _: self.__check_fields())
        self._entry_employee_postal.bind(KEY_RELEASE, lambda _: self.__check_fields())
        self._entry_employee_personal_id.bind(KEY_RELEASE, lambda _: self.__check_fields())

        self._searchbox._listbox.bind(LISTBOX_SELECT, lambda _: self.__fill_fields(), add=True)

    def __alter_employer(self) -> None:
        if len(self._switchbox._listbox_right.get(0, ctk.END)) < 1:
            tkMessageBox.showerror(
                MessageBox.ALTER_EMPLOYEE_EMPTY_SWTICHBOX_ERROR_TITLE,
                MessageBox.ALTER_EMPLOYEE_EMPTY_SWTICHBOX_ERROR_MESSAGE,
            )
            return
        new_employee_data: Employee = Employee(
            name=self._entry_employee_name.get(),
            lastname=self._entry_employee_lastname.get(),
            street=self._entry_employee_street.get(),
            city=self._entry_employee_city.get(),
            postal=self._entry_employee_postal.get(),
            personal_id=self._entry_employee_personal_id.get(),
            employer_name=list(self._switchbox._listbox_right.get(0, ctk.END)),
        )
        status_code: ErrorCode = DatabaseHandler.alter_employee(self._employee, new_employee_data)
        if status_code == ErrorCode.ERROR:
            tkMessageBox.showerror(
                MessageBox.ALTER_EMPLOYEE_FAILED_ALTERING_TITLE, MessageBox.ALTER_EMPLOYEE_FAILED_ALTERING_MESSAGE
            )
            return
        else:
            tkMessageBox.showinfo(
                MessageBox.ALTER_EMPLOYEE_SUCCESSFULL_ALTERING_TITLE,
                MessageBox.ALTER_EMPLOYEE_SUCCESSFULL_ALTERING_MESSAGE,
            )
            self.__clear_fields()
            self._searchbox._update(DatabaseHandler.get_list_of_employee_names_with_personal_id())
            self._searchbox.set(EMPTY_STRING)

    def __fill_fields(self) -> None:
        employee_personal_id: str = parse_personal_id_from_string(self._searchbox.get())
        self._employee = DatabaseHandler.get_employee_from_personal_id(employee_personal_id)
        entry_insert_and_delete(self._entry_employee_name, self._employee.name)
        entry_insert_and_delete(self._entry_employee_lastname, self._employee.lastname)
        entry_insert_and_delete(self._entry_employee_street, self._employee.street)
        entry_insert_and_delete(self._entry_employee_city, self._employee.city)
        entry_insert_and_delete(self._entry_employee_postal, self._employee.postal)
        entry_insert_and_delete(self._entry_employee_personal_id, self._employee.personal_id)
        employee_difference = DatabaseHandler.get_employee_employers_difference(self._employee)

        self._switchbox._left_listbox_data = employee_difference
        self._switchbox._update(LEFT)
        self._switchbox._right_listbox_data = self._employee.employer_names
        self._switchbox._update(RIGHT)

        self._button_alter_employer.configure(state=ctk.NORMAL)

    def __clear_fields(self) -> None:
        entry_insert_and_delete(self._entry_employee_name)
        entry_insert_and_delete(self._entry_employee_lastname)
        entry_insert_and_delete(self._entry_employee_street)
        entry_insert_and_delete(self._entry_employee_city)
        entry_insert_and_delete(self._entry_employee_postal)
        entry_insert_and_delete(self._entry_employee_personal_id)

        self._switchbox._left_listbox_data = []
        self._switchbox._update(LEFT)
        self._switchbox._right_listbox_data = []
        self._switchbox._update(RIGHT)

        self._searchbox._entry.delete(0, ctk.END)
        self._searchbox._update(DatabaseHandler.get_list_of_employee_names_with_personal_id())

    def __check_fields(self) -> None:
        if (
            self._entry_employee_name.get() == EMPTY_STRING
            or self._entry_employee_lastname.get() == EMPTY_STRING
            or self._entry_employee_personal_id.get() == EMPTY_STRING
        ):
            self._button_alter_employer.configure(state=ctk.DISABLED)
            return
        self._button_alter_employer.configure(state=ctk.NORMAL)
