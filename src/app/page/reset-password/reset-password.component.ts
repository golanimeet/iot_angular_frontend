import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  newPassword = '';
  message = '';
  isError = false;
  uidb64 = '';
  token = '';

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.uidb64 = this.route.snapshot.paramMap.get('uidb64') || '';
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (!this.uidb64 || !this.token) {
      this.message = 'Invalid reset link';
      this.isError = true;
    }
  }

  onSubmit() {
    if (this.newPassword.length < 6) {
      this.message = 'Password must be at least 6 characters long';
      this.isError = true;
      return;
    }

    this.authService.resetPassword(this.uidb64, this.token, this.newPassword).subscribe({
      next: () => {
        this.message = 'Password reset successful! Redirecting to login...';
        this.isError = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (error) => {
        console.error("Error resetting password: ", error);
        this.message = 'Error resetting password. Please check your link and try again.';
        this.isError = true;
      }
    });
  }
}
