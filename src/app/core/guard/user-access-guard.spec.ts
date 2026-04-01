import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { userAccessGuard } from './user-access-guard';

describe('userAccessGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => userAccessGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
