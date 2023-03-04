import customtkinter as ctk

from typing import Callable, Union

from constants.specials import WRITE
from constants.bindings import FOCUS_IN
from widgets import FloatSpinbox


class TimePicker(ctk.CTkFrame):
    def __init__(self, *args, width: int = 200, height: int = 64, **kwargs):
        super().__init__(*args, width=width, height=height, **kwargs)

        self.hours_spinbox = FloatSpinbox(self, numeric_type=int)
        self.minutes_spinbox = FloatSpinbox(self, numeric_type=int)

        self.hours_spinbox.grid(row=0, column=0, padx=2, pady=2)
        self.minutes_spinbox.grid(row=0, column=1, padx=2, pady=2)

        self.hours_spinbox.entry_str_var.trace_add(WRITE, self.__validate_hours)
        self.minutes_spinbox.entry_str_var.trace_add(WRITE, self.__validate_minutes)

    #     self.hours_spinbox.bind(FOCUS_IN, lambda *args: self.__hours_spinbox_focus_in_binding(*args))

    # def __hours_spinbox_focus_in_binding(self, *args):
    #     if self.hours_spinbox.get() == "":
    #         self.hours_spinbox.set(float(0))

    def __validate_hours(self, *args):
        try:
            current_value = self.hours_spinbox.get()
            if current_value < 0:
                self.hours_spinbox.set(0)
            if current_value > 23:
                self.hours_spinbox.set(23)
        except TypeError:
            pass

    def __validate_minutes(self, *args):
        try:
            current_value = self.minutes_spinbox.get()
            if current_value < 0:
                self.minutes_spinbox.set(0)
            if current_value > 59:
                self.minutes_spinbox.set(59)
        except TypeError:
            pass

    def get(self) -> str:
        try:
            hours: str = str(self.hours_spinbox.get())
            if int(hours) < 10:
                hours = str(0) + hours
            minutes: str = str(self.minutes_spinbox.get())
            if int(minutes) < 10:
                minutes = str(0) + minutes
            return f"{hours}:{minutes}"
        except ValueError:
            pass
