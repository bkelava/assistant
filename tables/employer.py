from typing import Any, Union

COMPANY_NAME: str = "company_name"
ADDRESS: str = "address"
STREET: str = "street"
CITY: str = "city"
POSTAL: str = "postal"
VAT: str = "vat"
DIRECTOR: str = "director"


class Employer:
    def __init__(self, *args, **kwargs) -> None:
        if kwargs:
            self.__company_name = kwargs[COMPANY_NAME]
            self.__street = kwargs[STREET]
            self.__city = kwargs[CITY]
            self.__postal = kwargs[POSTAL]
            self.__vat = kwargs[VAT]
            self.__director = kwargs[DIRECTOR]
        else:
            self.__company_name = args[0][COMPANY_NAME]
            self.__street = args[0][ADDRESS][STREET]
            self.__city = args[0][ADDRESS][CITY]
            self.__postal = args[0][ADDRESS][POSTAL]
            self.__vat = args[0][VAT]
            self.__director = args[0][DIRECTOR]

    @property
    def company_name(self) -> str:
        return self.__company_name

    @company_name.setter
    def company_name(self, new_name: str) -> None:
        self.__company_name = new_name

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
    def vat(self) -> str:
        return self.__vat

    @vat.setter
    def vat(self, new_vat: str) -> None:
        self.__vat = new_vat

    @property
    def director(self) -> str:
        return self.__director

    @director.setter
    def director(self, new_director) -> None:
        self.__director = new_director

    def __str__(self) -> str:
        return f"{self.__company_name}, {self.__street}, {self.__postal} {self.__city}, OIB: {self.__vat}, Odgovorna osoba: {self.__director}"

    def __eq__(self, other: Any) -> Union[bool, None]:
        if other == None:
            return None
        if (
            self.__company_name == other.company_name
            and self.__street == other.street
            and self.__city == other.city
            and self.__postal == other.postal
            and self.__vat == other.vat
            and self.__director == other.director
        ):
            return True
        return False
