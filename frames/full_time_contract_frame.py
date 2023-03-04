import customtkinter as ctk

import constants.colors as Color

from .program_frame import ProgramFrame


class FullTimeContractFrame(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(FullTimeContractFrame, self).__init__(*args, **kwargs)
        self.configure(fg_color=Color.BLACK)

        self._set_up_grid(20, 20)
        label = ctk.CTkLabel(self, text="Dumb text2222!!")
        label.grid(row=0, column=0, sticky="EW")
