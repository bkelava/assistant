from typing import Dict, List
from varname import nameof

from database import DatabaseHandler

COMPANY_NAME = "company_name"
NAME = "name"
LAST_NAME = "last_name"


class DatabaseHelper:
    def __init__(self) -> None:
        raise (f"Can not create instance of '{nameof(DatabaseHelper)}'.")

    @staticmethod
    def get_list_of_employee_names() -> List:
        employees: Dict = DatabaseHandler.get_employees()
        employee_names_list: List = list()
        for employee in employees:
            employee_names_list.append(f"{employee[NAME]} {employee[LAST_NAME]}")
        return employee_names_list

    @staticmethod
    def get_list_of_employers() -> List:
        employers: Dict = DatabaseHandler.get_employers()
        employers_names: List = list()
        for employer in employers:
            employers_names.append(str(employer[COMPANY_NAME]))
        return employers_names
