import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsMenuComponent } from './products-menu.component';

describe('ProductsMenuComponent', () => {
  let component: ProductsMenuComponent;
  let fixture: ComponentFixture<ProductsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
