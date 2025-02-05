import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService, Device, DashboardStats } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  devices: Device[] = [];
  selectedDevice: string = '';
  dateRange: string = 'daily';
  chart: any;
  currentDate: string = '';
  currentTime: string = '';
  totalDevices: number = 0;
  totalSensore: number = 0;
  sensorData: any[] = [];
  autoUpdateInterval: any;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
    this.getDevices();
    this.fetchDashboardStats();

    setTimeout(() => {
      if (this.devices.length > 0) {
        this.selectedDevice = this.devices[0].name;
        this.fetchData();
      }
    }, 1000);

    this.autoUpdateInterval = setInterval(() => {
      this.fetchData();
      this.fetchDashboardStats();
    }, 5000); // Update every 60 seconds
  }

  fetchDashboardStats(): void {
    this.authService.getDashboardStats().subscribe(
      (stats) => {
        this.totalDevices = stats.totalDevices;
        this.totalSensore = stats.totalSensore;
      },
      (error) => {
        console.error('Error fetching dashboard stats:', error);
      }
    );
  }

  getDevices(): void {
    this.authService.getDevices().subscribe(
      (devices) => {
        this.devices = devices;
      },
      (error) => {
        console.error('Error fetching devices:', error);
      }
    );
  }

  fetchData(): void {
    if (!this.selectedDevice || !this.dateRange) {
      alert('Please select a device and date range.');
      return;
    }

    this.authService.getReportData(this.selectedDevice, this.dateRange).subscribe(
      (data) => {
        this.sensorData = data;
        this.updateChart(data);
      },
      (error) => {
        console.error('Error fetching report data:', error);
      }
    );
  }

  updateChart(data: any[]): void {
    if (!this.chart) {
      this.initializeChart(data);
      return;
    }
  
    let labels: string[] = [];
    let values: number[] = [];
  
    if (this.dateRange === 'daily') {
      // Direct mapping for daily data
      labels = data.map(entry => this.formatDateTime(entry.timestamp));
      values = data.map(entry => entry.value);
    } 
    else if (this.dateRange === 'weekly') {
      // Grouping data by day of the week
      let weeklyData: { [key: string]: number[] } = {};
  
      data.forEach(entry => {
        const day = this.formatDateTime(entry.timestamp); // "Mon", "Tue", etc.
        if (!weeklyData[day]) {
          weeklyData[day] = [];
        }
        weeklyData[day].push(entry.value);
      });
  
      labels = Object.keys(weeklyData);
      values = labels.map(day => 
        weeklyData[day].reduce((sum, val) => sum + val, 0) / weeklyData[day].length // Average per day
      );
    } 
    else if (this.dateRange === 'monthly') {
      // Grouping data by month
      let monthlyData: { [key: string]: number[] } = {};
  
      data.forEach(entry => {
        const month = this.formatDateTime(entry.timestamp); // "Jan", "Feb", etc.
        if (!monthlyData[month]) {
          monthlyData[month] = [];
        }
        monthlyData[month].push(entry.value);
      });
  
      labels = Object.keys(monthlyData);
      values = labels.map(month => 
        monthlyData[month].reduce((sum, val) => sum + val, 0) / monthlyData[month].length // Average per month
      );
    }
  
    // Update chart
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = values;
    this.chart.update();
  }
  

  initializeChart(data: any[]): void {
    const labels = data.map(entry => this.formatDateTime(entry.timestamp));
    const values = data.map(entry => entry.value);
  
    const ctx = document.getElementById('chartCanvas') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Live Sensor Data',
            data: values,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)', //  Light fill under line
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4, //  Makes the line smooth
            fill: true, //  Enables area fill
          },
        ],
      },
      options: {
        responsive: true,
        animation: {
          duration: 500,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date / Time',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Value',
            },
            beginAtZero: true, // Ensures chart starts from zero
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
      },
    });
  }
  
  ngOnDestroy(): void {
    clearInterval(this.autoUpdateInterval);
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDate = this.formatDate(now);
    this.currentTime = this.formatTime(now);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB'); // Formats as DD/MM/YYYY
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }); // Formats as HH:MM:SS AM/PM
  }

  formatDateTime(timestamp: string): string {
    const date = new Date(timestamp);
  
    if (this.dateRange === 'daily') {
      return `${date.toLocaleDateString('en-GB')}, ${this.formatTime(date)}`; // DD/MM/YYYY, HH:MM:SS
    } 
    else if (this.dateRange === 'weekly') {
      return date.toLocaleDateString(undefined, { weekday: 'short' }); // Mon, Tue, Wed...
    } 
    else if (this.dateRange === 'monthly') {
      return date.toLocaleDateString(undefined, { month: 'short' }); // Jan, Feb, Mar...
    }
  
    return date.toISOString();
  }
  
  
}
