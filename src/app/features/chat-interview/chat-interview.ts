import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import lottie, { AnimationItem } from 'lottie-web';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-interview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-interview.html',
  styleUrl: './chat-interview.scss',
})
export class ChatInterview implements OnInit, AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  messages: Message[] = [];
  inputMessage: string = '';
  isLoading: boolean = false;
  private aiAvatarAnimations: Map<string, AnimationItem> = new Map();

  ngOnInit() {
    // Initialize with a welcome message from AI
    const welcomeMessage: Message = {
      id: '1',
      sender: 'ai',
      text: 'Hello! Welcome to your AI Mock Interview. I\'m ready to help you practice. What role would you like to interview for today?',
      timestamp: new Date(),
    };
    this.messages.push(welcomeMessage);
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
    if (this.inputMessage.trim().length === 0) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: this.inputMessage,
      timestamp: new Date(),
    };
    this.messages.push(userMessage);

    // Clear input
    this.inputMessage = '';
    this.scrollToBottom();

    // Simulate AI response delay
    this.isLoading = true;
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: this.generateAIResponse(userMessage.text),
        timestamp: new Date(),
      };
      this.messages.push(aiMessage);
      this.isLoading = false;
      this.scrollToBottom();
    }, 1000);
  }

  private generateAIResponse(userInput: string): string {
    // Placeholder for AI response logic
    const responses = [
      'That\'s a great answer! Can you tell me more about your experience with this?',
      'Interesting! How would you approach this problem differently?',
      'Good point! What would be your first step in implementing this?',
      'I appreciate that response. Let me ask you a follow-up question...',
      'Excellent! How do you handle edge cases in this scenario?',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
}
