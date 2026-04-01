export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface UserProfileData {
  name: string;
  title: string;
  location: string;
  email: string;
  avatarInitial: string;
  profileCompletion: number;
  socialLinks: SocialLinks;
  resume: File | null;
  experience: Experience[];
  education: Education[];
  skills: string[];
}
