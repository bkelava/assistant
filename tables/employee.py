from typing import List

NAME: str = "name"
LASTNAME: str = "lastname"
ADDRESS: str = "address"
STREET: str = "street"
CITY: str = "city"
POSTAL: str = "postal"
PERSONAL_ID: str = "personal_id"
EMPLOYER_NAME: str = "employer_name"


class Employee:
    def __init__(self, *args, **kwargs) -> None:
        if kwargs:
            self.__name: str = kwargs[NAME]
            self.__lastname: str = kwargs[LASTNAME]
            self.__street: str = kwargs[STREET]
            self.__city: str = kwargs[CITY]
            self.__postal: str = kwargs[POSTAL]
            self.__personal_id: str = kwargs[PERSONAL_ID]
            self.__employer_names: List[str] = kwargs[EMPLOYER_NAME]
        else:
            self.__name: str = args[0][NAME]
            self.__lastname: str = args[0][LASTNAME]
            self.__street: str = args[0][ADDRESS][STREET]
            self.__city: str = args[0][ADDRESS][CITY]
            self.__postal: str = args[0][ADDRESS][POSTAL]
            self.__personal_id: str = args[0][PERSONAL_ID]
            self.__employer_names: List[str] = args[0][EMPLOYER_NAME]

    @property
    def name(self) -> str:
        return self.__name

    @name.setter
    def name(self, new_name: str) -> None:
        self.__name = new_name

    @property
    def lastname(self) -> str:
        return self.__lastname

    @lastname.setter
    def lastname(self, new_lastname: str) -> None:
        self.__lastname = new_lastname

    @property
    def street(self) -> str:
        return self.__street

    @street.setter
    def street(self, new_street) -> None:
        self.__street = new_street

    @property
    def city(self) -> str:
        return self.__city

    @city.setter
    def city(self, new_city) -> None:
        self.__city = new_city

    @property
    def postal(self) -> str:
        return self.__postal

    @postal.setter
    def postal(self, new_postal) -> str:
        self.__postal = new_postal

    @property
    def address(self) -> str:
        return f"{self.__street}, {self.__city}, {self.__postal}"

    @address.setter
    def address(
        self,
        new_street: str = None,
        new_city: str = None,
        new_postal: str = None,
    ) -> None:
        if new_street is not None:
            self.__street = new_street
        if new_city is not None:
            self.__city = new_city
        if new_postal is not None:
            self.__postal = new_postal

    @property
    def personal_id(self) -> str:
        return self.__personal_id

    @personal_id.setter
    def personal_id(self, new_id: str) -> None:
        self.__personal_id = new_id

    def __str__(self) -> str:
        return f"{self.__name} {self.__lastname}, {self.__street}, {self.__postal} {self.__city}, OIB/Putovnica: {self.__personal_id}"

    @property
    def employer_names(self) -> List[str]:
        return self.__employer_names

    @employer_names.setter
    def employer_names(self, new_employers: str) -> None:
        self.__employer_names = new_employers

    def __eq__(self, other) -> bool:
        if other == None:
            return None
        if self.__personal_id == other.personal_id:
            return True
        return False
