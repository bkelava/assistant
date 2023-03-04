from constants.specials import DOWN_DASH


def create_line(lengh: int) -> str:
    output: str = ""
    for index in range(0, lengh + 2):
        output += DOWN_DASH
    return output
