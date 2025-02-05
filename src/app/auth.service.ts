import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface DashboardStats {
  totalDevices: number;
  totalSensore: number;
}
export interface Device {
  id?: number;  // Optional for new devices
  name: string;
  type: string;
  user: number;  // Ensure user ID is included
  status: string;
  last_reading: any; // Modify as per actual response type
  created_at: string;  // Add this
  updated_at: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api'; // Django API URL
  private tokenKey = 'access_token'; // Key for storing token in localStorage
  constructor(private http: HttpClient, private _router: Router) { }
  //register
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, data);
  }
  // login 
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, data);
  }
  // logout
  logout() {
    localStorage.removeItem('access_token'); // Clear stored token
    this._router.navigateByUrl('/login'); // Redirect to login page
  }
  // get token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  //  user id data show
  private getAuthHeaders(): any {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  addDevice(device: Device): Observable<Device> {
    return this.http.post<Device>(`${this.apiUrl}/devices/`, device, {
      headers: this.getAuthHeaders(),
    });
  }

  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.apiUrl}/devices/`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateDevice(deviceId: number, device: Device): Observable<Device> {
    return this.http.put<Device>(`${this.apiUrl}/devices/${deviceId}/`, device, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteDevice(deviceId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/devices/${deviceId}/`, {
      headers: this.getAuthHeaders(),
    });
  }

  toggleDeviceStatus(deviceId: number) {
    return this.http.post<any>(`${this.apiUrl}/toggle-device-status/${deviceId}/`, {});
  }

  getReportData(deviceName: string, dateRange: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/report-data/`, {
      params: {
        device_name: deviceName,
        date_range: dateRange,
      },
    });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard-stats/`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Request Password Reset
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset/`, { email });
  }

  // Reset Password using UID and Token
  resetPassword(uidb64: string, token: string, newPassword: string): Observable<any> {
    console.log('Sending data:', { uidb64, token, newPassword });  // Log to confirm the values
    return this.http.post(`${this.apiUrl}/password-reset-confirm/`, {
      uidb64: uidb64,
      token: token,
      new_password: newPassword  // This field name should be exactly 'new_password'
    });
  }

}
