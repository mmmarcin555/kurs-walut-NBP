import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import Base, get_db
import models
from main import app

TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_get_currencies_empty(client):
    response = client.get("/currencies")
    assert response.status_code == 200
    assert response.json() == []


def test_get_currencies_by_date_not_found(client):
    response = client.get("/currencies/2024-01-01")
    assert response.status_code == 404


def test_get_currencies_by_date_found(client):
    db = TestingSession()
    from datetime import date
    rate = models.CurrencyRate(
        currency_code="USD",
        currency_name="dolar amerykański",
        mid_rate=4.05,
        date=date(2024, 1, 2),
    )
    db.add(rate)
    db.commit()
    db.close()

    response = client.get("/currencies/2024-01-02")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["currency_code"] == "USD"
    assert data[0]["mid_rate"] == 4.05


def test_fetch_currencies_saves_data(client):
    from datetime import date as date_type
    mock_records = [
        {
            "currency_code": "EUR",
            "currency_name": "euro",
            "mid_rate": 4.25,
            "date": date_type(2024, 1, 2),
        }
    ]
    with patch("main.nbp_client.fetch_rates_for_range", return_value=mock_records):
        response = client.post(
            "/currencies/fetch",
            json={"start_date": "2024-01-02", "end_date": "2024-01-02"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["fetched"] == 1
    assert data["saved"] == 1


def test_fetch_currencies_nbp_error(client):
    with patch("main.nbp_client.fetch_rates_for_range", side_effect=Exception("timeout")):
        response = client.post(
            "/currencies/fetch",
            json={"start_date": "2024-01-02", "end_date": "2024-01-02"},
        )
    assert response.status_code == 502


def test_get_currencies_filter_by_year(client):
    db = TestingSession()
    from datetime import date
    for d, code in [("2023-06-15", "USD"), ("2024-03-10", "EUR")]:
        db.add(
            models.CurrencyRate(
                currency_code=code,
                currency_name=code,
                mid_rate=4.0,
                date=date.fromisoformat(d),
            )
        )
    db.commit()
    db.close()

    response = client.get("/currencies?year=2023")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["currency_code"] == "USD"
