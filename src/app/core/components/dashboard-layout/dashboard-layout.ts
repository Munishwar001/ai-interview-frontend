import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { EMPLOYER_MENU, JOBSEEKER_MENU, SidebarItem } from '../../config/sidebar.config';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { AuthService } from '../../../auth/services/auth';
import { UserStore } from '../../../core/services/user-store';
import { Router } from '@angular/router';
import { UserRole } from '../../../shared/enums/UserRole ';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, CommonModule, Sidebar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout implements OnInit {
  pageTitle: string = 'Dashboard';
  menuItems: SidebarItem[] = [];
  menuLabel: string = 'Menu';
  isSidebarOpen = true;

  constructor(
    private authService: AuthService,
    private userStore: UserStore,
    private router: Router
  ) {}

  ngOnInit() {
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }

    const state = this.userStore.state;

    // Guard — logout if no valid session
    if (!state.loaded || !state.email) {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
      return;
    }

    // Set menu based on role
    if (state.isEmployerAccess) {
      this.menuItems = EMPLOYER_MENU;
      this.menuLabel = 'Employer Menu';
    } else {
      this.menuItems = JOBSEEKER_MENU;
      this.menuLabel = 'Menu';
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  handleLogout() {
    this.authService.logout();
  }
}