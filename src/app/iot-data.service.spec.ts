import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IotDataService {
  devices = [
    { id: 1, name: 'Device A', status: 'Online', latestReading: 45 },
    { id: 2, name: 'Device B', status: 'Offline', latestReading: null },
    { id: 3, name: 'Device C', status: 'Online', latestReading: 30 },
  ];

  historicalData = {
    1: [10, 20, 30, 40, 45],
    2: [15, 25, 35, 45, null],
    3: [5, 15, 25, 30, 30],
  };

  getDevices() {
    return this.devices;
  }

  getHistoricalData(deviceId: number) {
    return this.historicalData[deviceId] || [];
  }
}