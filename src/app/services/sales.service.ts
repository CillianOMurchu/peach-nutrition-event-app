import { Injectable } from '@angular/core';

export interface Product {
  brand: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface SaleRecord extends Product {
  total: number;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private dailySales: SaleRecord[] = [];

  constructor() {
    const stored = localStorage.getItem('dailySales');
    this.dailySales = stored ? JSON.parse(stored) : [];
  }

  recordSale(products: Product[]) {
    const now = new Date();
    const timestampBarcelona = now
      .toLocaleString('en-GB', {
        timeZone: 'Europe/Madrid',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(',', '');
    const grandTotal = products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0,
    );

    const grandTotalFormatted = `${grandTotal.toFixed(2)} €`;

    // 1️⃣ Add to daily sales (master list)
    products.forEach((product) => {
      this.dailySales.push({
        ...product,
        total: product.price * product.quantity,
        timestamp: timestampBarcelona,
      });
    });
    localStorage.setItem('dailySales', JSON.stringify(this.dailySales));

    const euroFormatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    });

    // 2️⃣ Prepare CSV for this specific sale
    const headers = [
      'Timestamp',
      'Brand',
      'Product Name',
      'Price',
      'Quantity',
      'Total',
    ];
    const rows = products.map((p) => {
      const priceFormatted = `${p.price.toFixed(2)} €`;
      const totalFormatted = `${(p.price * p.quantity).toFixed(2)} €`;
      return [
        timestampBarcelona,
        p.brand,
        p.name,
        priceFormatted,
        p.quantity.toString(), // convert quantity to string
        totalFormatted,
      ];
    });

    // blank row to separate visually
    rows.push(['', '', '', '', '']); // blank row

    rows.push(['', '', '', '', 'GRAND TOTAL', grandTotalFormatted]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((e) => e.join(';')) // Use semicolon instead of comma
        .join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');

    // 3️⃣ Friendly filename: sale_YYYY-MM-DD_HH-MM.csv
    const friendlyFilename = `sale_${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now
      .getHours()
      .toString()
      .padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}.csv`;

    link.setAttribute('href', encodedUri);
    link.setAttribute('download', friendlyFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(
      `Recorded and exported ${products.length} items as ${friendlyFilename}`,
    );
  }

  exportDailySales() {
    if (this.dailySales.length === 0) {
      console.warn('No sales to export.');
      return;
    }

    // Aggregate sales per product
    const aggregated: {
      [key: string]: {
        brand: string;
        name: string;
        price: number;
        quantity: number;
        total: number;
      };
    } = {};

    const grandTotal = this.dailySales.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0,
    );

    const grandTotalFormatted = `${grandTotal.toFixed(2)} €`;

    this.dailySales.forEach((sale) => {
      const key = `${sale.brand}||${sale.name}`;
      if (!aggregated[key]) {
        aggregated[key] = {
          brand: sale.brand,
          name: sale.name,
          price: sale.price,
          quantity: sale.quantity,
          total: sale.total,
        };
      } else {
        aggregated[key].quantity += sale.quantity;
        aggregated[key].total += sale.total;
      }
    });

    const headers = ['Brand', 'Product Name', 'Price', 'Quantity', 'Total'];
    const rows = Object.values(aggregated).map((p) => [
      p.brand,
      p.name,
      p.price.toFixed(2),
      p.quantity,
      p.total.toFixed(2),
    ]);

    // blank row to separate visually
    rows.push(['', '', '', '', '']); // blank row
    rows.push(['', '', '', 'GRAND TOTAL', grandTotalFormatted]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((e) => e.join(';')) // Use semicolon instead of comma
        .join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute(
      'download',
      `daily_sales_${new Date().toLocaleDateString()}.csv`,
    );
    link.setAttribute('href', encodedUri);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`Exported ${rows.length} aggregated products.`);
  }

  resetDailySales() {
    this.dailySales = [];
    localStorage.removeItem('dailySales');
  }
}
