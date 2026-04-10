import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as signalR from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import 'emoji-picker-element';
import { environment } from '../../../../../environment/environment';
import { AuthStore } from '../../../auth/services/auth-store';
import {
  ApplicationChatMessageDto,
  ApplicationChatRoomDto,
  JobsService,
} from '../services/jobs.service';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './chats.html',
})
export class Chats implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageScroller') messageScroller?: ElementRef<HTMLDivElement>;
  @ViewChild('composer') composer?: ElementRef<HTMLTextAreaElement>;

  rooms = signal<ApplicationChatRoomDto[]>([]);
  selectedRoom = signal<ApplicationChatRoomDto | null>(null);
  messages = signal<ApplicationChatMessageDto[]>([]);
  loadingRooms = signal(true);
  loadingMessages = signal(false);
  sending = signal(false);
  emojiPickerOpen = signal(false);

  draft = '';

  private connection: signalR.HubConnection | null = null;
  private currentUserId = '';
  private currentIdentitySet = new Set<string>();
  private shouldScrollToBottom = false;

  constructor(
    private jobsService: JobsService,
    private authStore: AuthStore,
    private toastr: ToastrService,
  ) {}

  async ngOnInit() {
    this.currentIdentitySet = this.resolveIdentitySetFromToken();
    this.currentUserId = this.resolveUserIdFromToken(this.currentIdentitySet);
    await this.setupSignalR();
    this.loadRooms();
  }

  async ngOnDestroy() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  ngAfterViewChecked(): void {
    if (!this.shouldScrollToBottom) return;
    this.shouldScrollToBottom = false;

    const scroller = this.messageScroller?.nativeElement;
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }

  async selectRoom(room: ApplicationChatRoomDto) {
    const previous = this.selectedRoom();
    if (previous?.applicationId === room.applicationId) return;

    if (previous && this.connection) {
      await this.connection.invoke('LeaveApplicationChat', previous.applicationId);
    }

    this.selectedRoom.set(room);
    this.loadingMessages.set(true);

    this.jobsService.getChatMessages(room.applicationId).subscribe({
      next: async (items) => {
        this.messages.set(items);
        this.loadingMessages.set(false);
        this.shouldScrollToBottom = true;

        if (this.connection) {
          await this.connection.invoke('JoinApplicationChat', room.applicationId);
        }
      },
      error: () => {
        this.messages.set([]);
        this.loadingMessages.set(false);
        this.toastr.error('Failed to load chat messages.');
      },
    });
  }

  async send() {
    const room = this.selectedRoom();
    const text = this.draft.trim();

    if (!room || !text || this.sending()) return;

    this.sending.set(true);

    try {
      if (this.connection?.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke('SendMessage', room.applicationId, text);
      } else {
        this.jobsService.sendChatMessage(room.applicationId, text).subscribe({
          next: (created) => {
            this.onReceiveMessage(created);
          },
          error: () => {
            this.toastr.error('Failed to send message.');
          },
        });
      }

      this.draft = '';
    } catch {
      this.toastr.error('Failed to send message.');
    } finally {
      this.sending.set(false);
    }
  }

  isMine(message: ApplicationChatMessageDto): boolean {
    const senderId = this.normalizeIdentity(message.senderId);
    if (senderId && this.currentIdentitySet.has(senderId)) return true;

    const senderName = this.normalizeIdentity(message.senderName);
    if (senderName && this.currentIdentitySet.has(senderName)) return true;

    const participantName = this.normalizeIdentity(this.selectedRoom()?.participantName);
    const participantEmail = this.normalizeIdentity(this.selectedRoom()?.participantEmail);

    // Two-party fallback: if sender clearly matches participant identity, it's not mine.
    if (senderName && (senderName === participantName || senderName === participantEmail)) return false;

    // If sender isn't participant and we couldn't match token claims, treat it as mine.
    if (senderName && participantName && senderName !== participantName) return true;

    return !!this.currentUserId && senderId === this.currentUserId;
  }

  onEnterKey(event: Event) {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.send();
    }
  }

  toggleEmojiPicker() {
    this.emojiPickerOpen.update((open) => !open);
  }

  onEmojiPicked(event: Event) {
    const custom = event as CustomEvent<{ unicode?: string }>;
    const emoji = custom.detail?.unicode;
    if (!emoji) return;

    this.insertAtCursor(emoji);
    this.emojiPickerOpen.set(false);
  }

  private insertAtCursor(text: string) {
    const textarea = this.composer?.nativeElement;
    if (!textarea) {
      this.draft += text;
      return;
    }

    const start = textarea.selectionStart ?? this.draft.length;
    const end = textarea.selectionEnd ?? start;
    this.draft = `${this.draft.slice(0, start)}${text}${this.draft.slice(end)}`;

    const cursor = start + text.length;
    queueMicrotask(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  trackByRoom = (_: number, room: ApplicationChatRoomDto) => room.applicationId;
  trackByMessage = (_: number, message: ApplicationChatMessageDto) => message.id;

  private loadRooms() {
    this.loadingRooms.set(true);
    this.jobsService.getChatRooms().subscribe({
      next: async (rooms) => {
        const ordered = [...rooms].sort((a, b) => this.toMillis(b.lastMessageAt) - this.toMillis(a.lastMessageAt));
        this.rooms.set(ordered);
        this.loadingRooms.set(false);

        if (ordered.length) {
          await this.selectRoom(ordered[0]);
        }
      },
      error: () => {
        this.rooms.set([]);
        this.loadingRooms.set(false);
      },
    });
  }

  private async setupSignalR() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.url}/hubs/application-chat`, {
        accessTokenFactory: () => this.authStore.getAccessToken()?.accessToken || '',
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveMessage', (message: ApplicationChatMessageDto) => {
      this.onReceiveMessage(message);
    });

    await this.connection.start();
  }

  private onReceiveMessage(message: ApplicationChatMessageDto) {
    this.rooms.update((list) => {
      const found = list.find((room) => room.applicationId === message.applicationId);
      if (!found) return list;

      const updated = list.map((room) =>
        room.applicationId === message.applicationId
          ? {
              ...room,
              lastMessage: message.message,
              lastMessageAt: message.createdAt,
            }
          : room
      );

      return updated.sort((a, b) => this.toMillis(b.lastMessageAt) - this.toMillis(a.lastMessageAt));
    });

    if (this.selectedRoom()?.applicationId === message.applicationId) {
      this.messages.update((list) => {
        if (list.some((item) => item.id === message.id)) return list;
        return [...list, message];
      });
      this.shouldScrollToBottom = true;
    }
  }

  private resolveUserIdFromToken(identitySet: Set<string>): string {
    for (const key of identitySet) {
      if (this.looksLikeUserId(key)) return key;
    }

    return '';
  }

  private resolveIdentitySetFromToken(): Set<string> {
    const token = this.authStore.getAccessToken()?.accessToken;
    const set = new Set<string>();
    if (!token) return set;

    try {
      const [, payload] = token.split('.');
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
      const parsed = JSON.parse(json) as Record<string, string | string[] | undefined>;

      this.addIdentityValue(set, parsed['nameid']);
      this.addIdentityValue(set, parsed['sub']);
      this.addIdentityValue(set, parsed['uid']);
      this.addIdentityValue(set, parsed['userId']);
      this.addIdentityValue(set, parsed['oid']);
      this.addIdentityValue(set, parsed['email']);
      this.addIdentityValue(set, parsed['emails']);
      this.addIdentityValue(set, parsed['preferred_username']);
      this.addIdentityValue(set, parsed['unique_name']);
      this.addIdentityValue(set, parsed['upn']);
      this.addIdentityValue(set, parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
      this.addIdentityValue(set, parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']);

      return set;
    } catch {
      return set;
    }
  }

  private addIdentityValue(target: Set<string>, value?: string | string[]) {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        const normalized = this.normalizeIdentity(entry);
        if (normalized) target.add(normalized);
      });
      return;
    }

    const normalized = this.normalizeIdentity(value);
    if (normalized) target.add(normalized);
  }

  private normalizeIdentity(value?: string): string {
    return (value || '').trim().toLowerCase();
  }

  private looksLikeUserId(value: string): boolean {
    if (!value) return false;

    // Prefer opaque IDs over user-facing identifiers like emails.
    return !value.includes('@') && value.length >= 6;
  }

  private toMillis(value?: string): number {
    if (!value) return 0;
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? 0 : dt.getTime();
  }
}
