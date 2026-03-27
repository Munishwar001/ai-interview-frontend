import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icons } from '../../icons/icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Icons],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  @Input() isSidebarOpen!: boolean;
  @Input() menuItems: any[] = [];

  @Output() logout = new EventEmitter<void>();

  isProfileMenuOpen = false;

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    console.log('Profile menu toggled:', this.isProfileMenuOpen);
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
    console.log('Profile menu closed:', this.isProfileMenuOpen);
  }

  onLogout(): void {
    this.closeProfileMenu();
    this.logout.emit();
  }
}