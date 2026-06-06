import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrencyRate, FetchRequest, FetchResponse } from '../models/currency-rate.model';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private readonly apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getCurrencies(filters: {
    year?: number;
    quarter?: number;
    month?: number;
    currency_code?: string;
  }): Observable<CurrencyRate[]> {
    let params = new HttpParams();
    if (filters.year) params = params.set('year', filters.year);
    if (filters.quarter) params = params.set('quarter', filters.quarter);
    if (filters.month) params = params.set('month', filters.month);
    if (filters.currency_code) params = params.set('currency_code', filters.currency_code);
    return this.http.get<CurrencyRate[]>(`${this.apiUrl}/currencies`, { params });
  }

  getCurrenciesByDate(date: string): Observable<CurrencyRate[]> {
    return this.http.get<CurrencyRate[]>(`${this.apiUrl}/currencies/${date}`);
  }

  fetchFromNbp(request: FetchRequest): Observable<FetchResponse> {
    return this.http.post<FetchResponse>(`${this.apiUrl}/currencies/fetch`, request);
  }
}
