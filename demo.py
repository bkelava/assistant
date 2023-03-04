from customtkinter import *


OPTIONS = {"A": ["1", "2", "3"], "B": ["4", "5", "6"]}


class Test:
    def __init__(self, master) -> None:
        self.master = master
        self.cb_frame = CTkFrame(root)
        self.cb_frame.pack(side="left")

        self.cb1_values = list(OPTIONS.keys())

        self.cb1_var = StringVar()
        self.cb1_var.set(self.cb1_values[0])
        self.cb1 = CTkComboBox(
            self.cb_frame, values=list(OPTIONS.keys()), variable=self.cb1_var, command=lambda _: self.get_var_1()
        )
        self.cb1.pack(side="top")
        # self.cb1.bind("<<ComboboxSelected>>", lambda _: self.get_var_1())

        self.cb2_var = StringVar()
        self.cb2_var.set(OPTIONS[self.cb1_values[0]][0])
        self.cb2 = CTkComboBox(self.cb_frame, values=OPTIONS[self.cb1_values[0]], variable=self.cb2_var)
        self.cb2.pack(side="bottom")

        btn_frame = CTkFrame(root)
        btn_frame.pack(side="right")
        CTkButton(btn_frame, text="Confirm", command=self.get_info).pack()

    def get_var_1(self):
        print("CALLEd")
        value = self.cb1_var.get()
        self.cb2_var.set(OPTIONS[value][0])
        self.cb2.configure(values=OPTIONS[value])

    def get_info(self):
        print(self.cb1_var.get(), self.cb2_var.get())


root = CTk()

instance = Test(root)

root.mainloop()
