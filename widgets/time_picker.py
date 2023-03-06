import customtkinter as ctk

from constants.specials import WRITE
from widgets import FloatSpinbox


class TimePicker(ctk.CTkFrame):
    def __init__(self, *args, width: int = 200, height: int = 64, **kwargs):
        super().__init__(*args, width=width, height=height, **kwargs)

        self._hours_spinbox = FloatSpinbox(self, numeric_type=int)
        self._minutes_spinbox = FloatSpinbox(self, numeric_type=int)

        self._hours_spinbox.grid(row=0, column=0, padx=2, pady=2)
        self._minutes_spinbox.grid(row=0, column=1, padx=2, pady=2)

        self._hours_spinbox._entry_str_var.trace_add(WRITE, self.__validate_hours)
        self._minutes_spinbox._entry_str_var.trace_add(WRITE, self.__validate_minutes)

    def __validate_hours(self, *args) -> None:
        try:
            current_value = self._hours_spinbox.get()
            if current_value < 0:
                self._hours_spinbox.set(0)
            if current_value > 23:
                self._hours_spinbox.set(23)
        except TypeError:
            pass

    def __validate_minutes(self, *args) -> None:
        try:
            current_value = self._minutes_spinbox.get()
            if current_value < 0:
                self._minutes_spinbox.set(0)
            if current_value > 59:
                self._minutes_spinbox.set(59)
        except TypeError:
            pass

    def get(self) -> str:
        try:
            hours: str = str(self._hours_spinbox.get())
            if int(hours) < 10:
                hours = str(0) + hours
            minutes: str = str(self._minutes_spinbox.get())
            if int(minutes) < 10:
                minutes = str(0) + minutes
            return f"{hours}:{minutes}"
        except ValueError:
            pass
