import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes, withHashLocation, withInMemoryScrolling } from '@angular/router';
import {
  NG_DOC_DEFAULT_PAGE_PROCESSORS,
  NG_DOC_DEFAULT_PAGE_SKELETON,
  NgDocDefaultSearchEngine,
  provideMainPageProcessor,
  provideNgDocApp,
  providePageSkeleton,
  provideSearchEngine
} from '@ng-doc/app';
import { NG_DOC_ROUTING, provideNgDocContext } from '@ng-doc/generated';
import { AppComponent } from './app/app.component';

const routes: Routes = [...NG_DOC_ROUTING, { path: '**', redirectTo: 'home', pathMatch: 'full' }];

const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(
      routes,
      withHashLocation(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideNgDocContext(),
    provideNgDocApp(),
    provideSearchEngine(NgDocDefaultSearchEngine),
    providePageSkeleton(NG_DOC_DEFAULT_PAGE_SKELETON),
    provideMainPageProcessor(NG_DOC_DEFAULT_PAGE_PROCESSORS)
  ]
};

bootstrapApplication(AppComponent, appConfig).catch((e) => {
  console.error('Error while booting application: ', e);
});
