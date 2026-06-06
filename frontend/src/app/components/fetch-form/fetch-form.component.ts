import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-fetch-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fetch-form.component.html',
  styleUrls: ['./fetch-form.component.css'],
})
export class FetchFormComponent {
  startDate = '';
  endDate = '';
  loading = false;
  message = '';
  isError = false;

  constructor(private currencyService: CurrencyService) {}

  onFetch(): void {
    if (!this.startDate || !this.endDate) {
      this.message = 'Podaj obie daty.';
      this.isError = true;
      return;
    }
    if (this.startDate > this.endDate) {
      this.message = 'Data początkowa nie może być późniejsza niż końcowa.';
      this.isError = true;
      return;
    }

    this.loading = true;
    this.message = '';
    this.isError = false;

    this.currencyService
      .fetchFromNbp({ start_date: this.startDate, end_date: this.endDate })
      .subscribe({
        next: res => {
          this.loading = false;
          this.message = `Pobrano ${res.fetched} rekordów, zapisano ${res.saved} nowych.`;
          this.isError = false;
        },
        error: () => {
          this.loading = false;
          this.message = 'Błąd podczas pobierania danych z NBP.';
          this.isError = true;
        },
      });
  }
}
