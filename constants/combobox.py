from typing import Dict, List

READ_ONLY: str = "readonly"

COMBOBOX_SELECTED_EVENT: str = "<<ComboboxSelected>>"

TRAIL_OPTIONS: List[str] = ["dan/a", "mjesec/a/i"]

NUMBERS_1_TO_12: List[str] = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
]

NUMBERS_1_TO_30: List[str] = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
]

TRAIL: Dict = {TRAIL_OPTIONS[0]: NUMBERS_1_TO_30, TRAIL_OPTIONS[1]: NUMBERS_1_TO_12}

WORK_TIME_TYPE: List[str] = ["puno", "ne puno"]

WORK_TIME_SHIFT: List[str] = ["jednokratno", "dvokratno", "klizno", "prema opisu"]

WEEKLY_TIME_OFF: List[str] = ["subota", "nedjelja", "subota i nedjelja", "nedjelja i ponedjeljak", "petak i subota"]

VACATION: List[str] = [
    "-",
    "1 dan",
    "2 dana",
    "3 dana",
    "4 dana",
    "5 dana",
    "6 dana",
    "8 dana",
    "9 dana",
    "10 dana",
    "11 dana",
    "12 dana",
    "13 dana",
    "1 tjedan",
    "2 tjedna",
    "3 tjedna",
    "4 tjedna",
    "5 tjedana",
    "6 tjedana",
]

CONTRACT_TERMINATION: List[str] = ["mogu", "ne mogu"]

COURTS: List[str] = [
    "Bjelovaru",
    "Dubrovniku",
    "Karlovcu",
    "Osijeku",
    "Puli",
    "Rijeci",
    "Sisku",
    "Slavonskom Brodu",
    "Splitu",
    "Šibeniku",
    "Varaždinu",
    "Velikoj Gorici",
    "Vukovaru",
    "Zadru",
    "Zagrebu",
]
