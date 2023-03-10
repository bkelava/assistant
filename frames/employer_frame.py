import customtkinter as ctk
import tkinter.messagebox as tkMessageBox

from typing import Any, List

import constants.application as App
import constants.buttons as Btn
import constants.colors as Color
import constants.fonts as Font
import constants.label as Label
import constants.message_box as MessageBox

from database import DatabaseHandler
from constants.specials import EMPTY_STRING
from constants.bindings import KEY_RELEASE, LISTBOX_SELECT
from tables import Employer
from utils import ErrorCode
from widgets import SearchBox

from .program_frame import ProgramFrame
from .helper_functions import entry_insert_and_delete


class EmployerFrame(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(EmployerFrame, self).__init__(*args, **kwargs)
        self.configure(fg_color=Color.BLUE_1529)
        self._set_up_grid(App.APP_GRID_SIZE, App.APP_GRID_SIZE)

        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        self._create_employer_workspace: ctk.CTkFrame = None
        self._delete_employer_workspace: ctk.CTkFrame = None
        self._alter_employer_workspace: ctk.CTkFrame = None

        self._button_create_employer: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.CREATE_EMPLOYER,
            font=self._font,
            command=self.__add_create_employer_workspace,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_create_employer.grid(padx=10, pady=10, column=0, row=0, columnspan=7, sticky=ctk.NSEW)

        self._button_delete_employer: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.DELETE_EMPLOYER,
            font=self._font,
            command=self.__add_delete_employer_workspace,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_delete_employer.grid(padx=10, pady=10, column=7, row=0, columnspan=6, sticky=ctk.NSEW)

        self._button_alter_employer: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.ALTER_EMPLOYER,
            font=self._font,
            command=self.__add_alter_employer_workspace,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_alter_employer.grid(padx=10, pady=10, column=13, row=0, columnspan=7, sticky=ctk.NSEW)

        self._employer_frame: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLACK_1529)
        self.__set_up_frame_grid(self._employer_frame, App.APP_GRID_SIZE)
        self._employer_frame.grid(padx=10, pady=10, column=0, row=1, columnspan=20, rowspan=19, sticky=ctk.NSEW)

    def __add_create_employer_workspace(self) -> None:
        self.__remove_workspace(self._delete_employer_workspace, self._button_delete_employer)
        self.__remove_workspace(self._alter_employer_workspace, self._button_alter_employer)
        self._create_employer_workspace = InsertEmployerWorkspace(self._employer_frame)
        self._create_employer_workspace.grid(
            padx=10, pady=10, column=0, row=0, columnspan=20, rowspan=20, sticky=ctk.NSEW
        )
        self._button_create_employer.configure(state=ctk.DISABLED)

    def __add_delete_employer_workspace(self) -> None:
        self.__remove_workspace(self._alter_employer_workspace, self._button_alter_employer)
        self.__remove_workspace(self._create_employer_workspace, self._button_create_employer)
        self._delete_employer_workspace = DeleteEmployerWorkspace(self._employer_frame)
        self._delete_employer_workspace.grid(
            padx=10, pady=10, column=0, row=0, columnspan=20, rowspan=20, sticky=ctk.NSEW
        )
        self._button_delete_employer.configure(state=ctk.DISABLED)

    def __add_alter_employer_workspace(self) -> None:
        self.__remove_workspace(self._create_employer_workspace, self._button_create_employer)
        self.__remove_workspace(self._delete_employer_workspace, self._button_delete_employer)
        self._alter_employer_workspace = AlterEmployerWorkspace(self._employer_frame)
        self._alter_employer_workspace.grid(
            padx=10, pady=10, column=0, row=0, columnspan=20, rowspan=20, sticky=ctk.NSEW
        )
        self._button_alter_employer.configure(state=ctk.DISABLED)

    def __remove_workspace(self, workspace: ctk.CTkFrame, button: ctk.CTkButton):
        if workspace != None:
            workspace.grid_remove()
            workspace = None
            button.configure(state=ctk.NORMAL)

    def __set_up_frame_grid(self, frame: ctk.CTkFrame, grid_size: int) -> None:
        for cell in range(grid_size):
            frame.rowconfigure(cell, weight=1)
            frame.columnconfigure(cell, weight=1)


