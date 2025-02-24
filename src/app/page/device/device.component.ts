import { Component, OnInit } from '@angular/core';
import { AuthService, Device } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-device',
  imports: [CommonModule, FormsModule],
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css'],
})
export class DeviceComponent implements OnInit {
  devices: Device[] = [];
  deviceName: string = '';
  deviceType: string = '';
  deviceStatus: string = '';
  currentDeviceId: number | null | undefined = null;
  created_at: string = '';  // Add this
  updated_at: string = '';

  constructor(private deviceService: AuthService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    // Fetch devices on page load
    this.deviceService.getDevices().subscribe((data: Device[]) => {
      this.devices = data;
      console.log('Devices:', this.devices); // Log to ensure devices are being fetched
    });
  }

  // Add or Update device
  // addOrUpdateDevice(): void {
  //   // Check if required fields are filled in
  //   if (!this.deviceName || !this.deviceType) {
  //     console.error('Please fill in all required fields.');
  //     alert('This device add successfully');
  //     return;
  //   }

  //   // Get user ID from localStorage
  //   const storedUser = localStorage.getItem('user');
  //   let userIdNumber: number | null = null;
  //   if (storedUser) {
  //     const user = JSON.parse(storedUser);
  //     userIdNumber = user.id; // Extract the user ID
  //   }

  //   if (!userIdNumber) {
  //     console.error('User ID not found in localStorage.');
  //     return;
  //   }

  //   //  Include user ID in the device object
  //   const newDevice: Device = {
  //     name: this.deviceName,
  //     type: this.deviceType,
  //     user: userIdNumber, // Add user ID here
  //     status: 'Inactive',
  //     last_reading: null,
  //     created_at: this.created_at,  // Add this
  //     updated_at: this.updated_at,
  //   };

  //   if (this.currentDeviceId) {
  //     // If editing, update the device
  //     this.deviceService.updateDevice(this.currentDeviceId, newDevice).subscribe({
  //       next: (device: Device) => {
  //         this.getDevices();
  //         this.clearForm();
  //       },
  //       error: (err) => {
  //         console.error('Error updating device:', err);
  //       },
  //     });
  //   } else {
  //     // If adding, send a POST request
  //     this.deviceService.addDevice(newDevice).subscribe({
  //       next: (device: Device) => {
  //         this.getDevices();
  //         this.clearForm();
  //       },
  //       error: (err) => {
  //         console.error('Error adding device:', err);
  //       },
  //     });
  //   }
  // }
  addOrUpdateDevice(): void {
    // Check if required fields are filled in
    if (!this.deviceName || !this.deviceType) {
      console.error('Please fill in all required fields.');
      alert('This device add successfully');
      return;
    }
  
    // Get user ID from localStorage
    const storedUser = localStorage.getItem('user');
    let userIdNumber: number | null = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      userIdNumber = user.id; // Extract the user ID
    }
  
    if (!userIdNumber) {
      console.error('User ID not found in localStorage.');
      return;
    }
  
    // Include user ID in the device object
    const newDevice: Device = {
      name: this.deviceName,
      type: this.deviceType,
      user: userIdNumber, // Add user ID here
      status: 'Inactive',
      last_reading: null,
      created_at: this.created_at,  // Add this
      updated_at: this.updated_at,
    };
  
    if (this.currentDeviceId) {
      // If editing, update the device
      this.deviceService.updateDevice(this.currentDeviceId, newDevice).subscribe({
        next: (device: Device) => {
          this.getDevices();
          this.clearForm();
          this.snackBar.open('Device updated successfully!', 'Close', {
            duration: 3000,
          });
        },
        error: (err) => {
          console.error('Error updating device:', err);
        },
      });
    } else {
      // If adding, send a POST request
      this.deviceService.addDevice(newDevice).subscribe({
        next: (device: Device) => {
          this.getDevices();
          this.clearForm();
          this.snackBar.open('Device added successfully!', 'Close', {
            duration: 3000,
          });
        },
        error: (err) => {
          console.error('Error adding device:', err); 
          this.snackBar.open('Device already existe!', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }
  

  // Fetch devices from the server
  getDevices(): void {
    this.deviceService.getDevices().subscribe((data: Device[]) => {
      this.devices = data;
      console.log(this.devices);  // Log devices to verify
    });
  }

  // Clear form fields
  clearForm(): void {
    this.deviceName = '';
    this.deviceType = '';
    this.deviceStatus = '';
    this.currentDeviceId = null;
  }

  // Edit device
  editDevice(deviceId: number): void {
    const device = this.devices.find(d => d.id === deviceId);
    if (device) {
      this.deviceName = device.name;
      this.deviceType = device.type;
      this.deviceStatus = device.status;
      this.currentDeviceId = device.id;
    } else {
      console.error('Device not found:', deviceId);
    }
  }

  // Delete device
  deleteDevice(deviceId: number): void {
    this.deviceService.deleteDevice(deviceId).subscribe(() => {
      this.devices = this.devices.filter((device) => device.id !== deviceId);
      alert('This device delete succesfully.')
    });
  }


  // activate and inactivate button 
  toggleState(device: Device): void {
    this.deviceService.toggleDeviceStatus(device.id!).subscribe({
      next: (response: any) => {
        device.status = response.device_status;
        device.last_reading = response.last_reading;
        // Optionally, handle the display of the last reading if it's available
        if (device.last_reading) {
          console.log('Last Reading:', device.last_reading);
        }
      },
      error: (err) => {
        console.error('Error toggling device status:', err);
      },
    });
  }


}
