import { Injectable } from '@angular/core';
import { ProductModel } from '@models/product.model';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  combineLatest,
  startWith,
  map,
  BehaviorSubject,
  of,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  products$!: Observable<ProductModel[]>; // all products from JSON

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Load products from JSON
    this.products$ = this.http
      .get<ProductModel[]>('/products.json')
      .pipe(
        map((products) =>
          (products ?? []).sort((a, b) => a.brand.localeCompare(b.brand)),
        ),
      );

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
        const safeProducts = products ?? []; // ✅ protect against null
        const term = (search || '').toLowerCase();
        const filtered = safeProducts.filter(
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

  get groupedProducts(): Record<string, ProductModel[]> {
    const groups: Record<string, ProductModel[]> = {};
    (this.products || []).forEach((product) => {
      if (!groups[product.brand]) groups[product.brand] = [];
      groups[product.brand].push(product);
    });
    return groups;
  }

  get brandKeys(): string[] {
    return Object.keys(this.groupedProducts);
  }
}
