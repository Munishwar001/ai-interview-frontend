import { TestBed } from '@angular/core/testing';

import { PostJob } from './post-job';

describe('PostJob', () => {
  let service: PostJob;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostJob);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
