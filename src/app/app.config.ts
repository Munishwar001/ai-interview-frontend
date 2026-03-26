import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { authInterceptor } from './auth/auth-interceptor';
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
      provide: 'SocialAuthServiceConfig',  // ✅ string token works in v2.4.0
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '635416058990-pg1ilpquqvks2qqkqqsdt8154bgknobr.apps.googleusercontent.com' ,{
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