import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Icons } from '../../shared/icons/icons';

interface Stat {
  value: string;
  label: string;
}

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
  iconBg: string;
}

interface StepItem {
  icon: string;
  title: string;
  desc: string;
}

interface Testimonial {
  name: string;
  role: string;
  message: string;
  image: string;
}

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [CommonModule, Icons],
  templateUrl: './landingpage.html',
  styleUrls: ['./landingpage.scss'],
})
export class Landingpage {

  constructor(private router: Router) {}

  // ================= DATA =================

  stats: Stat[] = [
    { value: '50K+', label: 'Jobs Posted' },
    { value: '100K+', label: 'Successful Hires' },
    { value: '95%', label: 'Match Accuracy' },
    { value: '4.9', label: 'User Rating' },
  ];

  features: string[] = [
    'Free to start',
    'No credit card required',
    'AI-powered matching'
  ];

  featuresList: FeatureItem[] = [
    {
      icon: 'file-text',
      title: 'AI Resume Enhancer',
      desc: 'Transform your resume with AI-powered suggestions for better bullet points, skills optimization, and professional formatting.',
      iconBg: 'bg-indigo-500',
    },
    {
      icon: 'target',
      title: 'Smart Job Matching',
      desc: 'Our AI analyzes your skills and experience to find the perfect job opportunities with match scores you can trust.',
      iconBg: 'bg-pink-500',
    },
    {
      icon: 'message-square',
      title: 'AI Mock Interviews',
      desc: 'Practice with our AI interviewer, get real-time feedback, and boost your confidence before the big day.',
      iconBg: 'bg-orange-500',
    },
    {
      icon: 'users',
      title: 'Real-time Chat',
      desc: 'Connect directly with recruiters and hiring managers through our seamless messaging platform.',
      iconBg: 'bg-green-500',
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

  testimonials: Testimonial[] = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at TechCorp',
      message:
        'The AI resume enhancer helped me land 3x more interviews. The suggestions were spot-on and really made my experience shine.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'Michael Torres',
      role: 'Product Manager at StartupXYZ',
      message:
        'Mock interviews were a game-changer. I felt so prepared walking into my interviews that I nailed every single one.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'Emily Johnson',
      role: 'HR Director at GlobalCo',
      message:
        'As an employer, the AI-powered candidate matching saves us hours. We find qualified candidates faster than ever.',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
  ];

  // ================= NAVIGATION =================

  onJobSeeker(): void {
    this.router.navigate(['/signup']);
  }

  onEmployer(): void {
    this.router.navigate(['/signup']);
  }

  onSignIn(): void {
    this.router.navigate(['/login']);
  }
}