import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostedJobHome } from './posted-job-home';

describe('PostedJobHome', () => {
  let component: PostedJobHome;
  let fixture: ComponentFixture<PostedJobHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostedJobHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostedJobHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
