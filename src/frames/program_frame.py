import customtkinter as ctk


class ProgramFrame(ctk.CTkFrame):
    def __init__(self, container: ctk.CTkFrame, *args, **kwargs) -> None:
        super().__init__(container, *args, **kwargs)

    def _set_up_grid(self, grid_column_size: int, grid_row_size: int) -> None:
        for cell in range(grid_column_size):
            self.columnconfigure(cell, weight=1)
        for cell in range(grid_row_size):
            self.rowconfigure(cell, weight=1)
