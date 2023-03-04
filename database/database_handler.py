import json

from typing import Dict, IO

from tables import Employee

EMPLOYEE = "employee"
EMPLOYER = "employer"

EMPLOYYEE_DB: str = f"resources/{EMPLOYEE}.json"
EMPLOYER_DB: str = f"resources/{EMPLOYER}.json"

NAME: str = "name"
LAST_NAME: str = "last_name"
PERSONAL_ID: str = "personal_id"

COMPANY_NAME: str = "company_name"
ADDRESS: str = "address"
DIRECTOR: str = "director"
STREET: str = "street"
CITY: str = "city"
POSTAL: str = "postal"
VAT: str = "vat"


class DatabaseHandler:
    def __init__(self) -> None:
        raise TypeError("Cannot create 'DatabaseHandler' instance.")

    @staticmethod
    def get_employees() -> Dict:
        file: IO = open(EMPLOYYEE_DB)
        employees: Dict = json.load(file)
        return employees

    @staticmethod
    def get_employers() -> Dict:
        file: IO = open(EMPLOYER_DB)
        employers: Dict = json.load(file)
        return employers

    @staticmethod
    def insert_employee(employee: Employee) -> None:
        pass

    @staticmethod
    def get_employee_personal_id_from_name_and_last_name(
        name_and_last_name: str,
    ) -> str:
        name, last_name = name_and_last_name.split(" ")
        employees: Dict = DatabaseHandler.get_employees()
        for employee in employees:
            if name in employee[NAME]:
                if last_name in employee[LAST_NAME]:
                    return employee[PERSONAL_ID]
        raise Exception("Error, not found.")

    @staticmethod
    def get_company_info(company_name: str) -> str:
        employers: Dict = DatabaseHandler.get_employers()
        company: Dict = dict()
        for employer in employers:
            if company_name in employer[COMPANY_NAME]:
                company = employer
        info: str = (
            f"{company[ADDRESS][STREET]}, {company[ADDRESS][POSTAL]} {company[ADDRESS][CITY]}, OIB:{company[VAT]}"
        )
        return info

    def get_company_director_from_company_name(company_name: str) -> str:
        employers: Dict = DatabaseHandler.get_employers()
        company: Dict = dict()
        for employer in employers:
            if company_name in employer[COMPANY_NAME]:
                company = employer
        director: str = str(company[DIRECTOR])
        return director
