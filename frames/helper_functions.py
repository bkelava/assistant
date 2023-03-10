import customtkinter as ctk

from typing import Dict, List

import constants.entry as Entry

from constants.specials import EMPTY_STRING, SPACE
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
