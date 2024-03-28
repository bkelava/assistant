import locale

locale.setlocale(locale.LC_ALL, "hr_HR.utf8")

locale.currency(
    round(
        (float(sheet.cell(60, 9).value) - float(sheet.cell(60, 8).value)) / (float(sheet.cell(60, 9).value) * 100),
        2,
    ),
    grouping=True,
)[:-3]
