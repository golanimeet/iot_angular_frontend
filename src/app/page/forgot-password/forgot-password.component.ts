import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = "";
  message = "";
  loading = false;

  constructor(private authService: AuthService) {}

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.loading = true;
    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response) => {
        this.message = response.detail;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error in password reset request: ", error);
        this.message = error.error.detail || "An error occurred. Please try again.";
        this.loading = false;
      }
    });
  }
}
