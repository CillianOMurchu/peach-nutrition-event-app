import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  combineLatest,
  startWith,
  map,
  BehaviorSubject,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SaleRecord, SalesService } from './services/sales.service';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProductsMenuComponent } from './components/products-menu/products-menu.component';
import { ProductModel } from './models/product.model';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatBadgeModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    ProductsMenuComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  products$!: Observable<ProductModel[]>; // all products from JSON
  filteredOptions$!: Observable<ProductModel[]>; // for autocomplete
  filteredProducts$!: Observable<ProductModel[]>; // for displayed cards

  searchControl = new FormControl('');

  totalProducts: ProductModel[] = [];

  sortDirection$ = new BehaviorSubject<'asc' | 'desc'>('desc'); // default Low→High

  private dailySales: SaleRecord[] = [];

  constructor(
    private http: HttpClient,
    private salesService: SalesService,
  ) {
    const stored = localStorage.getItem('dailySales');
    this.dailySales = stored ? JSON.parse(stored) : [];
  }

  ngOnInit() {
    // Load products from JSON
    this.products$ = this.http
      .get<ProductModel[]>('/products.json')
      .pipe(
        map((products) =>
          products.sort((a, b) => a.brand.localeCompare(b.brand)),
        ),
      );

    this.products$.subscribe({
      next: (products) => console.log('Products loaded:', products),
      error: (err) => console.error('Failed to load products', err),
    });

    // Filtered products for cards (reactive)
    this.filteredProducts$ = combineLatest([
      this.products$,
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(200), // wait 200ms after typing stops
        distinctUntilChanged(), // only emit if value actually changed
      ),
      this.sortDirection$,
    ]).pipe(
      map(([products, search, sortDirection]) => {
        const term = (search || '').toLowerCase();
        const filtered = products.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term),
        );
        return filtered.sort((a, b) =>
          sortDirection === 'asc' ? a.price - b.price : b.price - a.price,
        );
      }),
    );

    // Filtered options for autocomplete (reactive)
    this.filteredOptions$ = this.filteredProducts$; // use same filtered products

    // Load totalProducts from localStorage if available
    this.totalProducts = this.loadProducts();
  }

  // Compute products grouped by brand
  get groupedProducts() {
    const groups: Record<string, ProductModel[]> = {};
    for (const product of this.totalProducts) {
      if (!groups[product.brand]) groups[product.brand] = [];
      groups[product.brand].push(product);
    }
    return groups;
  }

  changeSort(direction: 'asc' | 'desc') {
    this.sortDirection$.next(direction);
  }

  getBrandKeys() {
    return Object.keys(this.groupedProducts);
  }

  getProductQuantity(product: ProductModel): number {
    const found = this.totalProducts.find((p) => p.name === product.name);
    return found ? found.quantity : 0;
  }

  loadProducts(): ProductModel[] {
    const data = localStorage.getItem('totalProducts');
    return data ? JSON.parse(data) : [];
  }

  trackByName(index: number, product: ProductModel) {
    return product.name; // or product.id if you have one
  }

  increaseQuantity(product: ProductModel) {
    const existing = this.totalProducts.find((p) => p.name === product.name);

    if (existing) {
      // create a new object reference
      this.totalProducts = this.totalProducts.map((p) =>
        p.name === product.name ? { ...p, quantity: p.quantity + 1 } : p,
      );
    } else {
      this.totalProducts = [...this.totalProducts, { ...product, quantity: 1 }];
    }

    this.saveToLocalStorage();
  }

  decreaseQuantity(product: ProductModel) {
    const existing = this.totalProducts.find((p) => p.name === product.name);

    if (existing) {
      if (existing.quantity > 1) {
        // create a new object reference
        this.totalProducts = this.totalProducts.map((p) =>
          p.name === product.name ? { ...p, quantity: p.quantity - 1 } : p,
        );
      } else {
        // Remove product if quantity is 1
        this.totalProducts = this.totalProducts.filter(
          (p) => p.name !== product.name,
        );
      }
      this.saveToLocalStorage();
    }
  }

  getBrandSubtotal(brand: string): number {
    const products = this.groupedProducts[brand] || [];
    return products.reduce((total, product) => {
      const quantity = this.getProductQuantity(product);
      return total + product.price * quantity;
    }, 0);
  }

  getTotalPrice(product: ProductModel): number {
    const existing = this.totalProducts.find((p) => p.name === product.name);
    return existing ? existing.price * existing.quantity : 0;
  }

  getTotalPriceFinal(): number {
    return this.totalProducts.reduce((total, product) => {
      return total + product.price * product.quantity;
    }, 0);
  }

  clearSearchForm() {
    this.searchControl.setValue('');
  }

  saveToLocalStorage() {
    localStorage.setItem('totalProducts', JSON.stringify(this.totalProducts));
  }

  resetQuantities() {
    this.totalProducts = [];
    localStorage.removeItem('totalProducts');
  }

  addToSales() {
    if (confirm('Are you sure you want to add this sale?')) {
      if (this.totalProducts.length === 0) return;

      // Record the sale
      this.salesService.recordSale(this.totalProducts);

      console.log('Added to daily sales:', this.totalProducts);

      // Optional: clear selected products after adding
      this.totalProducts = [];
      localStorage.removeItem('totalProducts');
    }
  }

  exportSales() {
    this.salesService.exportDailySales();
  }

  resetDailySales() {
    if (confirm('Are you sure you want to reset daily sales?')) {
      this.salesService.resetDailySales();
      this.dailySales = [];
      console.log('Daily sales have been reset.');
    }
  }
}
