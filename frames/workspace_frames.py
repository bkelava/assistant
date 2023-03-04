import customtkinter as ctk

import constants.buttons as Btn
import constants.colors as Color
import constants.fonts as Font

from .part_time_contract_frame import PartTimeContractFrame
from .program_frame import ProgramFrame


class MainWorkspace(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(MainWorkspace, self).__init__(*args, **kwargs)
        self.configure(fg_color=Color.BLUE)

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
        self.configure(fg_color=Color.RED)

        self._set_up_grid(20, 20)


class Menu(ProgramFrame):
    def __init__(self, controller: MainWorkspace, *args, **kwargs):
        self._controller: MainWorkspace = controller
        super(Menu, self).__init__(*args, **kwargs)
        self.configure(fg_color=Color.YELLOW)
        self._set_up_grid(1, 20)

        self.__set_up_ui()

    def __set_up_ui(self) -> None:
        button_font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )
        self._button_part_time_contract: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.PART_TIME_CONTRACT,
            font=button_font,
            command=self.__create_part_time_contract_workspace,
        )
        self._button_part_time_contract.grid(padx=15, pady=15, column=0, row=0, rowspan=2, sticky=ctk.NSEW)

        self._button_full_time_contract: ctk.CTkButton = ctk.CTkButton(
            self,
            text=Btn.FULL_TIME_CONTRACT,
            font=button_font,
            command=self.__create_full_time_contract_workspace,
        )

        self._button_full_time_contract.grid(padx=15, pady=15, column=0, row=2, rowspan=2, sticky=ctk.NSEW)

    def __create_full_time_contract_workspace(self) -> None:
        pass

    def __create_part_time_contract_workspace(self) -> None:
        self._button_part_time_contract.configure(state=ctk.DISABLED)
        part_time_contract_frame: PartTimeContractFrame = PartTimeContractFrame(self._controller.frame_workspace)
        part_time_contract_frame.grid(
            padx=5,
            pady=5,
            column=0,
            row=0,
            columnspan=20,
            rowspan=20,
            sticky=ctk.NSEW,
        )
