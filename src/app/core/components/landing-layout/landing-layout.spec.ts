import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingLayout } from './landing-layout';

describe('LandingLayout', () => {
  let component: LandingLayout;
  let fixture: ComponentFixture<LandingLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingLayout, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 3 nav links', () => {
    expect(component.navLinks.length).toBe(3);
  });

  it('should toggle dark mode', () => {
    expect(component.isDark).toBeFalse();
    component.toggleTheme();
    expect(component.isDark).toBeTrue();
  });
});