import { TestBed } from '@angular/core/testing';
import { AppComponent, Product } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(), // Provides real HttpClient instance
        provideHttpClientTesting(), // Provides testing controller
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    // Call ngOnInit manually
    spyOn(component, 'loadProducts').and.returnValue([]);
    component.ngOnInit();
  });

  afterEach(() => {
    // Clear localStorage after each test
    localStorage.clear();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should increase quantity of a new product', () => {
    const product: Product = {
      brand: 'Barebells',
      name: 'Salty Peanut',
      image: '',
      price: 1.4,
      quantity: 0,
    };

    // Add product to cart
    component.increaseQuantity(product);

    expect(component.totalProducts.length).toBe(1);
    expect(component.totalProducts[0].quantity).toBe(1);
    expect(component.totalProducts[0].name).toBe('Salty Peanut');
  });

  it('should decrease quantity of an existing product and remove it if quantity is 0', () => {
    const product: Product = {
      brand: 'Barebells',
      name: 'Salty Peanut',
      image: '',
      price: 1.4,
      quantity: 0,
    };

    // Add product twice
    component.increaseQuantity(product);
    component.increaseQuantity(product); // quantity now 2
    expect(component.getProductQuantity(product)).toBe(2);
    // Decrease once
    component.decreaseQuantity(product);
    expect(component.getProductQuantity(product)).toBe(1);

    // Decrease again, should remove product
    component.decreaseQuantity(product);
    expect(component.getProductQuantity(product)).toBe(0);
    expect(component.totalProducts.length).toBe(0);
  });

  it('should group products correctly by brand', () => {
    const product1: Product = {
      brand: 'A',
      name: 'X',
      image: '',
      price: 1,
      quantity: 2,
    };
    const product2: Product = {
      brand: 'A',
      name: 'Y',
      image: '',
      price: 3,
      quantity: 1,
    };
    const product3: Product = {
      brand: 'B',
      name: 'Z',
      image: '',
      price: 2,
      quantity: 4,
    };

    component.totalProducts = [product1, product2, product3];

    const grouped = component.groupedProducts;

    expect(Object.keys(grouped)).toEqual(['A', 'B']);
    expect(grouped['A'].length).toBe(2);
    expect(grouped['B'].length).toBe(1);

    // Optional: check subtotal for brand A
    const subtotalA = grouped['A'].reduce(
      (total, p) => total + p.price * p.quantity,
      0,
    );
    expect(subtotalA).toBe(5); // 2*1 + 1*3
  });

  it('should return the correct total price for all products', () => {
    const product1: Product = {
      brand: 'A',
      name: 'X',
      image: '',
      price: 2,
      quantity: 3,
    };
    const product2: Product = {
      brand: 'B',
      name: 'Y',
      image: '',
      price: 1,
      quantity: 4,
    };

    component.totalProducts = [product1, product2];

    const total = component.getTotalPriceFinal();
    expect(total).toBe(10); // 2*3 + 1*4
  });

  it('should clear the search form correctly', () => {
    component.searchControl.setValue('test search');
    component.clearSearchForm();
    expect(component.searchControl.value).toBe('');
  });

  it('should reset quantities and clear localStorage', () => {
    const product: Product = {
      brand: 'A',
      name: 'X',
      image: '',
      price: 1,
      quantity: 2,
    };
    component.totalProducts = [product];
    component.saveToLocalStorage();

    component.resetQuantities();

    expect(component.totalProducts.length).toBe(0);
    expect(localStorage.getItem('totalProducts')).toBeNull();
  });

  
});
