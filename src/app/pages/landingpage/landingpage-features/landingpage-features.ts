import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Icons } from '../../../shared/icons/icons';

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
  iconBg: string;
}

@Component({
  selector: 'app-landingpage-features',
  imports: [CommonModule ,Icons],
  templateUrl: './landingpage-features.html',
  styleUrl: './landingpage-features.scss',
})
export class LandingpageFeatures {

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

}