class InsertEmployerWorkspace(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(InsertEmployerWorkspace, self).__init__(*args, **kwargs)
        self.configure(fg_color=Color.BLACK_1529)
        self._set_up_grid(App.APP_GRID_SIZE, App.APP_GRID_SIZE)

        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        self._label_employer_name: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.EMPLOYER_NAME, font=self._font)
        self._entry_employer_name: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._entry_employer_street: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employer_street: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.STREET, font=self._font)
        self._label_employer_city: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.CITY, font=self._font)
        self._entry_employer_city: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employer_postal: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.POTSAL, font=self._font)
        self._entry_employer_postal: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employer_vat: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.EMPLOYER_VAT, font=self._font)
        self._entry_employer_vat: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employer_director: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.EMPLOYER_DIRECTOR, font=self._font)
        self._entry_employer_director: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)

        self._label_employer_name.grid(padx=(100, 0), pady=(100, 5), column=0, row=0, columnspan=5, sticky=ctk.W)
        self._entry_employer_name.grid(padx=(0, 100), pady=(100, 5), column=5, row=0, columnspan=15, sticky=ctk.EW)
        self._label_employer_street.grid(padx=(100, 0), pady=5, column=0, row=1, columnspan=5, sticky=ctk.W)
        self._entry_employer_street.grid(padx=(0, 100), pady=5, column=5, row=1, columnspan=15, sticky=ctk.EW)
        self._label_employer_city.grid(padx=(100, 0), pady=5, column=0, row=2, columnspan=5, sticky=ctk.W)
        self._entry_employer_city.grid(padx=(0, 100), pady=5, column=5, row=2, columnspan=15, sticky=ctk.EW)
        self._label_employer_postal.grid(padx=(100, 0), pady=5, column=0, row=3, columnspan=5, sticky=ctk.W)
        self._entry_employer_postal.grid(padx=(0, 100), pady=5, column=5, row=3, columnspan=15, sticky=ctk.EW)
        self._label_employer_vat.grid(padx=(100, 0), pady=5, column=0, row=4, columnspan=5, sticky=ctk.W)
        self._entry_employer_vat.grid(padx=(0, 100), pady=5, column=5, row=4, columnspan=15, sticky=ctk.EW)
        self._label_employer_director.grid(padx=(100, 0), pady=5, column=0, row=5, columnspan=5, sticky=ctk.W)
        self._entry_employer_director.grid(padx=(0, 100), pady=5, column=5, row=5, columnspan=15, sticky=ctk.EW)

        self._frame: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLACK_1529)
        self._button_insert: ctk.CTkButton = ctk.CTkButton(
            self._frame, text=Btn.INSERT, font=self._font, command=self.__insert_employer
        )
        self._button_clear_fields: ctk.CTkButton = ctk.CTkButton(
            self._frame, text=Btn.CLEAR, font=self._font, command=self.__clear_fields
        )

        self._frame.grid(padx=100, pady=100, column=0, row=6, columnspan=20, sticky=ctk.NSEW)
        self._button_insert.pack(padx=20, side=ctk.LEFT, fill=ctk.BOTH, expand=True)
        self._button_clear_fields.pack(padx=20, side=ctk.LEFT, fill=ctk.BOTH, expand=True)

    def __clear_fields(self) -> None:
        entry_insert_and_delete(self._entry_employer_name)
        entry_insert_and_delete(self._entry_employer_street)
        entry_insert_and_delete(self._entry_employer_city)
        entry_insert_and_delete(self._entry_employer_postal)
        entry_insert_and_delete(self._entry_employer_vat)
        entry_insert_and_delete(self._entry_employer_director)

    def __insert_employer(self) -> None:
        employer_name: str = self._entry_employer_name.get()
        employer_street: str = self._entry_employer_street.get()
        employer_city: str = self._entry_employer_city.get()
        employer_postal: str = self._entry_employer_postal.get()
        employer_vat: str = self._entry_employer_vat.get()
        employer_director: str = self._entry_employer_director.get()

        if (
            employer_name == EMPTY_STRING
            or employer_street == EMPTY_STRING
            or employer_city == EMPTY_STRING
            or employer_postal == EMPTY_STRING
            or employer_vat == EMPTY_STRING
            or employer_director == EMPTY_STRING
        ):
            tkMessageBox.showwarning(
                MessageBox.CREATE_EMPLOYER_VALIDATION_TITLE, MessageBox.CREATE_EMPLOYER_VALIDATION_MESSAGE
            )
            return
        employer: Employer = Employer(
            company_name=employer_name,
            street=employer_street,
            city=employer_city,
            postal=employer_postal,
            vat=employer_vat,
            director=employer_director,
        )
        status_code: ErrorCode = DatabaseHandler.insert_employer(employer)
        if status_code == ErrorCode.ERROR:
            tkMessageBox.showerror(
                MessageBox.CREATE_EMPLOYER_EXISTING_EMPLOYER_ERROR_TITLE,
                MessageBox.CREATE_EMPLOYER_EXISTING_EMPLOYER_ERROR_MESSAGE,
            )
            return
        else:
            tkMessageBox.showinfo(
                MessageBox.CREATE_EMPLOYER_INSERT_SUCCESSFULL_TITLE,
                MessageBox.CREATE_EMPLOYER_INSERT_SUCCESSFULL_MESSAGE,
            )
            self.__clear_fields()


