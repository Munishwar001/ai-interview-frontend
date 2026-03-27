import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Icons } from '../../../shared/icons/icons';
import { CommonModule } from '@angular/common';
import { SIDEBAR_MENU } from '../../config/sidebar.config';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, CommonModule ,Sidebar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout implements OnInit {
  pageTitle: string = 'Dashboard';
  menuItems = SIDEBAR_MENU;
  isSidebarOpen = true;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  handleLogout() {
    this.authService.logout();
  }
}
