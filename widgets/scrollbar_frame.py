import customtkinter as ctk

from tkinter import ttk
from typing import Any

from constants.bindings import BUTTON_4, BUTTON_5, CONFIGURE


class ScrollbarFrame(ctk.CTkFrame):
    def __init__(self, container: Any, *args, **kwargs):
        super().__init__(container, *args, **kwargs)

        super().__init__(container, *args, **kwargs)
        self._canvas = ctk.CTkCanvas(self)
        style: ttk.Style = ttk.Style(self)
        style.layout(
            "arrowless.Vertical.TScrollbar",
            [
                (
                    "Vertical.Scrollbar.trough",
                    {"children": [("Vertical.Scrollbar.thumb", {"expand": "1", "sticky": "nswe"})], "sticky": "ns"},
                )
            ],
        )
        scrollbar = ttk.Scrollbar(
            self, orient=ctk.VERTICAL, command=self._canvas.yview, style="arrowless.Vertical.TScrollbar"
        )
        self._scrollable_frame = ctk.CTkFrame(self._canvas)

        self._scrollable_frame.bind(
            CONFIGURE, lambda _: self._canvas.configure(scrollregion=self._canvas.bbox(ctk.ALL))
        )

        canvas_frame = self._canvas.create_window((0, 0), window=self._scrollable_frame, anchor=ctk.NW)
        self._canvas.bind(CONFIGURE, lambda event: self._canvas.itemconfig(canvas_frame, width=event.width))

        self._canvas.configure(yscrollcommand=scrollbar.set)

        self._canvas.pack(side=ctk.LEFT, fill=ctk.BOTH, expand=True)
        scrollbar.pack(side=ctk.RIGHT, fill=ctk.Y)

        self._scrollable_frame.bind(BUTTON_4, lambda _: self.scroll_up())
        self._scrollable_frame.bind(BUTTON_5, lambda _: self.scroll_down())

    def scroll_up(self) -> None:
        self._canvas.yview_scroll(-1, ctk.UNITS)

    def scroll_down(self) -> None:
        self._canvas.yview_scroll(1, ctk.UNITS)
