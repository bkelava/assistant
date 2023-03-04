class Employee:
    def __init__(
        self,
        name: str,
        last_name: str,
        street: str,
        city: str,
        postal: str,
        personal_id: str,
    ) -> None:
        self.__name = name
        self.__last_name = last_name
        self.__street = street
        self.__city = city
        self.__postal = postal
        self.__personal_id = personal_id

    @property
    def name(self) -> str:
        return self.__name

    @name.setter
    def name(self, new_name: str) -> None:
        self.__name = new_name

    @property
    def last_name(self) -> str:
        return self.__last_name

    @last_name.setter
    def last_name(self, new_last_name: str) -> None:
        self.__last_name = new_last_name

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
        return f"{self.__name} {self.__last_name}, {self.__street}, {self.__postal} {self.__city}, OIB/Putovnica: {self.__personal_id}"
