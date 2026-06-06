import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CurrencyService } from './currency.service';
import { CurrencyRate, FetchResponse } from '../models/currency-rate.model';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CurrencyService],
    });
    service = TestBed.inject(CurrencyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch currencies list', () => {
    const mockRates: CurrencyRate[] = [
      { id: 1, currency_code: 'USD', currency_name: 'dolar amerykański', mid_rate: 4.05, date: '2024-01-02' },
    ];

    service.getCurrencies({}).subscribe(rates => {
      expect(rates.length).toBe(1);
      expect(rates[0].currency_code).toBe('USD');
    });

    const req = httpMock.expectOne('http://localhost:8000/currencies');
    expect(req.request.method).toBe('GET');
    req.flush(mockRates);
  });

  it('should fetch currencies filtered by year', () => {
    service.getCurrencies({ year: 2024 }).subscribe();
    const req = httpMock.expectOne(r => r.url === 'http://localhost:8000/currencies' && r.params.get('year') === '2024');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should fetch currencies by date', () => {
    const mockRates: CurrencyRate[] = [
      { id: 1, currency_code: 'EUR', currency_name: 'euro', mid_rate: 4.25, date: '2024-03-01' },
    ];

    service.getCurrenciesByDate('2024-03-01').subscribe(rates => {
      expect(rates[0].currency_code).toBe('EUR');
    });

    const req = httpMock.expectOne('http://localhost:8000/currencies/2024-03-01');
    expect(req.request.method).toBe('GET');
    req.flush(mockRates);
  });

  it('should post fetch request to NBP', () => {
    const mockResponse: FetchResponse = { fetched: 34, saved: 34 };

    service.fetchFromNbp({ start_date: '2024-01-02', end_date: '2024-01-02' }).subscribe(res => {
      expect(res.fetched).toBe(34);
      expect(res.saved).toBe(34);
    });

    const req = httpMock.expectOne('http://localhost:8000/currencies/fetch');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.start_date).toBe('2024-01-02');
    req.flush(mockResponse);
  });
});
