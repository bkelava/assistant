import customtkinter as ctk

from typing import Callable, Union, Type


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

        self.step_size: Union[int, float] = step_size
        self.command: Callable = command
        self.validatecommand = validatecommand
        self.numeric_type = numeric_type

        self.configure(fg_color=("gray78", "gray28"))  # set frame color

        self.grid_columnconfigure((0, 2), weight=0)  # buttons don't expand
        self.grid_columnconfigure(1, weight=1)  # entry expands

        self.subtract_button: ctk.CTkButton = ctk.CTkButton(
            self, text="-", width=height - 6, height=height - 6, command=self.subtract_button_callback
        )
        self.subtract_button.grid(row=0, column=0, padx=(3, 0), pady=3)

        self.entry_str_var: ctk.StringVar() = ctk.StringVar()
        self.entry: ctk.CTkEntry = ctk.CTkEntry(
            self,
            width=width - (2 * height),
            height=height - 6,
            border_width=0,
            justify=ctk.CENTER,
            validatecommand=self.validatecommand,
            textvariable=self.entry_str_var,
        )
        self.entry_str_var.trace("w", self.validate_numeric)
        self.entry.grid(row=0, column=1, columnspan=1, padx=3, pady=3, sticky="ew")

        self.add_button: ctk.CTkButton = ctk.CTkButton(
            self, text="+", width=height - 6, height=height - 6, command=self.add_button_callback
        )
        self.add_button.grid(row=0, column=2, padx=(0, 3), pady=3)

        # default value
        self.entry.insert(0, self.numeric_type(start_from))

        self.entry.bind("<Button-4>", lambda event: self.add_button_callback())
        self.entry.bind("<Button-5>", lambda event: self.subtract_button_callback())

    def validate_numeric(self, *args):
        last_character_index = self.entry.index(ctk.INSERT)
        item = self.entry_str_var.get()
        try:
            item_type = type(float(item))
            if item_type == type(float(1.0)):
                pass
        except:
            self.entry.delete(last_character_index - 1, last_character_index)

    def add_button_callback(self):
        if self.command is not None:
            self.command()
        try:
            value: Union[int, float] = self.numeric_type(self.entry.get()) + self.step_size
            self.entry.delete(0, "end")
            self.entry.insert(0, value)
        except ValueError:
            return

    def subtract_button_callback(self):
        if self.command is not None:
            self.command()
        try:
            value: Union[int, float] = self.numeric_type(self.entry.get()) - self.step_size
            self.entry.delete(0, "end")
            self.entry.insert(0, value)
        except ValueError:
            return

    def get(self) -> Union[int, float, None]:
        try:
            return self.numeric_type(self.entry.get())
        except ValueError:
            return None

    def set(self, value: Union[int, float]):
        self.entry.delete(0, "end")
        self.entry.insert(0, str(self.numeric_type(value)))
