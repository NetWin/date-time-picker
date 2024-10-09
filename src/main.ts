import { ApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';

const appConfig: ApplicationConfig = {
  providers: [provideAnimations()]
};

bootstrapApplication(AppComponent, appConfig).catch((e) => {
  console.error('Error while booting application: ', e);
});
