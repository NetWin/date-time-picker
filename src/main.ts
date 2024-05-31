import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OWL_DATE_TIME_LOCALE, OptionsTokens } from '../projects/picker/src/public_api';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    {
      provide: OWL_DATE_TIME_LOCALE,
      useValue: 'en-US'
    },
    {
      provide: OptionsTokens.multiYear,
      useFactory: () => ({ yearRows: 5, yearsPerRow: 3, }),
    },
  ]
})
