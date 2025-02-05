import { Component, OnInit } from '@angular/core';
import { AuthService, Device } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as FileSaver from 'file-saver';

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
  reportGenerated: boolean = false;
  constructor(private deviceService: AuthService) {}

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
    }

    this.deviceService.getReportData(this.selectedDeviceName, this.dateRange).subscribe({
      next: (data: any[]) => {
        this.reportData = data;
        console.log('Report Data:', this.reportData);
      },
      error: (err) => {
        console.error('Error generating report: ', err);
      },
    });
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
  
  downloadCSV(): void {
    if (!this.selectedDevice) return;
  
    let csvData = `Sr. No,Timestamp,Device Name,Device Type,Value\n`;
  
    this.reportData.forEach((row, index) => {
      csvData += `${index + 1},${new Date(row.timestamp).toLocaleString()},${this.selectedDevice?.name},${this.selectedDevice?.type},${row.value}\n`;
    });
  
    const blob = new Blob([csvData], { type: 'text/csv' });
    FileSaver.saveAs(blob, `report_${this.selectedDevice.name}.csv`);
  }
  
  
  downloadPDF(): void {
    if (!this.selectedDevice) return;
  
    const doc = new jsPDF();
    doc.setFontSize(12);
  
    // **Header**
    doc.setFont('helvetica', 'bold');
    doc.text(`Device Report`, 15, 15);
    doc.setFont('helvetica', 'normal');
  
    doc.text(`Device Name: ${this.selectedDevice.name}`, 15, 25);
    doc.text(`Device Type: ${this.selectedDevice.type}`, 15, 30);
    doc.text(`Last Reading: ${this.selectedDevice.last_reading?.value || 'N/A'}`, 15, 35);
    doc.text(`Created At: ${new Date(this.selectedDevice.created_at).toLocaleString()}`, 15, 40);
    doc.text(`Updated At: ${new Date(this.selectedDevice.updated_at).toLocaleString()}`, 15, 45);
  
    // **Sensor Data Table with Sr. No, Timestamp, Device Name, Type, and Value**
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
      startY: 50,
      head: [columns],
      body: rows,
      theme: 'striped',
      styles: { fontSize: 10 },
    });
  
    doc.save(`report_${this.selectedDevice.name}.pdf`);
  }
  
  
}
