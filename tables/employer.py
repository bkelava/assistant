class Employer:
    def __init__(
        self,
        company_name: str,
        street: str,
        city: str,
        postal: str,
        vat: str,
        director: str,
    ) -> None:
        self.__company_name = company_name
        self.__street = street
        self.__city = city
        self.__postal = postal
        self.__vat = vat
        self.__director = director

    @property
    def company_name(self) -> str:
        return self.__company_name

    @company_name.setter
    def company_name(self, new_name: str) -> None:
        self.__company_name = new_name

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
    def personal_id(self, new_vat: str) -> None:
        self.__vat = new_vat

    @property
    def director(self) -> str:
        return self.__director

    @director.setter
    def director(self, new_director) -> None:
        self.__director = new_director

    def __str__(self) -> str:
        return f"{self.__company_name}, {self.__street}, {self.__postal} {self.__city}, OIB: {self.__vat}, Odgovorna osoba: {self.__director}"
