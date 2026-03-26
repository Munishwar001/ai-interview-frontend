import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingpagePricing } from './landingpage-pricing';

describe('LandingpagePricing', () => {
  let component: LandingpagePricing;
  let fixture: ComponentFixture<LandingpagePricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingpagePricing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingpagePricing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
