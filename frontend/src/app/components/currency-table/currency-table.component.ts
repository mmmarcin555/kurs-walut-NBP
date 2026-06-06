import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../services/currency.service';
import { CurrencyRate } from '../../models/currency-rate.model';

type ViewMode = 'year' | 'quarter' | 'month' | 'day';

@Component({
  selector: 'app-currency-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currency-table.component.html',
  styleUrls: ['./currency-table.component.css'],
})
export class CurrencyTableComponent implements OnInit {
  rates: CurrencyRate[] = [];
  filteredRates: CurrencyRate[] = [];
  loading = false;
  error = '';

  viewMode: ViewMode = 'month';
  selectedYear: number = new Date().getFullYear();
  selectedQuarter: number = 1;
  selectedMonth: number = new Date().getMonth() + 1;
  selectedDate: string = '';
  selectedCurrencyCode: string = '';

  years: number[] = [];
  quarters = [1, 2, 3, 4];
  months = [
    { value: 1, label: 'Styczeń' },
    { value: 2, label: 'Luty' },
    { value: 3, label: 'Marzec' },
    { value: 4, label: 'Kwiecień' },
    { value: 5, label: 'Maj' },
    { value: 6, label: 'Czerwiec' },
    { value: 7, label: 'Lipiec' },
    { value: 8, label: 'Sierpień' },
    { value: 9, label: 'Wrzesień' },
    { value: 10, label: 'Październik' },
    { value: 11, label: 'Listopad' },
    { value: 12, label: 'Grudzień' },
  ];

  constructor(private currencyService: CurrencyService) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 2020; y--) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    if (this.viewMode === 'day' && this.selectedDate) {
      this.currencyService.getCurrenciesByDate(this.selectedDate).subscribe({
        next: data => {
          this.rates = data;
          this.applyFilter();
          this.loading = false;
        },
        error: () => {
          this.error = 'Brak danych dla wybranej daty.';
          this.rates = [];
          this.filteredRates = [];
          this.loading = false;
        },
      });
      return;
    }

    const filters: Record<string, number | string> = { year: this.selectedYear };
    if (this.viewMode === 'quarter') filters['quarter'] = this.selectedQuarter;
    if (this.viewMode === 'month') filters['month'] = this.selectedMonth;
    if (this.selectedCurrencyCode) filters['currency_code'] = this.selectedCurrencyCode;

    this.currencyService.getCurrencies(filters as any).subscribe({
      next: data => {
        this.rates = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Błąd podczas ładowania danych.';
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    if (this.selectedCurrencyCode) {
      this.filteredRates = this.rates.filter(
        r => r.currency_code === this.selectedCurrencyCode.toUpperCase()
      );
    } else {
      this.filteredRates = [...this.rates];
    }
  }

  getQuarterLabel(q: number): string {
    return `Q${q}`;
  }

  trackByRate(index: number, rate: CurrencyRate): number {
    return rate.id;
  }
}
