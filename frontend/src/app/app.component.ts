import { Component } from '@angular/core';
import { CurrencyTableComponent } from './components/currency-table/currency-table.component';
import { FetchFormComponent } from './components/fetch-form/fetch-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CurrencyTableComponent, FetchFormComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Kursy Walut NBP';
  today = new Date().toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
