import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StepCardComponent } from '../../../shared/components/step-card/step-card.component';
import { TestimonialCardComponent } from '../../../shared/components/testimonial-card/testimonial-card.component';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  name: string;
  role: string;
  message: string;
  image: string;
}

interface StepItem {
  icon: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-landingpage-testimonials',
  imports: [CommonModule,StepCardComponent, TestimonialCardComponent],
  templateUrl: './landingpage-testimonials.html',
  styleUrl: './landingpage-testimonials.scss',
})
export class LandingpageTestimonials implements AfterViewInit, OnDestroy {

  @ViewChild('marqueeWrapper') marqueeWrapper!: ElementRef<HTMLElement>;

  private marqueeAnimation!: gsap.core.Tween;
  private stepAnimation!: gsap.core.Timeline;
  private isPaused = false;

  testimonials: Testimonial[] = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at TechCorp',
      message: 'The AI resume enhancer helped me get three times more interviews. Its suggestions were incredibly accurate.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'Michael Torres',
      role: 'Product Manager at StartupXYZ',
      message: 'Mock interviews were a game-changer. I felt so prepared walking into my interviews that I nailed every single one.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'Emily Johnson',
      role: 'HR Director at GlobalCo',
      message: 'As an employer, the AI-powered candidate matching saves us hours. We find qualified candidates faster than ever.',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
      name: 'David Park',
      role: 'UX Designer at DesignHub',
      message: 'I went from zero callbacks to multiple offers in just two weeks. The profile optimization is absolutely brilliant.',
      image: 'https://randomuser.me/api/portraits/men/52.jpg',
    },
    {
      name: 'Priya Sharma',
      role: 'Data Scientist at Analytics Inc',
      message: 'The mock interview AI gave me incredibly realistic practice sessions. I walked in confident and walked out with an offer.',
      image: 'https://randomuser.me/api/portraits/women/26.jpg',
    },
  ];

  steps: StepItem[] = [
    {
      icon: 'file-text',
      title: 'Upload Your Resume',
      desc: 'Share your experience and let our AI analyze your profile',
    },
    {
      icon: 'zap',
      title: 'AI Enhancement',
      desc: 'Get intelligent suggestions to optimize your resume and profile',
    },
    {
      icon: 'trending-up',
      title: 'Match & Apply',
      desc: 'Receive personalized job matches and apply with confidence',
    },
  ];

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initStepAnimations();
      this.initMarquee();
    });
  }

  private initStepAnimations(): void {
    const stepCards = document.querySelectorAll('.step-card');

    gsap.set(stepCards, { opacity: 0, y: 40 });

    this.stepAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: '.step-card',
        start: 'top 85%',
      },
    });

    this.stepAnimation.to(stepCards, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.18,
      ease: 'power3.out',
    });
  }

  private initMarquee(): void {
    const wrapper = this.marqueeWrapper?.nativeElement;
    if (!wrapper) return;

    // Total width of ONE set (half the total, since we duplicated)
    const totalWidth = wrapper.scrollWidth / 2;

    this.marqueeAnimation = gsap.to(wrapper, {
      x: -totalWidth,
      duration: 22,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: any) => parseFloat(x) % totalWidth),
      },
    });

    // Pause on hover
    wrapper.addEventListener('mouseenter', () => {
      this.marqueeAnimation.timeScale(0.15);
    });

    wrapper.addEventListener('mouseleave', () => {
      this.marqueeAnimation.timeScale(1);
    });
  }

  ngOnDestroy(): void {
    this.marqueeAnimation?.kill();
    this.stepAnimation?.kill();
  }
}