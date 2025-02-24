import { Component, OnInit } from '@angular/core';
import { AuthService, Device } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  devices: Device[] = [];
  selectedDeviceName: string = '';
  selectedDevice: Device | null = null; // Stores the selected device details
  dateRange: string = '';
  reportData: any[] = [];
  reportDataForCurrentPage: any[] = []; // Define this property
  reportGenerated: boolean = false;
  currentPage: number = 1;
  pageSize: number = 15;
  totalPages: number = 1;

  constructor(private deviceService: AuthService,  private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.fetchDevices();
  }

  fetchDevices(): void {
    this.deviceService.getDevices().subscribe({
      next: (data: Device[]) => {
        this.devices = data.map(device => ({
          ...device,
          created_at: new Date(device.created_at).toISOString(),
          updated_at: new Date(device.updated_at).toISOString(),
        }));
      },
      error: (err) => {
        console.error('Error fetching devices: ', err);
      },
    });
  }

  generateReport(): void {
    this.selectedDevice = this.devices.find(device => device.name === this.selectedDeviceName) || null;
  
    if (this.selectedDeviceName && this.dateRange) {
      this.reportGenerated = true;
      console.log('Report Generated for:', this.selectedDeviceName, 'Date Range:', this.dateRange);
      
      // Show success snackbar when the request starts
      this.snackBar.open('Generating report...', 'Close', { duration: 2000 });
    }
  
    this.deviceService.getReportData(this.selectedDeviceName, this.dateRange).subscribe({
      next: (data: any[]) => {
        this.reportData = data;
        this.totalPages = Math.ceil(this.reportData.length / this.pageSize); // Calculate total pages
        this.currentPage = 1; // Set to page 1 initially
        this.updatePageData(); // Update the first page data
        // Show success snackbar when the report is loaded
        this.snackBar.open('Report generated successfully!', 'Close', { duration: 3000, panelClass: ['snackbar-success'] });
      },
      error: (err) => {
        console.error('Error generating report: ', err);
  
        // Show error snackbar if something goes wrong
        this.snackBar.open('Error generating report. Please try again.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
      },
    });
  }

  showSnackbar(message: string, panelClass: string) {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      panelClass: [panelClass],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  goToPage(page: number, event: Event): void {
    event.preventDefault(); // Prevent default link behavior
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePageData();
  }

  updatePageData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.reportDataForCurrentPage = this.reportData.slice(startIndex, endIndex); // Assign the paginated data
  }

  downloadReport(format: 'csv' | 'pdf'): void {
    console.log(`Downloading report as ${format.toUpperCase()}...`);
    if (this.reportData.length === 0) {
      alert('No data available to download.');
      return;
    }
    if (format === 'csv') {
      this.downloadCSV();
    } else {
      this.downloadPDF();
    }
  }

   // download pdf
   downloadPDF(): void {
    if (!this.selectedDevice) return;
  
    const doc = new jsPDF();
    doc.setFontSize(12);
  
    // **Updated Title to Include Date Range**
    const reportTitle = `Device Report (${this.dateRange})`; // Updated Title
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle, 15, 15); // Show Title with Date Range
    doc.setFont('helvetica', 'normal');
  
    // **Device Details**
    const deviceDetails = [
      [`Device ID: ${this.selectedDevice.id}`, `Device Name: ${this.selectedDevice.name}`, `Device Type: ${this.selectedDevice.type}`],
      [`Last Reading: ${this.selectedDevice.last_reading?.value || 'N/A'}`, `Created At: ${new Date(this.selectedDevice.created_at).toLocaleString()}`, `Updated At: ${new Date(this.selectedDevice.updated_at).toLocaleString()}`]
    ];
  
    let yPosition = 25;
    deviceDetails.forEach((column, columnIndex) => {
      column.forEach((detail, rowIndex) => {
        const xPosition = columnIndex === 0 ? 15 : 105; // First column starts at 15, second column at 105
        doc.text(detail, xPosition, yPosition + (rowIndex * 7));
      });
    });
  
    yPosition += 25; // Move down before the table
  
    // **Sensor Data Table**
    const columns = ['Sr. No', 'Timestamp', 'Device Name', 'Device Type', 'Value'];
    const rows: any[] = [];
  
    this.reportData.forEach((data: any, index: number) => {
      rows.push([
        index + 1,
        new Date(data.timestamp).toLocaleString(),
        this.selectedDevice?.name,
        this.selectedDevice?.type,
        data.value
      ]);
    });
  
    (doc as any).autoTable({
      startY: yPosition,
      head: [columns],
      body: rows,
      theme: 'striped',
      styles: { fontSize: 10, halign: 'center' },
      headStyles: { fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
    });
  
    // **Updated File Name**
    const fileName = `report_${this.selectedDevice.name}_${this.dateRange}.pdf`;
    doc.save(fileName);
  }

  // download csv
  downloadCSV(): void {
    if (!this.selectedDevice) {
      this.snackBar.open('No device selected!', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
      return;
    }
  
    const csvRows: string[] = [];
  
    // **Updated Title with Date Range**
    csvRows.push(`Device Report (${this.dateRange})`);
    csvRows.push('');
  
    // **Device Details**
    csvRows.push(`Device ID:,${this.selectedDevice?.id || 'N/A'}`);
    csvRows.push(`Device Name:,${this.selectedDevice?.name || 'N/A'}`);
    csvRows.push(`Device Type:,${this.selectedDevice?.type || 'N/A'}`);
    csvRows.push(`Last Reading:,${this.selectedDevice?.last_reading?.value || 'N/A'}`);
    csvRows.push(`Created At:,${this.selectedDevice?.created_at ? new Date(this.selectedDevice.created_at).toLocaleString() : 'N/A'}`);
    csvRows.push(`Updated At:,${this.selectedDevice?.updated_at ? new Date(this.selectedDevice.updated_at).toLocaleString() : 'N/A'}`);
    csvRows.push('');
  
    // **Table Headers**
    csvRows.push('Sr. No,Timestamp,Device Name,Device Type,Value');
  
    // **Sensor Data**
    this.reportData.forEach((data: any, index: number) => {
      const row = [
        index + 1,
        new Date(data.timestamp).toLocaleString(),
        this.selectedDevice?.name || 'N/A',
        this.selectedDevice?.type || 'N/A',
        data.value
      ];
      csvRows.push(row.join(','));
    });
  
    // **Create CSV File**
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
  
    // **Updated File Name**
    const fileName = `report_${this.selectedDevice?.name || 'Device'}_${this.dateRange}.csv`;
  
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
