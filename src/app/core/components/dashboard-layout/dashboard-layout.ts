import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { EMPLOYER_MENU, JOBSEEKER_MENU, SidebarItem } from '../../config/sidebar.config';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { AuthService } from '../../../auth/services/auth';
import { UserStore } from '../../../core/services/user-store';
import { UserRole } from '../../../shared/enums/UserRole ';
import { filter } from 'rxjs';

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
  isFullBleedRoute = false;
  isMobile = window.innerWidth < 640;

  constructor(
    private authService: AuthService,
    private userStore: UserStore,
    private router: Router
  ) {}

  ngOnInit() {
    // Only auto-collapse on very small screens (phones)
    if (window.innerWidth < 640) {
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

    this.updateRouteLayout(this.router.url);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.updateRouteLayout(event.urlAfterRedirects);
    });
  }

  private updateRouteLayout(url: string) {
    this.isFullBleedRoute =
      url.includes('/dashboard/mock-interview') ||
      url.includes('/dashboard/chats') ||
      url === '/dashboard' ||
      url === '/dashboard/';

    // Derive page title from the matching menu item
    const allItems = [...EMPLOYER_MENU, ...JOBSEEKER_MENU];
    const match = allItems
      .filter(item => item.route !== '/dashboard') // skip root to avoid always matching
      .find(item => url.startsWith(item.route));

    this.pageTitle = match ? match.label : 'Dashboard';
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  handleLogout() {
    this.authService.logout();
  }
}