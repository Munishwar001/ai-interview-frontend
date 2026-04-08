import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeEnhancer } from './resume-enhancer';

describe('ResumeEnhancer', () => {
  let component: ResumeEnhancer;
  let fixture: ComponentFixture<ResumeEnhancer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeEnhancer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeEnhancer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
