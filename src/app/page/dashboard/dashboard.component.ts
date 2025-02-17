import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService, Device } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  devices: Device[] = [];
  selectedDevice: string = '';
  dateRange: string = '';
  chart: any;
  currentDate: string = '';
  currentTime: string = '';
  totalDevices: number = 0;
  totalSensore: number = 0;
  sensorData: any[] = [];
  autoUpdateInterval: any;

  constructor(private authService: AuthService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
    this.getDevices();
    this.fetchDashboardStats();

    // Initialize blank chart on load
    setTimeout(() => {
      this.initializeChart([]);
    }, 500);

    this.autoUpdateInterval = setInterval(() => {
      this.fetchData();
      this.fetchDashboardStats();
    }, 5000); // Update every 50 seconds
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
    if (!this.selectedDevice && !this.dateRange) {
      this.showSnackbar('Please select a device type and a date range.');
      return;
    }

    if (!this.selectedDevice) {
      this.showSnackbar('Please select a device type.');
      return;
    }

    if (!this.dateRange) {
      this.showSnackbar('Please select a date range.');
      return;
    }

    this.authService.getReportData(this.selectedDevice, this.dateRange).subscribe(
      (data) => {
        this.sensorData = data;
        this.updateChart(data);
        this.showSnackbar('Chart created successfully!');
      },
      (error) => {
        console.error('Error fetching report data:', error);
        this.showSnackbar('Failed to fetch data. Please try again.');
      }
    );
  }

  // Snackbar function
  showSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // Message disappears after 3 seconds
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-style'] // Custom styling
    });
  }

  initializeChart(data: any[]): void {
    const ctx = document.getElementById('chartCanvas') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy(); // Destroy previous chart instance before creating a new one
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Sensor Data',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true,
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
            beginAtZero: true,
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

    // If there is data, update chart
    if (data.length > 0) {
      this.updateChart(data);
    }
  }

  updateChart(data: any[]): void {
    if (!this.chart) {
      this.initializeChart(data);
      return;
    }

    let labels: string[] = [];
    let values: number[] = [];

    if (this.dateRange === 'daily') {
      labels = data.map(entry => this.formatDateTime(entry.timestamp));
      values = data.map(entry => entry.value);
    }
    else if (this.dateRange === 'weekly') {
      let weeklyData: { [key: string]: number[] } = {};

      data.forEach(entry => {
        const day = this.formatDateTime(entry.timestamp);
        if (!weeklyData[day]) {
          weeklyData[day] = [];
        }
        weeklyData[day].push(entry.value);
      });

      labels = Object.keys(weeklyData);
      values = labels.map(day =>
        weeklyData[day].reduce((sum, val) => sum + val, 0) / weeklyData[day].length
      );
    }
    else if (this.dateRange === 'monthly') {
      let monthlyData: { [key: string]: number[] } = {};

      data.forEach(entry => {
        const month = this.formatDateTime(entry.timestamp);
        if (!monthlyData[month]) {
          monthlyData[month] = [];
        }
        monthlyData[month].push(entry.value);
      });

      labels = Object.keys(monthlyData);
      values = labels.map(month =>
        monthlyData[month].reduce((sum, val) => sum + val, 0) / monthlyData[month].length
      );
    }

    // Update chart data
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = values;
    this.chart.update();
  }

  ngOnDestroy(): void {
    clearInterval(this.autoUpdateInterval);
  }

  formatDateTime(timestamp: string): string {
    const date = new Date(timestamp);

    if (this.dateRange === 'daily') {
      return `${date.toLocaleDateString('en-GB')}, ${this.formatTime(date)}`;
    }
    else if (this.dateRange === 'weekly') {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    }
    else if (this.dateRange === 'monthly') {
      return date.toLocaleDateString(undefined, { month: 'short' });
    }

    return date.toISOString();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB');
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDate = this.formatDate(now);
    this.currentTime = this.formatTime(now);
  }
}
