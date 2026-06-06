import httpx
from datetime import date

NBP_BASE = "https://api.nbp.pl/api/exchangerates"


def fetch_rates_for_range(start_date: date, end_date: date, table: str = "A") -> list[dict]:
    url = f"{NBP_BASE}/tables/{table}/{start_date}/{end_date}/?format=json"
    with httpx.Client(timeout=30) as client:
        response = client.get(url)
        response.raise_for_status()
    data = response.json()
    records = []
    for day_entry in data:
        effective_date = day_entry["effectiveDate"]
        for rate in day_entry["rates"]:
            records.append({
                "currency_code": rate["code"],
                "currency_name": rate["currency"],
                "mid_rate": rate["mid"],
                "date": effective_date,
            })
    return records
