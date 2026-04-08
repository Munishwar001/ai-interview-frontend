import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-mock-interview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mock-interview.html',
  styleUrl: './mock-interview.scss',
})
export class MockInterview implements AfterViewInit, OnDestroy {
  @ViewChild('lottieContainer') lottieContainer!: ElementRef<HTMLDivElement>;
  private anim?: AnimationItem;

  constructor(private ngZone: NgZone, private router: Router) {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.anim = lottie.loadAnimation({
        container: this.lottieContainer.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/ai-animation.json',
      });

      // Resume if browser throttles/pauses on tab switch
      document.addEventListener('visibilitychange', this.onVisibility);
    });
  }

  private onVisibility = () => {
    if (document.visibilityState === 'visible') {
      this.anim?.play();
    }
  };

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.anim?.destroy();
  }

  startInterview() {
    // Navigate to chat interview window
    this.router.navigate(['/dashboard/chat-interview'], { queryParams: { new: 'true' } });
  }

  chooseRole() {
    // Placeholder for role selection logic
    console.log('Choose role functionality');
  }
}
