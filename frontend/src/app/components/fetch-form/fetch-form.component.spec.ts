import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FetchFormComponent } from './fetch-form.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CurrencyService } from '../../services/currency.service';
import { of, throwError } from 'rxjs';

describe('FetchFormComponent', () => {
  let component: FetchFormComponent;
  let fixture: ComponentFixture<FetchFormComponent>;
  let currencyServiceSpy: jasmine.SpyObj<CurrencyService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CurrencyService', ['fetchFromNbp']);

    await TestBed.configureTestingModule({
      imports: [FetchFormComponent, HttpClientTestingModule],
      providers: [{ provide: CurrencyService, useValue: spy }],
    }).compileComponents();

    currencyServiceSpy = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    fixture = TestBed.createComponent(FetchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when dates are empty', () => {
    component.startDate = '';
    component.endDate = '';
    component.onFetch();
    expect(component.message).toBe('Podaj obie daty.');
    expect(component.isError).toBeTrue();
  });

  it('should show error when start date is after end date', () => {
    component.startDate = '2024-05-10';
    component.endDate = '2024-01-01';
    component.onFetch();
    expect(component.isError).toBeTrue();
  });

  it('should call fetchFromNbp with correct dates', () => {
    currencyServiceSpy.fetchFromNbp.and.returnValue(of({ fetched: 34, saved: 34 }));
    component.startDate = '2024-01-02';
    component.endDate = '2024-01-05';
    component.onFetch();
    expect(currencyServiceSpy.fetchFromNbp).toHaveBeenCalledWith({
      start_date: '2024-01-02',
      end_date: '2024-01-05',
    });
  });

  it('should display success message after fetch', () => {
    currencyServiceSpy.fetchFromNbp.and.returnValue(of({ fetched: 10, saved: 8 }));
    component.startDate = '2024-01-02';
    component.endDate = '2024-01-03';
    component.onFetch();
    expect(component.message).toContain('10');
    expect(component.isError).toBeFalse();
  });

  it('should display error message when fetch fails', () => {
    currencyServiceSpy.fetchFromNbp.and.returnValue(throwError(() => new Error('Network error')));
    component.startDate = '2024-01-02';
    component.endDate = '2024-01-03';
    component.onFetch();
    expect(component.isError).toBeTrue();
    expect(component.message).toContain('Błąd');
  });

  it('should render fetch button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.btn-fetch');
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toBe('Pobierz dane');
  });
});
