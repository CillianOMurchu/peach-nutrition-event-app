import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup-form',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './signup-form.component.html',
  styleUrl: './signup-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupFormComponent {
  records: { Name: string; Email: string; Phone: string }[] = [];

  constructor() {
    // 🔄 Load saved data from localStorage on init
    const saved = localStorage.getItem('contacts');
    if (saved) {
      try {
        this.records = JSON.parse(saved);
      } catch {
        console.error('Failed to parse saved contacts');
      }
    }
  }

  saveForm(name: string, email: string, phone: string) {
    console.log('Form Data:', { name, email, phone });
    // ✅ Add new entry
    this.records.push({ Name: name, Email: email, Phone: phone });
    console.log('Updated Records:', this.records);

    // 💾 Persist updated data to localStorage
    localStorage.setItem('contacts', JSON.stringify(this.records));

    // 📊 Convert to worksheet & workbook
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.records);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');

    // 📤 Export as updated Excel file
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      'Soul Market Contacts.xlsx',
    );
  }
}
