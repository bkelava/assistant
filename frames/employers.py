import constants.colors as Color

from .program_frame import ProgramFrame


class EmployerFrame(ProgramFrame):
    def __init__(self, *args, **kwargs):
        super(EmployerFrame, self).__init__(*args, **kwargs)

        self.configure(fg_color=Color.BLACK_1529)