class DeleteEmployerWorkspace(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(DeleteEmployerWorkspace, self).__init__(*args, **kwargs)
        self.configure(fg_color=Color.BLACK_1529)
        self._set_up_grid(App.APP_GRID_SIZE, App.APP_GRID_SIZE)

        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        self._employers: List = DatabaseHandler.get_list_of_employers_names()
        self._searchbox = SearchBox(self, self._employers)
        self._searchbox.pack(padx=50, pady=50, side=ctk.TOP, fill=ctk.BOTH)
        button_remove_employer: ctk.CTkButton = ctk.CTkButton(
            self, width=200, height=50, text=Btn.DELETE, font=self._font, command=self.__delete_employer
        )
        button_remove_employer.pack(pady=10, side=ctk.TOP)

    def __delete_employer(self) -> None:
        employer = self._searchbox.get()
        if employer == EMPTY_STRING:
            tkMessageBox.showerror(
                MessageBox.DELETE_EMPLOYER_EMPTY_SEARCH_ERROR_TITLE,
                MessageBox.DELETE_EMPLOYER_EMPTY_SEARCH_ERROR_MESSAGE,
            )
            return
        status_code: ErrorCode = DatabaseHandler.drop_employer(
            DatabaseHandler.get_employer_from_employer_name(employer)
        )
        if status_code == ErrorCode.ERROR:
            tkMessageBox.showerror(
                MessageBox.DELETE_EMPLOYER_FAILED_DELETING_TITLE, MessageBox.DELETE_EMPLOYER_FAILED_DELETING_MESSAGE
            )
            return
        else:
            tkMessageBox.showinfo(
                MessageBox.DELETE_EMPLOYER_SUCCEESSFULL_TITLE,
                MessageBox.DELETE_EMPLOYER_SUCCEESSFULL_MESSAGE,
            )
            employers = DatabaseHandler.get_list_of_employers_names()
            self._searchbox._update(employers)
            self._searchbox.set(EMPTY_STRING)


class AlterEmployerWorkspace(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(AlterEmployerWorkspace, self).__init__(*args, **kwargs)
        self.configure(fg_color=Color.BLACK_1529)
        self._set_up_grid(App.APP_GRID_SIZE, App.APP_GRID_SIZE)
        self._employer: Employer = None

        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )
        employers: List[str] = DatabaseHandler.get_list_of_employers_names()
        self._searchbox = SearchBox(self, employers)
        self._searchbox.grid(padx=50, pady=50, row=0, column=0, rowspan=6, columnspan=5, sticky=ctk.NSEW)

        self._label_employer_name: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.EMPLOYER_NAME, font=self._font)
        self._entry_employer_name: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._entry_employer_street: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employer_street: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.STREET, font=self._font)
        self._label_employer_city: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.CITY, font=self._font)
        self._entry_employer_city: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employer_postal: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.POTSAL, font=self._font)
        self._entry_employer_postal: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employer_vat: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.EMPLOYER_VAT, font=self._font)
        self._entry_employer_vat: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)
        self._label_employer_director: ctk.CTkLabel = ctk.CTkLabel(self, text=Label.EMPLOYER_DIRECTOR, font=self._font)
        self._entry_employer_director: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font, justify=ctk.CENTER)

        self._button_clear_fields: ctk.CTkButton = ctk.CTkButton(
            self, text=Btn.CLEAR, font=self._font, command=self.__clear_fields
        )
        self._button_alter_employer: ctk.CTkButton = ctk.CTkButton(
            self, text=Btn.ALTER, font=self._font, command=self.__alter_employer, state=ctk.DISABLED
        )

        self._label_employer_name.grid(padx=5, pady=5, column=5, row=0, sticky=ctk.W)
        self._entry_employer_name.grid(padx=5, pady=5, column=6, row=0, columnspan=10, sticky=ctk.EW)
        self._label_employer_street.grid(padx=5, pady=5, column=5, row=1, sticky=ctk.W)
        self._entry_employer_street.grid(padx=5, pady=5, column=6, row=1, columnspan=10, sticky=ctk.EW)
        self._label_employer_city.grid(padx=5, pady=5, column=5, row=2, sticky=ctk.W)
        self._entry_employer_city.grid(padx=5, pady=5, column=6, row=2, columnspan=10, sticky=ctk.EW)
        self._label_employer_postal.grid(padx=5, pady=5, column=5, row=3, sticky=ctk.W)
        self._entry_employer_postal.grid(padx=5, pady=5, column=6, row=3, columnspan=10, sticky=ctk.EW)
        self._label_employer_vat.grid(padx=5, pady=5, column=5, row=4, sticky=ctk.W)
        self._entry_employer_vat.grid(padx=5, pady=5, column=6, row=4, columnspan=10, sticky=ctk.EW)
        self._label_employer_director.grid(padx=5, pady=5, column=5, row=5, sticky=ctk.W)
        self._entry_employer_director.grid(padx=5, pady=5, column=6, row=5, columnspan=10, sticky=ctk.EW)

        self._button_alter_employer.grid(padx=10, pady=10, column=5, row=6, columnspan=6, sticky=ctk.NSEW)
        self._button_clear_fields.grid(padx=10, pady=10, column=11, row=6, columnspan=5, sticky=ctk.NSEW)

        self._entry_employer_name.bind(KEY_RELEASE, lambda _: self.__check_fields())
        self._entry_employer_street.bind(KEY_RELEASE, lambda _: self.__check_fields())
        self._entry_employer_city.bind(KEY_RELEASE, lambda _: self.__check_fields())
        self._entry_employer_postal.bind(KEY_RELEASE, lambda _: self.__check_fields())
        self._entry_employer_vat.bind(KEY_RELEASE, lambda _: self.__check_fields())
        self._entry_employer_director.bind(KEY_RELEASE, lambda _: self.__check_fields())

        self._searchbox._listbox.bind(LISTBOX_SELECT, lambda _: self.__fill_fields(), add=True)

    def __alter_employer(self) -> None:
        new_employer_data: Employer = Employer(
            company_name=self._entry_employer_name.get(),
            street=self._entry_employer_street.get(),
            city=self._entry_employer_city.get(),
            postal=self._entry_employer_postal.get(),
            vat=self._entry_employer_vat.get(),
            director=self._entry_employer_director.get(),
        )
        status_code: ErrorCode = DatabaseHandler.alter_employer(self._employer, new_employer_data)
        if status_code == ErrorCode.ERROR:
            tkMessageBox.showerror(
                MessageBox.ALTER_EMPLOYER_FAILED_ALTERING_TITLE, MessageBox.ALTER_EMPLOYER_FAILED_ALTERING_MESSAGE
            )
            return
        else:
            tkMessageBox.showinfo(
                MessageBox.ALTER_EMPLOYER_SUCCESSFULL_ALTERING_TITLE,
                MessageBox.ALTER_EMPLOYER_SUCCESSFULL_ALTERING_MESSAGE,
            )
            self.__clear_fields()
            self._searchbox._update(DatabaseHandler.get_list_of_employers_names())
            self._searchbox.set(EMPTY_STRING)

    def __fill_fields(self) -> None:
        employer_name: str = self._searchbox.get()
        self._employer: Employer = DatabaseHandler.get_employer_from_employer_name(employer_name)
        entry_insert_and_delete(self._entry_employer_name, self._employer.company_name)
        entry_insert_and_delete(self._entry_employer_street, self._employer.street)
        entry_insert_and_delete(self._entry_employer_city, self._employer.city)
        entry_insert_and_delete(self._entry_employer_postal, self._employer.postal)
        entry_insert_and_delete(self._entry_employer_vat, self._employer.vat)
        entry_insert_and_delete(self._entry_employer_director, self._employer.director)
        self._button_alter_employer.configure(state=ctk.NORMAL)

    def __clear_fields(self) -> None:
        entry_insert_and_delete(self._entry_employer_name)
        entry_insert_and_delete(self._entry_employer_street)
        entry_insert_and_delete(self._entry_employer_city)
        entry_insert_and_delete(self._entry_employer_postal)
        entry_insert_and_delete(self._entry_employer_vat)
        entry_insert_and_delete(self._entry_employer_director)
        self._searchbox.set(EMPTY_STRING)
        self._searchbox._listbox.selection_clear(0, ctk.END)
        self._button_alter_employer.configure(state=ctk.DISABLED)
        self._employer = None

    def __check_fields(self) -> None:
        if (
            self._entry_employer_name.get() == EMPTY_STRING
            or self._entry_employer_street.get() == EMPTY_STRING
            or self._entry_employer_city.get() == EMPTY_STRING
            or self._entry_employer_postal.get() == EMPTY_STRING
            or self._entry_employer_vat.get() == EMPTY_STRING
            or self._entry_employer_director.get() == EMPTY_STRING
        ):
            self._button_alter_employer.configure(state=ctk.DISABLED)
            return
        self._button_alter_employer.configure(state=ctk.NORMAL)
