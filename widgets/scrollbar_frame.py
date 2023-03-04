import customtkinter as ctk

from tkinter import ttk
from typing import Any


class ScrollbarFrame(ctk.CTkFrame):
    def __init__(self, container: Any, *args, **kwargs):
        super().__init__(container, *args, **kwargs)

        super().__init__(container, *args, **kwargs)
        self.canvas = ctk.CTkCanvas(self)
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
            self, orient=ctk.VERTICAL, command=self.canvas.yview, style="arrowless.Vertical.TScrollbar"
        )
        self.scrollable_frame = ctk.CTkFrame(self.canvas, fg_color="black")

        self.scrollable_frame.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))

        canvas_frame = self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor=ctk.NW)
        self.canvas.bind("<Configure>", lambda e: self.canvas.itemconfig(canvas_frame, width=e.width))

        self.canvas.configure(yscrollcommand=scrollbar.set)

        self.canvas.pack(side=ctk.LEFT, fill=ctk.BOTH, expand=True)
        scrollbar.pack(side="right", fill="y")

        self.scrollable_frame.bind("<Button-4>", lambda event: self.scroll_up())
        self.scrollable_frame.bind("<Button-5>", lambda event: self.scroll_down())

    def scroll_up(self) -> None:
        self.canvas.yview_scroll(-1, "units")

    def scroll_down(self) -> None:
        self.canvas.yview_scroll(1, "units")
