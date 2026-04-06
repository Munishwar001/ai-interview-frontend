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
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
  isCurrent: boolean;
  description?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface LocationSelection {
  address: string;
}

export interface SkillOption {
  id: number;
  name: string;
}

export interface UserProfileData {
  name: string;
  title: string;
  location: string;
  email: string;
  avatarInitial: string;
  avatarUrl?: string;
  profileCompletion: number;
  socialLinks: SocialLinks;
  resume: File | null;
  resumeFileName?: string;
  resumeFilePath?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface UserProfileDto {
  id: number;
  name?: string;
  title?: string;
  location?: string;
  email?: string;
  avatar?: string;
  initial?: string;
  profileCompletion: number;
  resumeFileName?: string;
  resumeFilePath?: string;
  linkedIn?: string;
  gitHub?: string;
  website?: string;
}

export interface UpsertUserProfileDto {
  name?: string;
  title?: string;
  location?: string;
  email?: string;
  avatar?: string;
  initial?: string;
  linkedIn?: string;
  gitHub?: string;
  website?: string;
}


export interface ExperienceDto {
  id: number;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface AddExperienceDto {
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface EducationDto {
  id: number;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
  isCurrent: boolean;
  description?: string;
}

export interface AddEducationDto {
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
  isCurrent: boolean;
  description?: string;
}

export interface UserSkillDto {
  id?: number;
  skillId?: number;
  name: string;
}

export interface SyncSkillsDto {
  skillIds: number[];
}