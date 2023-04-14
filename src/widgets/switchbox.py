import customtkinter as ctk
import tkinter as tk

from typing import Any, List, Literal

import src.constants.colors as Color
import src.constants.fonts as Font

from src.constants.bindings import LISTBOX_SELECT
from src.constants.listbox import LEFT_LISTBOX_TITLE, RIGHT_LISTBOX_TITLE
from src.constants.specials import EMPTY_STRING, LEFT, RIGHT


class Switchbox(ctk.CTkFrame):
    def __init__(
        self,
        container: Any,
        left_box_title: str = LEFT_LISTBOX_TITLE,
        right_box_title: str = RIGHT_LISTBOX_TITLE,
        left_box_data: List[str] = [],
        right_box_data: List[str] = [],
        *args,
        **kwargs
    ):
        super().__init__(container, *args, **kwargs)
        self._left_listbox_title: str = left_box_title
        self._right_listbox_title: str = right_box_title
        self._left_listbox_data: List[str] = left_box_data
        self._right_listbox_data: List[str] = right_box_data

        self.__selection: str = EMPTY_STRING

        self.configure(fg_color=Color.BLACK_1529)
        self._font: ctk.CTkFont = ctk.CTkFont(
            family=Font.ARIEL,
            size=Font.SIZE_20,
            weight=Font.BOLD,
        )

        self._frame_listbox_left: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLACK_1529)
        self._frame_buttons: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLACK_1529)
        self._frame_listbox_right: ctk.CTkFrame = ctk.CTkFrame(self, fg_color=Color.BLACK_1529)

        self._label_left_listbox_title: ctk.CTkLabel = ctk.CTkLabel(
            self._frame_listbox_left,
            text=self._left_listbox_title,
            font=self._font,
            text_color=Color.WHITE,
            justify=ctk.CENTER,
        )
        self._listbox_left: tk.Listbox = tk.Listbox(
            self._frame_listbox_left,
            font=self._font,
            bg=Color.BLACK_1529,
            fg=Color.LIGHT_GREY,
            exportselection=False,
            selectmode=tk.SINGLE,
        )

        self._label_right_listbox_title: ctk.CTkLabel = ctk.CTkLabel(
            self._frame_listbox_right,
            text=self._right_listbox_title,
            font=self._font,
            text_color=Color.WHITE,
            justify=ctk.CENTER,
        )
        self._listbox_right: tk.Listbox = tk.Listbox(
            self._frame_listbox_right,
            font=self._font,
            bg=Color.BLACK_1529,
            fg=Color.LIGHT_GREY,
            exportselection=False,
            selectmode=tk.SINGLE,
        )

        self._button_shift_left: ctk.CTkButton = ctk.CTkButton(
            self._frame_buttons,
            font=self._font,
            command=self.__switch_left,
            text="←",
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )
        self._button_shift_right: ctk.CTkButton = ctk.CTkButton(
            self._frame_buttons,
            font=self._font,
            command=self.__switch_right,
            text="→",
            fg_color=Color.BLUE_LIGHT_1529,
            text_color=Color.BLUE_1529,
            hover_color=Color.GREY_1529,
        )

        self._frame_listbox_left.pack(padx=10, pady=10, side=ctk.LEFT)
        self._frame_buttons.pack(padx=(0, 10), pady=10, side=ctk.LEFT)
        self._frame_listbox_right.pack(padx=(0, 10), pady=10, side=ctk.LEFT)

        self._label_left_listbox_title.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.BOTH, expand=True)
        self._listbox_left.pack(padx=10, pady=(0, 10), side=ctk.BOTTOM, fill=ctk.BOTH, expand=True)

        self._button_shift_left.pack(pady=10, side=ctk.TOP)
        self._button_shift_right.pack(pady=10, side=ctk.BOTTOM)

        self._label_right_listbox_title.pack(padx=10, pady=10, side=ctk.TOP, fill=ctk.BOTH, expand=True)
        self._listbox_right.pack(padx=10, pady=(0, 10), side=ctk.BOTTOM, fill=ctk.BOTH, expand=True)

        self._listbox_left.bind(LISTBOX_SELECT, lambda _: self.__set_left_selection())
        self._listbox_right.bind(LISTBOX_SELECT, lambda _: self.__set_right_selection())

        self._update(LEFT)
        self._update(RIGHT)

        self._button_shift_left.configure(state=ctk.DISABLED)
        self._button_shift_right.configure(state=ctk.DISABLED)

    def __set_right_selection(self) -> None:
        try:
            if self._listbox_right.size() == 0:
                self._button_shift_left.configure(state=ctk.DISABLED)
            else:
                self._button_shift_left.configure(state=ctk.NORMAL)
            self.__selection = self._listbox_right.get(self._listbox_right.curselection())
            self._listbox_left.selection_clear(0, ctk.END)
        except tk.TclError:
            pass

    def __set_left_selection(self) -> None:
        try:
            if self._listbox_left.size() == 0:
                self._button_shift_right.configure(state=ctk.DISABLED)
                return
            else:
                self._button_shift_right.configure(state=ctk.NORMAL)
            self.__selection = self._listbox_left.get(self._listbox_left.curselection())
            self._listbox_right.selection_clear(0, ctk.END)
        except tk.TclError:
            pass

    def _update(self, box: Literal["right", "left"]) -> None:
        if box == LEFT:
            self._listbox_left.delete(0, ctk.END)
            for item in self._left_listbox_data:
                self._listbox_left.insert(ctk.END, item)
        elif box == RIGHT:
            self._listbox_right.delete(0, ctk.END)
            for item in self._right_listbox_data:
                self._listbox_right.insert(ctk.END, item)
        else:
            return

    def __switch_left(self) -> None:
        if self.__selection != EMPTY_STRING:
            self._right_listbox_data.remove(self.__selection)
            self._left_listbox_data.append(self.__selection)
            self._update(LEFT)
            self._update(RIGHT)
            self._button_shift_left.configure(state=ctk.DISABLED)

    def __switch_right(self) -> None:
        if self.__selection != EMPTY_STRING:
            self._left_listbox_data.remove(self.__selection)
            self._right_listbox_data.append(self.__selection)
            self._update(LEFT)
            self._update(RIGHT)
            self._button_shift_right.configure(state=ctk.DISABLED)
