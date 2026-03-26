import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingpageHero } from './landingpage-hero';

describe('LandingpageHero', () => {
  let component: LandingpageHero;
  let fixture: ComponentFixture<LandingpageHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingpageHero]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingpageHero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
