import { Component, Input, Output, EventEmitter ,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icons } from '../../icons/icons';
import { UserStore } from '../../../core/services/user-store';
import { UserState } from '../../../core/core.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Icons],
  templateUrl: './sidebar.html',
})

export class Sidebar implements OnInit {
  @Input() isSidebarOpen!: boolean;
  @Input() menuItems: any[] = [];
  @Output() logout = new EventEmitter<void>();

  isProfileMenuOpen = false;
  userState!: UserState;

  // Gets first letter of name for avatar
  get avatarLetter(): string {
    return this.userState?.fullName?.charAt(0)?.toUpperCase() || '?';
  }

  constructor(private userStore: UserStore) {}

  ngOnInit(): void {
    // Subscribe so it updates reactively
    this.userStore.state$.subscribe(state => {
      this.userState = state;
    });
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  onLogout(): void {
    this.closeProfileMenu();
    this.logout.emit();
  }
}