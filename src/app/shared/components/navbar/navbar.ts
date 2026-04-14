import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { JobsService, ApplicationChatRoomDto } from '../../../features/jobs/services/jobs.service';
import { AuthStore } from '../../../auth/services/auth-store';
import { environment } from '../../../../../environment/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit, OnDestroy {
  @Input() title: string = 'Dashboard';
  @Output() toggleSidebar = new EventEmitter<void>();

  isNotificationOpen = signal(false);
  notifications = signal<ApplicationChatRoomDto[]>([]);
  loadingNotifications = signal(false);
  hasLoadedOnce = false;
  
  private readonly LAST_SEEN_KEY = 'last_seen_messages';
  private connection: signalR.HubConnection | null = null;
  private pollingInterval: any = null;

  constructor(
    private jobsService: JobsService,
    private router: Router,
    private authStore: AuthStore
  ) {}

  async ngOnInit() {
    await this.setupSignalR();
    // Also poll every 30 seconds as fallback
    this.startPolling();
  }

  async ngOnDestroy() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private startPolling() {
    // Poll every 30 seconds to check for new notifications
    this.pollingInterval = setInterval(() => {
      console.log('⏰ Polling for new notifications...');
      this.refreshNotificationsInBackground();
    }, 30000); // 30 seconds
  }

  private async setupSignalR() {
    try {
      const token = this.authStore.getAccessToken()?.accessToken;
      console.log('Setting up SignalR for notifications, token exists:', !!token);

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.url}/hubs/application-chat`, {
          accessTokenFactory: () => this.authStore.getAccessToken()?.accessToken || '',
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Listen for new messages
      this.connection.on('ReceiveMessage', (message: any) => {
        console.log('🔔 New message received via SignalR:', message);
        console.log('Message details:', {
          applicationId: message.applicationId,
          senderName: message.senderName,
          message: message.message
        });
        // Refresh notifications when new message arrives
        this.refreshNotificationsInBackground();
      });

      this.connection.onreconnecting(() => {
        console.log('SignalR reconnecting...');
      });

      this.connection.onreconnected(() => {
        console.log('SignalR reconnected');
      });

      this.connection.onclose(() => {
        console.log('SignalR connection closed');
      });

      await this.connection.start();
      console.log('✅ SignalR connected for notifications, state:', this.connection.state);
    } catch (error) {
      console.error('❌ Failed to setup SignalR for notifications:', error);
    }
  }

  private refreshNotificationsInBackground() {
    console.log('🔄 Refreshing notifications in background...');
    // Silently refresh notifications without showing loading state
    this.jobsService.getChatRooms().subscribe({
      next: (rooms) => {
        console.log('Fetched chat rooms:', rooms.length);
        const roomsWithNewMessages = rooms.filter(room => {
          const hasNew = room.lastMessage && this.hasNewMessage(room);
          if (hasNew) {
            console.log('New message in room:', room.participantName, room.lastMessage);
          }
          return hasNew;
        });
        
        const previousCount = this.notifications().length;
        this.notifications.set(roomsWithNewMessages);
        const newCount = roomsWithNewMessages.length;
        
        console.log(`📊 Notifications updated: ${previousCount} → ${newCount}`);
        
        if (newCount > previousCount) {
          console.log('🔴 Red dot should appear now!');
        }
      },
      error: (err) => {
        console.error('Failed to refresh notifications:', err);
      }
    });
  }

  private getLastSeenMessages(): Map<number, string> {
    try {
      const stored = localStorage.getItem(this.LAST_SEEN_KEY);
      if (stored) {
        const obj = JSON.parse(stored) as Record<number, string>;
        return new Map(Object.entries(obj).map(([k, v]) => [Number(k), v]));
      }
    } catch (e) {
      console.error('Failed to load last seen messages', e);
    }
    return new Map();
  }

  private saveLastSeenMessage(applicationId: number, lastMessage: string, lastMessageAt: string) {
    try {
      const lastSeen = this.getLastSeenMessages();
      lastSeen.set(applicationId, `${lastMessage}|${lastMessageAt}`);
      
      const obj = Object.fromEntries(lastSeen);
      localStorage.setItem(this.LAST_SEEN_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error('Failed to save last seen message', e);
    }
  }

  private hasNewMessage(room: ApplicationChatRoomDto): boolean {
    const lastSeen = this.getLastSeenMessages();
    const seenData = lastSeen.get(room.applicationId);
    
    if (!seenData) {
      // Never seen before, so it's new
      return true;
    }
    
    const [seenMessage, seenTime] = seenData.split('|');
    
    // Check if message or time has changed
    return room.lastMessage !== seenMessage || room.lastMessageAt !== seenTime;
  }

  onToggle() {
    this.toggleSidebar.emit();
  }

  toggleNotifications() {
    const isOpen = !this.isNotificationOpen();
    this.isNotificationOpen.set(isOpen);
    
    // Only load notifications on very first open
    if (isOpen && !this.hasLoadedOnce) {
      this.loadNotifications();
    }
    
    console.log('Toggle notifications - isOpen:', isOpen, 'Count:', this.notifications().length, 'HasLoaded:', this.hasLoadedOnce);
  }

  closeNotifications() {
    this.isNotificationOpen.set(false);
  }

  loadNotifications() {
    this.loadingNotifications.set(true);
    this.jobsService.getChatRooms().subscribe({
      next: (rooms) => {
        // Filter rooms that have messages AND have new messages (not seen yet)
        const roomsWithNewMessages = rooms.filter(room => 
          room.lastMessage && this.hasNewMessage(room)
        );
        
        this.notifications.set(roomsWithNewMessages);
        this.loadingNotifications.set(false);
        this.hasLoadedOnce = true;
        console.log('Loaded notifications:', roomsWithNewMessages.length);
      },
      error: () => {
        this.notifications.set([]);
        this.loadingNotifications.set(false);
        this.hasLoadedOnce = true;
      }
    });
  }

  refreshNotifications() {
    console.log('Refreshing notifications (keeping seen history)');
    this.hasLoadedOnce = false;
    this.loadNotifications();
  }

  clearAllNotifications() {
    localStorage.removeItem(this.LAST_SEEN_KEY);
    console.log('Cleared all last seen messages - all notifications will reappear');
    this.hasLoadedOnce = false;
    this.loadNotifications();
  }

  goToChatByIndex(index: number) {
    console.log('=== REMOVING BY INDEX ===');
    console.log('Index to remove:', index);
    
    // Get current array
    const current = this.notifications();
    const notificationToMark = current[index];
    
    if (notificationToMark) {
      // Mark this message as seen (save last message details)
      this.saveLastSeenMessage(
        notificationToMark.applicationId,
        notificationToMark.lastMessage || '',
        notificationToMark.lastMessageAt || ''
      );
      console.log('Marked as seen:', notificationToMark.applicationId);
    }
    
    // Remove from current view
    const updated = current.filter((_, i) => i !== index);
    this.notifications.set(updated);
    
    console.log('Remaining notifications:', updated.length);
    
    // Navigate and close
    this.router.navigate(['/dashboard/chats']);
    setTimeout(() => {
      this.closeNotifications();
    }, 200);
  }

  goToChat(room: ApplicationChatRoomDto, event: Event) {
    event.stopPropagation();
    
    console.log('=== CLICK DEBUG ===');
    console.log('Clicked room:', room);
    console.log('ApplicationId to remove:', room.applicationId);
    console.log('Before - Total notifications:', this.notifications().length);
    
    // Get current notifications
    const current = this.notifications();
    console.log('Current notification IDs:', current.map(n => n.applicationId));
    
    // Filter out the clicked one
    const filtered = current.filter(n => {
      const match = n.applicationId === room.applicationId;
      console.log(`Comparing ${n.applicationId} === ${room.applicationId}: ${match}`);
      return !match; // Keep if NOT matching
    });
    
    console.log('After filter - Remaining:', filtered.length);
    console.log('Remaining IDs:', filtered.map(n => n.applicationId));
    
    // Update the signal
    this.notifications.set(filtered);
    
    console.log('Signal updated - New count:', this.notifications().length);
    
    // Navigate and close
    setTimeout(() => {
      this.router.navigate(['/dashboard/chats']);
      this.closeNotifications();
    }, 200);
  }

  getUnreadCount(): number {
    return this.notifications().length;
  }
}
