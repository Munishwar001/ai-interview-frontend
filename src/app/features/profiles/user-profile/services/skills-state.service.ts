import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { WritableSignal } from '@angular/core';
import { SkillOption, UserProfileData } from '../../profiles.models';
import { JobSeekerService } from './job-seeker.service';
import { Lookup } from '../../../../shared/services/lookup';

@Injectable()
export class SkillsStateService {
  allSkills: SkillOption[] = [];
  selectedSkillIds: number[] = [];
  search = '';
  dropdownVisible = false;

  get filtered(): SkillOption[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return [];
    return this.allSkills.filter(s =>
      s.name.toLowerCase().includes(q) &&
      !this.selectedSkillIds.includes(s.id)
    );
  }

  constructor(
    private svc: JobSeekerService,
    private lookup: Lookup,
    private toastr: ToastrService,
  ) {}

  load(profile: WritableSignal<UserProfileData>) {
    forkJoin({ allSkills: this.lookup.getSkills(), userSkills: this.svc.getSkills() }).subscribe({
      next: ({ allSkills, userSkills }) => {
        this.allSkills = allSkills;
        this.selectedSkillIds = userSkills
          .map((s: any) => s.id ?? s.skillId)
          .filter((id: any): id is number => typeof id === 'number');

        const names = allSkills
          .filter(s => this.selectedSkillIds.includes(s.id))
          .map(s => s.name);

        profile.update((p: UserProfileData) => ({ ...p, skills: names.length ? names : userSkills.map((s: any) => s.name).filter(Boolean) }));
      },
      error: (err) => console.error('Failed to load skills', err),
    });
  }

  select(skill: SkillOption, profile: WritableSignal<UserProfileData>) {
    if (this.selectedSkillIds.includes(skill.id)) return;
    this.sync([...this.selectedSkillIds, skill.id], profile);
    this.search = '';
    this.dropdownVisible = false;
  }

  remove(skillName: string, profile: WritableSignal<UserProfileData>) {
    const skill = this.allSkills.find(s => s.name === skillName);
    if (!skill) return;
    this.sync(this.selectedSkillIds.filter(id => id !== skill.id), profile);
  }

  onBlur() { setTimeout(() => this.dropdownVisible = false, 150); }

  private sync(nextIds: number[], profile: WritableSignal<UserProfileData>) {
    this.svc.syncSkills(nextIds).subscribe({
      next: () => {
        this.selectedSkillIds = nextIds;
        profile.update((p: UserProfileData) => ({
          ...p,
          skills: this.allSkills.filter(s => nextIds.includes(s.id)).map(s => s.name),
        }));
      },
      error: () => this.toastr.error('Failed to update skills.'),
    });
  }
}
