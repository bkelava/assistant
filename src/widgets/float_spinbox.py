import customtkinter as ctk

from typing import Callable, Union

import src.constants.colors as Color

from src.constants.bindings import BUTTON_4, BUTTON_5
from src.constants.entry import READ_ONLY


class FloatSpinbox(ctk.CTkFrame):
    def __init__(
        self,
        *args,
        width: int = 100,
        height: int = 32,
        step_size: Union[int, float] = 1,
        command: Callable = None,
        validatecommand: Callable = None,
        numeric_type: Union[int, float] = float,
        start_from: Union[int, float] = 0,
        **kwargs
    ):
        super().__init__(*args, width=width, height=height, **kwargs)

        self._step_size: Union[int, float] = step_size
        self._command: Callable = command
        self._validatecommand = validatecommand
        self._numeric_type = numeric_type

        self.configure(fg_color=Color.GREY_1529)

        self.grid_columnconfigure((0, 2), weight=0)
        self.grid_columnconfigure(1, weight=1)

        self._subtract_button: ctk.CTkButton = ctk.CTkButton(
            self, text="-", width=height - 6, height=height - 6, command=self.subtract_button_callback
        )
        self._subtract_button.grid(row=0, column=0, padx=(3, 0), pady=3)

        self._entry_str_var: ctk.StringVar() = ctk.StringVar()
        self._entry: ctk.CTkEntry = ctk.CTkEntry(
            self,
            width=width - (2 * height),
            height=height - 6,
            border_width=0,
            justify=ctk.CENTER,
            validatecommand=self._validatecommand,
            textvariable=self._entry_str_var,
        )
        self._entry.grid(row=0, column=1, columnspan=1, padx=3, pady=3, sticky=ctk.EW)

        self._add_button: ctk.CTkButton = ctk.CTkButton(
            self, text="+", width=height - 6, height=height - 6, command=self.add_button_callback
        )
        self._add_button.grid(row=0, column=2, padx=(0, 3), pady=3)

        self._entry.insert(0, self._numeric_type(start_from))
        self._entry.configure(state=READ_ONLY)

        self._entry.bind(BUTTON_4, lambda _: self.add_button_callback())
        self._entry.bind(BUTTON_5, lambda _: self.subtract_button_callback())

    def add_button_callback(self):
        if self._command is not None:
            self._command()
        try:
            value: Union[int, float] = self._numeric_type(self._entry.get()) + self._step_size
            self._entry.configure(state=ctk.NORMAL)
            self._entry.delete(0, ctk.END)
            self._entry.insert(0, value)
            self._entry.configure(state=READ_ONLY)
        except ValueError:
            return

    def subtract_button_callback(self):
        if self._command is not None:
            self._command()
        try:
            self._entry.configure(state=ctk.NORMAL)
            value: Union[int, float] = self._numeric_type(self._entry.get()) - self._step_size
            self._entry.delete(0, ctk.END)
            self._entry.insert(0, value)
            self._entry.configure(state=READ_ONLY)
        except ValueError:
            return

    def get(self) -> Union[int, float, None]:
        try:
            return self._numeric_type(self._entry.get())
        except ValueError:
            return None

    def set(self, value: Union[int, float]):
        self._entry.configure(state=ctk.NORMAL)
        self._entry.delete(0, ctk.END)
        self._entry.insert(0, str(self._numeric_type(value)))
        self._entry.configure(state=READ_ONLY)
