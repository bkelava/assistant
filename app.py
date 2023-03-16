import customtkinter as ctk
import constants.application as App
import constants.colors as Color
import constants.label as Label

from frames import MainWorkspace


class MainApp(ctk.CTk):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        ctk.set_appearance_mode(Color.DARK_APPERANCE)
        ctk.set_default_color_theme(Color.DARK_THEME)
        # self.attributes(App.ZOOMED_MOD, True)
        self.geometry(f"{App.APP_WIDTH}x{App.APP_HEIGHT}")
        self.title(Label.APPLICATION_TITLE)

        self.__set_up_grid()
        self.__set_up_ui()

    def __set_up_ui(self):
        container: ctk.CTkFrame = MainWorkspace(self)
        container.grid(
            column=0,
            row=0,
            columnspan=20,
            rowspan=20,
            sticky=ctk.NSEW,
        )

    def __set_up_grid(self) -> None:
        for i in range(App.APP_GRID_SIZE):
            self.rowconfigure(i, weight=1)
            self.columnconfigure(i, weight=1)


if __name__ == "__main__":
    root: MainApp = MainApp()
    root.mainloop()
