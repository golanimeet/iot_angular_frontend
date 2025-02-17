import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterOutlet, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  loggedUser: { first_name: string; last_name: string } | null = null;
  isSidebarActive: boolean = false;

  constructor(private authService: AuthService, private snackBar: MatSnackBar, private router: Router) { }

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.loggedUser = JSON.parse(userData);
    }
  }
  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }

  logoutUser() {
    this.authService.logout();
    localStorage.removeItem('access_token'); // Clear token
    localStorage.removeItem('user'); // Clear user info
    this.snackBar.open('Logged out successfully!', 'Close', { duration: 3000 });
    this.router.navigateByUrl('/login');
  }

  // Detect outside clicks to close sidebar
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');

    if (sidebar && toggleButton && !sidebar.contains(event.target as Node) && !toggleButton.contains(event.target as Node)) {
      this.isSidebarActive = false;
    }
  }

}
