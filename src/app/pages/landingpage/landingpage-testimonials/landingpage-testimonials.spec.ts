import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingpageTestimonials } from './landingpage-testimonials';

describe('LandingpageTestimonials', () => {
  let component: LandingpageTestimonials;
  let fixture: ComponentFixture<LandingpageTestimonials>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingpageTestimonials]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingpageTestimonials);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
