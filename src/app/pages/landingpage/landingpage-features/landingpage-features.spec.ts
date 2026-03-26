import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingpageFeatures } from './landingpage-features';

describe('LandingpageFeatures', () => {
  let component: LandingpageFeatures;
  let fixture: ComponentFixture<LandingpageFeatures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingpageFeatures]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingpageFeatures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
