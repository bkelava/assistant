import json

from typing import Dict, List, Union, TextIO, Tuple
from varname import nameof

from constants import specials
from tables import (
    Employee,
    Employer,
    COMPANY_NAME,
    STREET,
    CITY,
    POSTAL,
    VAT,
    DIRECTOR,
    NAME,
    LASTNAME,
    PERSONAL_ID,
    EMPLOYER_NAME,
)
from utils import ErrorCode

EMPLOYEE = "employee"
EMPLOYER = "employer"

EMPLOYEE_DB: str = f"resources/{EMPLOYEE}.json"
EMPLOYER_DB: str = f"resources/{EMPLOYER}.json"

ADDRESS: str = "address"

READ_MODE: str = "r"
WRITE_MODE: str = "w"


class DatabaseHandler:
    def __init__(self) -> None:
        raise TypeError(f"Cannot create '{nameof(DatabaseHandler)}' instance.")

    @staticmethod
    def get_employees() -> List[Employee]:
        with open(EMPLOYEE_DB, READ_MODE) as file:
            employees_json: TextIO = json.load(file)
        employees: List[Employee] = []
        for item in employees_json:
            employees.append(Employee(item))
        return employees

    @staticmethod
    def get_employers() -> List[Employer]:
        with open(EMPLOYER_DB, READ_MODE) as file:
            employers_json: TextIO = json.load(file)
        employers: List[Employer] = []
        for item in employers_json:
            employers.append(Employer(item))
        return employers

    @staticmethod
    def update_employees(employees: List[Employee]) -> None:
        employees_dict: List[Dict] = DatabaseHandler.employees_list_to_dict(employees)
        with open(EMPLOYEE_DB, WRITE_MODE) as file:
            json.dump(employees_dict, file)

    @staticmethod
    def update_employers(employers: List[Employer]) -> None:
        employers_dict: List[Dict] = DatabaseHandler.employers_list_to_dict(employers)
        with open(EMPLOYER_DB, WRITE_MODE) as file:
            json.dump(employers_dict, file)

    @staticmethod
    def get_list_of_employers_names() -> List[str]:
        data: List = []
        employers: List[Employer] = DatabaseHandler.get_employers()
        for employer in employers:
            data.append(employer.company_name)
        return data

    @staticmethod
    def get_employee_employers_difference(employee: Employee) -> List[str]:
        employers: List[str] = DatabaseHandler.get_list_of_employers_names()
        difference: List[str] = list(set(employers) - set(employee.employer_names))
        return difference

    @staticmethod
    def get_employer_from_employer_name(employer_name: str) -> Union[Employer, None]:
        employers: List[Employer] = DatabaseHandler.get_employers()
        employer: Employer = None
        for item in employers:
            if item.company_name == employer_name:
                employer = item
        if employer == None:
            return None
        return employer

    @staticmethod
    def get_employees_from_company(company_name: str) -> List[Employee]:
        employees: List[Employee] = DatabaseHandler.get_employees()
        output: List[Employee] = []
        for employee in employees:
            if company_name in employee.employer_names:
                output.append(employee)
        return output

    @staticmethod
    def drop_employer(employer: Employer) -> ErrorCode:
        employers: List[Employer] = DatabaseHandler.get_employers()
        status: ErrorCode = ErrorCode.ERROR
        for _employer in employers:
            if _employer == employer:
                employers.remove(_employer)
                DatabaseHandler.update_employers(employers)
                status = ErrorCode.NO_ERROR
                break
        return status

    @staticmethod
    def drop_employee(employee: Employee) -> ErrorCode:
        employees: List[Employee] = DatabaseHandler.get_employees()
        status: ErrorCode = ErrorCode.ERROR
        for _employee in employees:
            if _employee == employee:
                employees.remove(_employee)
                DatabaseHandler.update_employees(employees)
                status = ErrorCode.NO_ERROR
                break
        return status

    @staticmethod
    def insert_employee(employee: Employee) -> None:
        employees: List[Employee] = DatabaseHandler.get_employees()
        for _employee in employees:
            if _employee == employee:
                return ErrorCode.ERROR
        employees.append(employee)
        DatabaseHandler.update_employees(employees)
        return ErrorCode.NO_ERROR

    @staticmethod
    def insert_employer(employer: Employer) -> ErrorCode:
        employers: List[Employer] = DatabaseHandler.get_employers()
        for _employer in employers:
            if _employer == employer:
                return ErrorCode.ERROR
        employers.append(employer)
        DatabaseHandler.update_employers(employers)
        return ErrorCode.NO_ERROR

    @staticmethod
    def alter_employee(employee: Employee, new_employee_data: Employee) -> ErrorCode:
        status: ErrorCode = ErrorCode.ERROR
        employees: List[Employee] = DatabaseHandler.get_employees()
        for _employee in employees:
            if _employee == employee:
                _employee.name = employee.name
                _employee.lastname = employee.lastname
                _employee.street = employee.street
                _employee.city = employee.city
                _employee.postal = employee.postal
                _employee.personal_id = employee.personal_id
                _employee.employer_names = employee.employer_names
                status = ErrorCode.NO_ERROR
                break
        if status == ErrorCode.NO_ERROR:
            DatabaseHandler.update_employees(employees)
            return status
        return status

    @staticmethod
    def alter_employer(employer: Employer, new_employer_data: Employer) -> ErrorCode:
        status: ErrorCode = ErrorCode.ERROR
        employers: List[Employer] = DatabaseHandler.get_employers()
        for _employer in employers:
            if _employer == employer:
                _employer.company_name = new_employer_data.company_name
                _employer.street = new_employer_data.street
                _employer.city = new_employer_data.city
                _employer.postal = new_employer_data.postal
                _employer.vat = new_employer_data.vat
                _employer.director = new_employer_data.director
                status = ErrorCode.NO_ERROR
                break
        if status == ErrorCode.NO_ERROR:
            DatabaseHandler.update_employers(employers)
            return status
        return status

    @staticmethod
    def get_employee_personal_id_from_name_and_last_name(
        name_and_last_name: str,
    ) -> Union[str, None]:
        name, last_name = name_and_last_name.split(" ")
        employees: List[Employee] = DatabaseHandler.get_employees()
        for employee in employees:
            if name == employee.name:
                if last_name == employee.lastname:
                    return employee.personal_id
        return None

    @staticmethod
    def get_company_info(company_name: str) -> Union[str, None]:
        employers: List[Employer] = DatabaseHandler.get_employers()
        employer: Employer = None
        for _employer in employers:
            if company_name == _employer.company_name:
                employer = _employer
        if employer == None:
            return None
        info: str = (
            f"{employer.street}, {employer.postal} {employer.city}, {specials.VAT}{specials.COLON}{employer.vat}"
        )
        return info

    def get_company_director_from_company_name(company_name: str) -> Union[str, None]:
        employers: List[Employer] = DatabaseHandler.get_employers()
        employer: Employer = None
        for _employer in employers:
            if company_name == _employer.company_name:
                employer = _employer
        if employer == None:
            return None
        director: str = str(employer.director)
        return director

    @staticmethod
    def get_list_of_employee_names_with_personal_id() -> List[str]:
        employees: List[Employee] = DatabaseHandler.get_employees()
        output: List[str] = []
        for employee in employees:
            string: str = employee.personal_id + specials.SPACE + employee.name + specials.SPACE + employee.lastname
            output.append(string)
        return output

    @staticmethod
    def get_list_of_employee_names_with_personal_id_from_company_name(name: str) -> List[str]:
        employees: List[Employee] = DatabaseHandler.get_employees()
        output: List[str] = []
        for employee in employees:
            if name in employee.employer_names:
                string: str = employee.personal_id + specials.SPACE + employee.name + specials.SPACE + employee.lastname
                output.append(string)
        return output

    @staticmethod
    def get_list_of_employee_names(employer_name: str) -> List[str]:
        employees: List[Employee] = DatabaseHandler.get_employees()
        employee_names_list: List[str] = []
        for employee in employees:
            if employer_name in employee.employer_names:
                employee_names_list.append(f"{employee.name} {employee.lastname}")
        return employee_names_list

    @staticmethod
    def get_list_of_employer_names() -> List[str]:
        employers: List[Employer] = DatabaseHandler.get_employers()
        employers_names: List[str] = []
        for employer in employers:
            employers_names.append(str(employer.company_name))
        return employers_names

    def get_employee_from_personal_id(personal_id: str) -> Union[Employee, None]:
        employees: List[Employee] = DatabaseHandler.get_employees()
        employee: Employee = None
        for _employee in employees:
            if _employee.personal_id == personal_id:
                employee = _employee
        return employee

    @staticmethod
    def employees_list_to_dict(list: List[Employee]) -> List[Dict]:
        output: List[Dict] = []
        for item in list:
            value: Dict = {
                NAME: item.name,
                LASTNAME: item.lastname,
                ADDRESS: {
                    STREET: item.street,
                    CITY: item.city,
                    POSTAL: item.postal,
                },
                PERSONAL_ID: item.personal_id,
                EMPLOYER_NAME: item.employer_names,
            }
            output.append(value)
        return output

    @staticmethod
    def employers_list_to_dict(list: List[Employer]) -> List[Dict]:
        output: List[Dict] = []
        for item in list:
            value: Dict = {
                COMPANY_NAME: item.company_name,
                ADDRESS: {
                    STREET: item.street,
                    CITY: item.city,
                    POSTAL: item.postal,
                },
                VAT: item.vat,
                DIRECTOR: item.director,
            }
            output.append(value)
        return output
