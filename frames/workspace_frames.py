import customtkinter as ctk

from typing import Dict, List
from varname import nameof

import constants.buttons as Btn
import constants.colors as Color
import constants.fonts as Font

from .contract_anex_a1 import ContractAnexA1
from .employee_frame import EmployeeFrame
from .employer_frame import EmployerFrame
from .full_time_contract_frame import FullTimeContractFrame
from .part_time_contract_frame import PartTimeContractFrame
from .program_frame import ProgramFrame


class MainWorkspace(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(MainWorkspace, self).__init__(*args, **kwargs)
        self.configure(fg_color=Color.GREY_1529)

        self._set_up_grid(20, 20)
        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        self.frame_menu: ProgramFrame = Menu(self, self)
        self.frame_menu.grid(
            padx=15,
            pady=15,
            column=0,
            row=0,
            rowspan=20,
            sticky=ctk.NSEW,
        )

        self.frame_workspace: ProgramFrame = Workspace(self)
        self.frame_workspace.grid(
            padx=(0, 15),
            pady=15,
            column=1,
            row=0,
            columnspan=20,
            rowspan=20,
            sticky=ctk.NSEW,
        )


class Workspace(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(Workspace, self).__init__(*args, **kwargs)
        self.configure(fg_color=Color.BLACK_1529)

        self._set_up_grid(20, 20)


class Menu(ProgramFrame):
    def __init__(self, controller: MainWorkspace, *args, **kwargs):
        self._controller: MainWorkspace = controller
        super(Menu, self).__init__(*args, **kwargs)
        self.configure(fg_color=Color.BLUE_1529)
        self._set_up_grid(1, 20)
        self._frames: List[ProgramFrame] = []
        self._buttons: Dict = {}

        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        button_font: ctk.CTkFont = ctk.CTkFont(family=Font.ARIEL, size=Font.SIZE_20, weight=Font.BOLD)

        self._full_time_contract_frame: FullTimeContractFrame = None
        self._frames.append(self._full_time_contract_frame)
        self._part_time_contract_frame: PartTimeContractFrame = None
        self._frames.append(self._part_time_contract_frame)
        self._employers_frame: EmployerFrame = None
        self._frames.append(self._employers_frame)
        self._employee_frame: EmployeeFrame = None
        self._frames.append(self._employee_frame)
        self._contract_anex_a1: ContractAnexA1 = None
        self._frames.append(self._contract_anex_a1)

        self._button_employers: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.EMPLOYERS,
            font=button_font,
            command=self.__create_employers_workspace,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_employers.grid(padx=15, pady=15, column=0, row=0, rowspan=2, sticky=ctk.NSEW)
        self._buttons[nameof(self._button_employers)] = self._button_employers

        self._button_employees: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.EMPLOYEES,
            font=button_font,
            command=self.__create_employees_workspace,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_employees.grid(padx=15, pady=15, column=0, row=2, rowspan=2, sticky=ctk.NSEW)
        self._buttons[nameof(self._button_employees)] = self._button_employees

        self._button_part_time_contract: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.PART_TIME_CONTRACT,
            font=button_font,
            command=self.__create_part_time_contract_workspace,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_part_time_contract.grid(padx=15, pady=15, column=0, row=4, rowspan=2, sticky=ctk.NSEW)
        self._buttons[nameof(self._button_part_time_contract)] = self._button_part_time_contract

        self._button_full_time_contract: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.FULL_TIME_CONTRACT,
            font=button_font,
            command=self.__create_full_time_contract_workspace,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_full_time_contract.grid(padx=15, pady=15, column=0, row=6, rowspan=2, sticky=ctk.NSEW)
        self._buttons[nameof(self._button_full_time_contract)] = self._button_full_time_contract

        self._button_anex_a1: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.ANEX_A1,
            font=button_font,
            command=self.__create_contract_anex_a1,
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_anex_a1.grid(padx=15, pady=15, column=0, row=8, rowspan=2, sticky=ctk.NSEW)
        self._buttons[nameof(self._button_anex_a1)] = self._button_anex_a1

    def __create_contract_anex_a1(self) -> None:
        self.__set_up_workspace(nameof(self._button_anex_a1))
        self._contract_anex_a1 = ContractAnexA1(self._controller.frame_workspace)
        self._contract_anex_a1.grid(padx=5, pady=5, column=0, row=0, columnspan=20, rowspan=20, sticky=ctk.NSEW)

    def __create_full_time_contract_workspace(self) -> None:
        self.__set_up_workspace(nameof(self._button_full_time_contract))
        self._full_time_contract_frame = FullTimeContractFrame(self._controller.frame_workspace)
        self._full_time_contract_frame.grid(padx=5, pady=5, column=0, row=0, columnspan=20, rowspan=20, sticky=ctk.NSEW)

    def __create_part_time_contract_workspace(self) -> None:
        self.__set_up_workspace(nameof(self._button_part_time_contract))
        self._part_time_contract_frame = PartTimeContractFrame(self._controller.frame_workspace)
        self._part_time_contract_frame.grid(padx=5, pady=5, column=0, row=0, columnspan=20, rowspan=20, sticky=ctk.NSEW)

    def __create_employers_workspace(self) -> None:
        self.__set_up_workspace(nameof(self._button_employers))
        self._employers_frame = EmployerFrame(self._controller.frame_workspace)
        self._employers_frame.grid(padx=5, pady=5, column=0, row=0, columnspan=20, rowspan=20, sticky=ctk.NSEW)

    def __create_employees_workspace(self) -> None:
        self.__set_up_workspace(nameof(self._button_employees))
        self._employee_frame = EmployeeFrame(self._controller.frame_workspace)
        self._employee_frame.grid(padx=5, pady=5, column=0, row=0, columnspan=20, rowspan=20, sticky=ctk.NSEW)

    def __set_up_workspace(self, button_to_disable: str) -> None:
        self.__remove_displayed_frames()
        self.__reverse_button_state(button_to_disable)

    def __remove_displayed_frames(self) -> None:
        for frame in self._frames:
            if frame != None:
                frame.grid_remove()
                frame = None

    def __reverse_button_state(self, button_to_disable: str) -> None:
        for key, value in self._buttons.items():
            if key == button_to_disable:
                value.configure(state=ctk.DISABLED)
            else:
                value.configure(state=ctk.NORMAL)
