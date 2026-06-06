import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyTableComponent } from './currency-table.component';
import { CurrencyService } from '../../services/currency.service';
import { of, throwError } from 'rxjs';
import { CurrencyRate } from '../../models/currency-rate.model';

const mockRates: CurrencyRate[] = [
  { id: 1, currency_code: 'USD', currency_name: 'dolar amerykański', mid_rate: 4.05, date: '2024-03-01' },
  { id: 2, currency_code: 'EUR', currency_name: 'euro', mid_rate: 4.25, date: '2024-03-01' },
];

describe('CurrencyTableComponent', () => {
  let component: CurrencyTableComponent;
  let fixture: ComponentFixture<CurrencyTableComponent>;
  let currencyServiceSpy: jasmine.SpyObj<CurrencyService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CurrencyService', ['getCurrencies', 'getCurrenciesByDate']);
    spy.getCurrencies.and.returnValue(of(mockRates));

    await TestBed.configureTestingModule({
      imports: [CurrencyTableComponent],
      providers: [{ provide: CurrencyService, useValue: spy }],
    }).compileComponents();

    currencyServiceSpy = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    fixture = TestBed.createComponent(CurrencyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    expect(currencyServiceSpy.getCurrencies).toHaveBeenCalled();
    expect(component.rates.length).toBe(2);
  });

  it('should display all rates in table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should filter rates by currency code', () => {
    component.selectedCurrencyCode = 'USD';
    component.applyFilter();
    expect(component.filteredRates.length).toBe(1);
    expect(component.filteredRates[0].currency_code).toBe('USD');
  });

  it('should show all rates when currency filter is cleared', () => {
    component.selectedCurrencyCode = '';
    component.applyFilter();
    expect(component.filteredRates.length).toBe(2);
  });

  it('should change view mode and reload data', () => {
    component.setViewMode('year');
    expect(component.viewMode).toBe('year');
    expect(currencyServiceSpy.getCurrencies).toHaveBeenCalledTimes(2);
  });

  it('should show error message on load failure', () => {
    currencyServiceSpy.getCurrencies.and.returnValue(throwError(() => new Error('error')));
    component.loadData();
    expect(component.error).toBeTruthy();
  });

  it('should use getCurrenciesByDate when viewMode is day', () => {
    currencyServiceSpy.getCurrenciesByDate.and.returnValue(of(mockRates));
    component.viewMode = 'day';
    component.selectedDate = '2024-03-01';
    component.loadData();
    expect(currencyServiceSpy.getCurrenciesByDate).toHaveBeenCalledWith('2024-03-01');
  });

  it('should display record count', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const count = compiled.querySelector('.record-count');
    expect(count?.textContent).toContain('2');
  });
});
