import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports : [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  activeForm: 'login' | 'register' = 'login';
  registerObj = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  loginObj = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private snackBar: MatSnackBar, private router: Router) {}

  toggleForm(form: 'login' | 'register') {
    this.activeForm = form;
  }

  registerForm() {
    if (this.registerObj.password !== this.registerObj.confirmPassword) {
      this.snackBar.open('Passwords do not match!', 'Close', { duration: 3000 });
      return;
    }

    this.authService.register(this.registerObj).subscribe(
      response => {
        this.snackBar.open('User registered successfully!', 'Close', { duration: 3000 });
        this.toggleForm('login');
      },
      error => {
        this.snackBar.open('Registration failed: ' + error.error.detail, 'Close', { duration: 3000 });
      }
    );
  }

  loginForm() {
    this.authService.login(this.loginObj).subscribe(
      response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user)); // Store user info
        
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        this.router.navigateByUrl('/dashboard');
      },  
      error => {
        this.snackBar.open('Login failed: ' + error.error.message, 'Close', { duration: 3000 });
      }
    );
  }
}
