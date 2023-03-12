import calendar
import customtkinter as ctk

from typing import Dict, List, Tuple, Union

import constants.entry as Entry

from constants.specials import DOWN_DASH, EMPTY_STRING, SPACE
from tables import Employee, PERSONAL_ID

NAME_AND_LAST_NAME: str = "name_and_lastname"


def entry_insert_and_delete(entry: ctk.CTkEntry, text: str = EMPTY_STRING) -> None:
    entry.delete(0, ctk.END)
    entry.insert(0, text)


def entry_delete_insert_readonly(entry: ctk.CTkEntry, text: str = EMPTY_STRING) -> None:
    entry.configure(state=Entry.WRITE)
    entry.delete(0, ctk.END)
    entry.insert(0, text)
    entry.configure(state=Entry.READ_ONLY)


def parse_personal_id_from_string(string: str) -> str:
    return string.split(SPACE)[0]


def parse_employee_name_and_lastname_from_string(string: str) -> str:
    return string.partition(SPACE)[2]


def parse_employee_name_and_lastname(employees: List[Employee]) -> List[Dict]:
    output: List[Dict] = []
    for employee in employees:
        value = {NAME_AND_LAST_NAME: employee.name + SPACE + employee.lastname, PERSONAL_ID: employee.personal_id}
        output.append(value)
    return output


def create_line(lengh: int) -> str:
    output: str = ""
    for _ in range(0, lengh + 2):
        output += DOWN_DASH
    return output


def replace_character(
    string: str, character_to_replace: str = SPACE, caharacter_to_replace_with: str = DOWN_DASH
) -> str:
    return string.replace(character_to_replace, caharacter_to_replace_with)


def remove_unnecesary_dates_from_calendar(calendar: Tuple, month: int) -> Union[List, Tuple]:
    list_from_tuple: List = list(calendar)
    for item in list_from_tuple:
        if item[1] != month:
            list_from_tuple.remove(item)
            return remove_unnecesary_dates_from_calendar(tuple(list_from_tuple), month)
    return list_from_tuple


def create_date(date: Tuple) -> str:
    return f"{date[2]}.{date[1]}.{date[0]}."


def parse_first_and_last_day(month: int, year: int) -> Tuple[str, str]:
    cal = calendar.Calendar(calendar.MONDAY)
    new_calendar: List = []
    for day in cal.itermonthdays3(year, month):
        if day[1] == month:
            new_calendar.append(day)
    first_day: Tuple = new_calendar[0]
    last_day: Tuple = new_calendar[-1]
    return (create_date(first_day), create_date(last_day))
