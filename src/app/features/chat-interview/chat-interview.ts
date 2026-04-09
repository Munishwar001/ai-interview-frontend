import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterContentChecked,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import lottie, { AnimationItem } from 'lottie-web';
import {
  MockInterviewService,
  StartInterviewResponse,
  InterviewSessionDto,
} from './services/mock-interview.service';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  typedText?: string;
  isTyping?: boolean;
}

@Component({
  selector: 'app-chat-interview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-interview.html',
  styleUrl: './chat-interview.scss',
})
export class ChatInterview implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  sessionId: string | null = null;
  sessionStatus = 'loading';
  sessionSkills: string[] = [];
  sessionError = '';
  messages: Message[] = [];
  inputMessage: string = '';
  isLoading: boolean = false;
  isSessionLoading = false;
  isSessionsLoading = false;
  interviewSessions: InterviewSessionDto[] = [];
  private aiAvatarAnimations: Map<string, AnimationItem> = new Map();
  private typingTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private mockInterviewService: MockInterviewService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((queryParams) => {
      const requestedSessionId = queryParams.get('sessionId');
      const forceNew = queryParams.get('new') === 'true';

      this.loadSessions();

      if (forceNew) {
        // Don't auto-start — just set state to idle so user can start manually
        this.sessionStatus = 'idle';
        return;
      }

      if (requestedSessionId) {
        this.loadSessionById(requestedSessionId);
        return;
      }

      // Check for existing sessions — load latest if found, otherwise stay idle
      this.isSessionLoading = true;
      this.mockInterviewService.getSessions().subscribe({
        next: (sessions) => {
          this.isSessionLoading = false;
          if (sessions.length > 0) {
            const latest = [...sessions].sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
            )[0];
            this.handleLoadedSessionDto(latest);
          } else {
            // No existing sessions — pre-fill input so user just presses Enter
            this.sessionStatus = 'idle';
            this.inputMessage = 'Start the interview';
          }
        },
        error: () => {
          this.isSessionLoading = false;
          this.sessionStatus = 'idle';
          this.inputMessage = 'Start the interview';
        },
      });
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
    // Initialize animations for existing AI messages
    setTimeout(() => {
      this.initializeAIAvatarAnimations();
    }, 0);
  }

  ngAfterContentChecked() {
    // Reinitialize animations after messages are added
    setTimeout(() => {
      this.initializeAIAvatarAnimations();
    }, 0);
  }

  ngOnDestroy(): void {
    this.stopTyping();
    this.aiAvatarAnimations.forEach((anim) => anim.destroy());
    this.aiAvatarAnimations.clear();
  }

  private initializeSession(): void {
    this.isSessionLoading = true;
    this.sessionError = '';

    this.mockInterviewService.getSessions().subscribe({
      next: (sessions) => {
        if (sessions.length > 0) {
          const latestSession = [...sessions].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )[0];
          this.handleLoadedSessionDto(latestSession);

          return;
        }

        this.startNewInterview();
      },
      error: () => {
        this.startNewInterview();
      },
    });
  }

  startNewInterview(): void {
    if (this.isSessionLoading || this.isLoading) return;
    this.messages = [];
    this.sessionError = '';
    this.sessionStatus = 'idle';
    this.sessionId = null;
    this.sessionSkills = [];
    this.inputMessage = 'Start the interview';
  }

  openSession(sessionId: string): void {
    if (!sessionId || this.isSessionLoading) {
      return;
    }

    this.loadSessionById(sessionId);
  }

  isSelectedSession(sessionId: string): boolean {
    return this.sessionId === sessionId;
  }

  private loadSessions(): void {
    this.isSessionsLoading = true;
    this.mockInterviewService.getSessions().subscribe({
      next: (sessions) => {
        this.interviewSessions = [...sessions].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        this.isSessionsLoading = false;
      },
      error: () => {
        this.interviewSessions = [];
        this.isSessionsLoading = false;
      },
    });
  }

  private loadSessionById(sessionId: string): void {
    this.isSessionLoading = true;
    this.sessionError = '';

    this.mockInterviewService.getSession(sessionId).subscribe({
      next: (session) => {
        this.handleLoadedSessionDto(session);
      },
      error: () => {
        this.isSessionLoading = false;
        this.sessionStatus = 'error';
        this.sessionError = 'Unable to load this interview session.';
      },
    });
  }

  private handleStartedSession(response: StartInterviewResponse, fallbackSkills: string[]): void {
    this.sessionId = response.sessionId;
    this.sessionSkills = response.skills ?? fallbackSkills;
    this.sessionStatus = 'active';
    this.messages = [];

    if (response.firstQuestion) {
      this.appendAiMessageWithTyping(response.firstQuestion);
    }

    this.isSessionLoading = false;
    this.loadSessions();
  }

  private handleLoadedSessionDto(session: InterviewSessionDto): void {
    this.handleLoadedSession(
      session.id,
      session.skills ?? [],
      session.status ?? 'active',
      session.messages ?? [],
    );
  }

  private handleLoadedSession(sessionId: string, skills: string[], status: string, messages: Array<{ role: string; content: string; createdAt: string }>): void {
    this.sessionId = sessionId;
    this.sessionSkills = skills;
    this.sessionStatus = status || 'active';
    localStorage.setItem('mockInterviewSessionId', sessionId);
    this.messages = messages.map((message, index) => ({
      id: `${sessionId}-${index}`,
      sender: message.role === 'user' ? 'user' : 'ai',
      text: message.content,
      timestamp: new Date(message.createdAt),
      typedText: message.role === 'user' ? message.content : message.content,
      isTyping: false,
    }));
    this.isSessionLoading = false;
    this.scrollToBottom();
  }

  private initializeAIAvatarAnimations() {
    const aiContainers = document.querySelectorAll('[data-ai-avatar]');
    aiContainers.forEach((container) => {
      const msgId = container.getAttribute('data-ai-avatar');
      if (msgId && !this.aiAvatarAnimations.has(msgId)) {
        const anim = lottie.loadAnimation({
          container: container as HTMLElement,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: '/ai-animation.json',
        });
        this.aiAvatarAnimations.set(msgId, anim);
      }
    });
  }

  sendMessage() {
    if (this.inputMessage.trim().length === 0 || this.isSessionLoading || this.sessionStatus === 'completed') {
      return;
    }

    const userText = this.inputMessage.trim();
    this.inputMessage = '';

    // No session yet — create one first, then send the message
    if (!this.sessionId) {
      this.isSessionLoading = true;
      this.sessionStatus = 'loading';
      this.mockInterviewService.getUserSkills().subscribe({
        next: (skills) => {
          const skillNames = skills.map(s => s.name).filter((n): n is string => !!n);
          this.mockInterviewService.startInterview(skillNames).subscribe({
            next: (response) => {
              this.handleStartedSession(response, skillNames);
              this._sendUserMessage(userText);
            },
            error: () => {
              this.isSessionLoading = false;
              this.sessionStatus = 'error';
              this.sessionError = 'Unable to start the interview session. Please try again.';
            },
          });
        },
        error: () => {
          this.mockInterviewService.startInterview([]).subscribe({
            next: (response) => {
              this.handleStartedSession(response, []);
              this._sendUserMessage(userText);
            },
            error: () => {
              this.isSessionLoading = false;
              this.sessionStatus = 'error';
              this.sessionError = 'Unable to start the interview session. Please try again.';
            },
          });
        },
      });
      return;
    }

    this._sendUserMessage(userText);
  }

  private _sendUserMessage(userText: string) {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };
    this.messages.push(userMessage);
    this.scrollToBottom();

    this.isLoading = true;
    this.mockInterviewService.sendMessage(this.sessionId!, userText).subscribe({
      next: (response) => {
        this.appendAiMessageWithTyping(response.aiMessage);
        if (response.isCompleted) this.sessionStatus = 'completed';
        this.isLoading = false;
        this.loadSessions();
        this.scrollToBottom();
      },
      error: () => {
        this.sessionError = 'Unable to send your answer right now. Please try again.';
        this.isLoading = false;
        this.scrollToBottom();
      },
    });
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      setTimeout(() => {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }, 0);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private appendAiMessageWithTyping(text: string): void {
    this.stopTyping();
    const aiMessage: Message = {
      id: `${this.sessionId || 'session'}-${Date.now()}`,
      sender: 'ai',
      text,
      timestamp: new Date(),
      typedText: '',
      isTyping: true,
    };
    this.messages.push(aiMessage);
    this.scrollToBottom();

    let index = 0;
    this.typingTimer = setInterval(() => {
      const currentMessage = this.messages.find((message) => message.id === aiMessage.id);
      if (!currentMessage) {
        this.stopTyping();
        return;
      }

      index += 1;
      currentMessage.typedText = text.slice(0, index);
      this.scrollToBottom();

      if (index >= text.length) {
        currentMessage.isTyping = false;
        currentMessage.typedText = text;
        this.stopTyping();
      }
    }, 10);
  }

  private stopTyping(): void {
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
  }
}
