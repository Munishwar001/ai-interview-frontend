import { Injectable } from '@angular/core';
import { UserState } from '../core.model';
import { BehaviorSubject } from 'rxjs';
import ls from 'localstorage-slim';
import { UserResponse } from '../core.model';
import { UserRole } from '../../shared/enums/UserRole ';

const emptyState: UserState = {
  email: '',
  fullName: '',
  userRole: null,
  isEmployerAccess: false,
  isJobSeekerAccess: false,
  loaded: false,
};

const USER_STATE_KEY = '__u_ctx';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private _userState$ = new BehaviorSubject<UserState>(this.getStoredUserState());
  
  get state() {
    return this._userState$.getValue();
  }

    get isSignedIn() {
     const state = this.state;
    return state.loaded && !!state.email;
  }

  get state$() {
    return this._userState$.asObservable();
  }

  private getStoredUserState(): UserState {
    try {
      const stored = ls.get(USER_STATE_KEY, { decrypt: true }) as UserState;
      if (stored?.email && stored.loaded === true) {
        return stored;
      }
    } catch (e) {
      console.warn('Failed to restore user state', e);
    }

    return emptyState;
  }

  private saveUserState(state: UserState): void {
    try {
      if (state.loaded && state.email) {
        ls.set(USER_STATE_KEY, state, { encrypt: true });
      } else {
        ls.remove(USER_STATE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save user state', e);
    }
  }

  setUserState(user: UserResponse) {
    const role = user.userRole as UserRole;
// console.log removed
    var state:UserState = {
      email: user.email,
      fullName: user.fullName,
      userRole: role,
      isEmployerAccess: role === UserRole.Employer,
      isJobSeekerAccess: role === UserRole.JobSeeker,
      loaded: true
    };

    this._userState$.next(state);
    this.saveUserState(state);
  }

  removeUserState() {
    this._userState$.next(emptyState);
    ls.remove(USER_STATE_KEY);
  }
}
