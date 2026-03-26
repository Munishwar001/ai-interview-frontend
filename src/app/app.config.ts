import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { authInterceptor } from './auth/auth-interceptor';
import { environment } from '../../environment/environment';

import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialAuthServiceConfig ,
  GoogleInitOptions
} from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-right',
      timeOut: 3000,
    }),
    {
      provide: 'SocialAuthServiceConfig',  
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              environment.googleClientId, {
                oneTapEnabled: false,  
              } as GoogleInitOptions
            )
          }
        ],
        onError: (err: any) => {
          console.error('Social Auth Error:', err);
        }
      } as SocialAuthServiceConfig
    },
    SocialAuthService
  ]
};