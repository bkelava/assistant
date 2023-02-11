import customtkinter as ctk

from typing import Callable, Union

from widgets import FloatSpinbox


class TimePicker(ctk.CTkFrame):
    def __init__(self, *args, width: int = 200, height: int = 64, **kwargs):
        super().__init__(*args, width=width, height=height, **kwargs)

        self.hours_spinbox = FloatSpinbox(self, numeric_type=int)
        self.minutes_spinbox = FloatSpinbox(self, numeric_type=int)

        self.hours_spinbox.grid(row=0, column=0, padx=2, pady=2)
        self.minutes_spinbox.grid(row=0, column=1, padx=2, pady=2)

        self.hours_spinbox.entry_str_var.trace_add("write", self.validate_hours)
        self.minutes_spinbox.entry_str_var.trace_add("write", self.validate_minutes)

    def validate_hours(self, *args):
        try:
            current_value = self.hours_spinbox.get()
            if current_value < 0:
                self.hours_spinbox.entry.delete(0, ctk.END)
                self.hours_spinbox.entry.insert(0, "0")
            if current_value > 23:
                self.hours_spinbox.entry.delete(0, ctk.END)
                self.hours_spinbox.entry.insert(0, "23")
        except TypeError:
            pass

    def validate_minutes(self, *args):
        try:
            current_value = self.minutes_spinbox.get()
            if current_value < 0:
                self.minutes_spinbox.entry.delete(0, ctk.END)
                self.minutes_spinbox.entry.insert(0, "0")
            if current_value > 59:
                self.minutes_spinbox.entry.delete(0, ctk.END)
                self.minutes_spinbox.entry.insert(0, "59")
        except TypeError:
            pass
