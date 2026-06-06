export interface CurrencyRate {
  id: number;
  currency_code: string;
  currency_name: string;
  mid_rate: number;
  date: string;
}

export interface FetchRequest {
  start_date: string;
  end_date: string;
  table?: string;
}

export interface FetchResponse {
  fetched: number;
  saved: number;
}
