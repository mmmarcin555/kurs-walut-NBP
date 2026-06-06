from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional

import models
import schemas
import nbp_client
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Currency Rates API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/currencies", response_model=list[schemas.CurrencyRateOut])
def get_currencies(
    year: Optional[int] = Query(None),
    quarter: Optional[int] = Query(None, ge=1, le=4),
    month: Optional[int] = Query(None, ge=1, le=12),
    day: Optional[int] = Query(None),
    currency_code: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.CurrencyRate)

    if year:
        query = query.filter(
            models.CurrencyRate.date >= date(year, 1, 1),
            models.CurrencyRate.date <= date(year, 12, 31),
        )
    if quarter:
        month_start = (quarter - 1) * 3 + 1
        month_end = quarter * 3
        query = query.filter(
            models.CurrencyRate.date >= date(year or date.today().year, month_start, 1),
            models.CurrencyRate.date <= date(year or date.today().year, month_end, 28),
        )
    if month:
        query = query.filter(
            models.CurrencyRate.date.between(
                date(year or date.today().year, month, 1),
                date(year or date.today().year, month, 28),
            )
        )
    if day:
        query = query.filter(models.CurrencyRate.date == date(year or date.today().year, month or 1, day))
    if currency_code:
        query = query.filter(models.CurrencyRate.currency_code == currency_code.upper())

    return query.order_by(models.CurrencyRate.date.desc()).all()


@app.get("/currencies/{rate_date}", response_model=list[schemas.CurrencyRateOut])
def get_currencies_by_date(rate_date: date, db: Session = Depends(get_db)):
    rates = (
        db.query(models.CurrencyRate)
        .filter(models.CurrencyRate.date == rate_date)
        .all()
    )
    if not rates:
        raise HTTPException(status_code=404, detail="No data for this date")
    return rates


@app.post("/currencies/fetch")
def fetch_currencies(body: schemas.FetchRequest, db: Session = Depends(get_db)):
    try:
        records = nbp_client.fetch_rates_for_range(body.start_date, body.end_date, body.table)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"NBP API error: {exc}")

    saved = 0
    for rec in records:
        exists = (
            db.query(models.CurrencyRate)
            .filter_by(currency_code=rec["currency_code"], date=rec["date"])
            .first()
        )
        if not exists:
            db.add(models.CurrencyRate(**rec))
            saved += 1

    db.commit()
    return {"fetched": len(records), "saved": saved}


@app.get("/health")
def health():
    return {"status": "ok"}
