import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Job {
  id: number;
  title: string;
  company: string;
  companyInitials: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  status: 'Active' | 'Closed';
  applicants: number;
  views: number;
  shortlisted: number;
  description: string;
  skills: string[];
}

@Component({
  selector: 'app-posted-job-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './posted-job-home.html',
})
export class PostedJobHome implements OnInit {
  searchQuery = '';
  activeFilter = 'All';
  filters = ['All', 'Active', 'Closed'];
  jobs: Job[] = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Pvt Ltd',
      companyInitials: 'TC',
      location: 'Bangalore, India',
      type: 'Full-time',
      salary: 'INR 18,00,000 - 24,00,000',
      postedDate: '28 Mar 2025',
      status: 'Active',
      applicants: 42,
      views: 318,
      shortlisted: 8,
      description: 'Looking for an experienced frontend developer with strong React skills to lead UI development for our SaaS product.',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
    },
    {
      id: 2,
      title: 'Backend Engineer',
      company: 'TechCorp Pvt Ltd',
      companyInitials: 'TC',
      location: 'Hyderabad, India',
      type: 'Contract',
      salary: 'INR 12,00,000 - 16,00,000',
      postedDate: '10 Mar 2025',
      status: 'Closed',
      applicants: 67,
      views: 512,
      shortlisted: 14,
      description: 'Position filled. Was looking for a Node.js/PostgreSQL developer to build scalable APIs and microservices.',
      skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    },
  ];
  selectedJob: Job | null = null;
  isPreviewOpen = false;

  get filteredJobs(): Job[] {
    return this.jobs.filter((job) => {
      const matchFilter = this.activeFilter === 'All' || job.status === this.activeFilter;
      const matchSearch = job.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }

  ngOnInit(): void {}

  onClose(job: Job): void {
    if (job.status !== 'Active') {
      return;
    }
    job.status = 'Closed';
  }

  onReopen(job: Job): void {
    if (job.status !== 'Closed') {
      return;
    }
    job.status = 'Active';
  }

  onDelete(job: Job): void {
    const shouldDelete = confirm(`Delete job "${job.title}"?`);
    if (!shouldDelete) {
      return;
    }
    this.jobs = this.jobs.filter((item) => item.id !== job.id);
    if (this.selectedJob?.id === job.id) {
      this.closeJobPreview();
    }
  }

  openJobPreview(job: Job): void {
    if (job.status === 'Closed') {
      return;
    }
    this.selectedJob = job;
    this.isPreviewOpen = true;
  }

  closeJobPreview(): void {
    this.isPreviewOpen = false;
    this.selectedJob = null;
  }
}

export { PostedJobHome as PostedJobHomeComponent };
