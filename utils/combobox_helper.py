from typing import Dict, List

from database import DatabaseHandler

COMPANY_NAME = "company_name"
NAME = "name"
LAST_NAME = "last_name"


class ComboboxHelper:
    def __init__(self) -> None:
        raise ("Can not create instance of 'ComboboxHelper'.")

    @staticmethod
    def get_list_of_employee_names() -> List:
        employees: Dict = DatabaseHandler.get_employees()
        employee_names_list: List = list()
        for employee in employees:
            employee_names_list.append(
                f"{employee[NAME]} {employee[LAST_NAME]}"
            )
        return employee_names_list

    @staticmethod
    def get_list_of_employers() -> List:
        employers: Dict = DatabaseHandler.get_employers()
        employers_names: List = list()
        for employer in employers:
            employers_names.append(str(employer[COMPANY_NAME]))
        return employers_names
