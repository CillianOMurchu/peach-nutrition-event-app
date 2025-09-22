import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ProductModel } from '@app/models/product.model';
import { BrandLogos } from '@app/models/product.model';

@Component({
  selector: 'app-products-menu',
  imports: [CommonModule],
  templateUrl: './products-menu.component.html',
  styleUrl: './products-menu.component.scss',
})
export class ProductsMenuComponent {
  @Input() products: ProductModel[] = [];

  selectedBrand: string | null = null; // null = show all

  setBrand(brand: string | null) {
    this.selectedBrand = brand;
  }

  // Function to safely get the logo URL
  getBrandLogo(brandName: string): string {
    if (!brandName) return 'https://yourcdn.com/images/default-logo.png';

    const normalizedBrand = brandName.trim().toUpperCase();
    return (
      BrandLogos[normalizedBrand as keyof typeof BrandLogos] ||
      'https://yourcdn.com/images/default-logo.png'
    );
  }

  // get sortedByBrand() {
  //   return (
  //     this.products
  //       // Only include IO.Genix products
  //       .filter((product) => product.brand.toLowerCase() === 'iogenix')
  //       .reduce(
  //         (acc, product) => {
  //           const brandGroup = acc.find((g) => g.brand === product.brand);
  //           if (brandGroup) {
  //             brandGroup.products.push(product);
  //           } else {
  //             acc.push({ brand: product.brand, products: [product] });
  //           }
  //           return acc;
  //         },
  //         [] as { brand: string; products: ProductModel[] }[],
  //       )
  //   );
  // }
  get sortedByBrand() {
    // Filter by selected brand (if chosen)
    const filtered = this.selectedBrand
      ? this.products.filter(
          (p) =>
            p.brand.replace('.', '').toLowerCase() ===
            this.selectedBrand!.toLowerCase(),
        )
      : this.products;

    // Group by brand
    return filtered.reduce(
      (acc, product) => {
        const group = acc.find((g) => g.brand === product.brand);
        if (group) {
          group.products.push(product);
        } else {
          acc.push({ brand: product.brand, products: [product] });
        }
        return acc;
      },
      [] as { brand: string; products: ProductModel[] }[],
    );
  }
}
