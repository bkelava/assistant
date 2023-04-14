import customtkinter as ctk
import tkinter as tk

from typing import Any, List

import src.constants.colors as Color
import src.constants.fonts as Font

from src.constants.bindings import KEY_RELEASE, LISTBOX_SELECT
from src.constants.specials import EMPTY_STRING


class SearchBox(ctk.CTkFrame):
    def __init__(self, container: Any, data: List[str] = [], *args, **kwargs):
        super().__init__(container, *args, **kwargs)
        self._data: List[str] = data
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        self._entry: ctk.CTkEntry = ctk.CTkEntry(self, font=self._font)
        self._entry.pack(padx=10, pady=10, fill=ctk.BOTH, expand=True)

        self._listbox: tk.Listbox = tk.Listbox(
            self, font=self._font, bg=Color.BLACK_1529, fg=Color.LIGHT_GREY, exportselection=False, selectmode=tk.SINGLE
        )
        self._listbox.pack(padx=10, pady=(0, 10), fill=ctk.BOTH, expand=True)

        self._update(self._data)

        self._listbox.bind(LISTBOX_SELECT, lambda _: self._fillout())

        self._entry.bind(KEY_RELEASE, lambda _: self._check())

    def _update(self, data: List):
        self._listbox.delete(0, ctk.END)
        for item in data:
            self._listbox.insert(ctk.END, item)

    def _fillout(self):
        try:
            self._entry.delete(0, ctk.END)
            self._entry.insert(0, self._listbox.get(self._listbox.curselection()))
        except tk.TclError:
            pass

    def _check(self):
        try:
            typed: str = self._entry.get()
            if typed == EMPTY_STRING:
                data: List = self._data
            else:
                data: List = []
                for item in self._data:
                    if typed.lower() in item.lower():
                        data.append(item)
            self._update(data)
        except tk.TclError:
            pass

    def get(self) -> str:
        return self._entry.get()

    def set(self, text: str) -> None:
        self._entry.delete(0, ctk.END)
        self._entry.insert(0, text)
