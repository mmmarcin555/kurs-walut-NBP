from pydantic import BaseModel
from datetime import date
from typing import Optional


class CurrencyRateOut(BaseModel):
    id: int
    currency_code: str
    currency_name: str
    mid_rate: float
    date: date

    class Config:
        from_attributes = True


class FetchRequest(BaseModel):
    start_date: date
    end_date: date
    table: Optional[str] = "A"
