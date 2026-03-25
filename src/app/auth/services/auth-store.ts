import { Injectable } from '@angular/core';
import ls from 'localstorage-slim';
import { AccessTokenData } from '../auth.models';
import { LocalStorage } from '../auth.models';

const StorageString = 'atost';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
   
    private get currentStorage(): LocalStorage {
    const storedData = ls.get(StorageString, { decrypt: true }) as LocalStorage;
    // Return an empty object if nothing is found
    return storedData || { accessToken: '', refreshToken: '', accessTokenExpiration: '' } as LocalStorage;
  }

  setAccessAndRefreshToken(accessToken: string, accessTokenExpiration: string, refreshToken: string) {
    const storage: LocalStorage = {
      accessToken,
      refreshToken,
      accessTokenExpiration
    };
    ls.set(StorageString, storage, { encrypt: true });
  }

  getAccessToken(): AccessTokenData | null {
    const storage = this.currentStorage;
    if (storage.accessToken && storage.accessTokenExpiration) {
      return {
        accessToken: storage.accessToken,
        accessTokenExpiration: storage.accessTokenExpiration
      };
    }
    return null;
  }

  getRefreshToken(): string | null {
    return this.currentStorage.refreshToken || null;
  }

  clearStorage() {
    ls.remove(StorageString);
  }
}
