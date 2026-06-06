from sqlalchemy import Column, Integer, String, Float, Date, UniqueConstraint
from database import Base


class CurrencyRate(Base):
    __tablename__ = "currency_rates"

    id = Column(Integer, primary_key=True, index=True)
    currency_code = Column(String(10), nullable=False)
    currency_name = Column(String(100), nullable=False)
    mid_rate = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    __table_args__ = (UniqueConstraint("currency_code", "date", name="uq_currency_date"),)
