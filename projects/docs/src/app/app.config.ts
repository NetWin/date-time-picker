import { provideHttpClient, withFetch, withInterceptorsFromDi } from "@angular/common/http";
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from "@angular/platform-browser/animations";
import { Routes, provideRouter, withInMemoryScrolling } from "@angular/router";
import { NG_DOC_DEFAULT_PAGE_PROCESSORS, NG_DOC_DEFAULT_PAGE_SKELETON, NgDocDefaultSearchEngine, provideMainPageProcessor, provideNgDocApp, providePageSkeleton, provideSearchEngine } from "@ng-doc/app";
import { NG_DOC_ROUTING, provideNgDocContext } from "@ng-doc/generated";

const routes: Routes = [
  ...NG_DOC_ROUTING,
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
]

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: "enabled",
        anchorScrolling: "enabled"
      })
    ),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideNgDocContext(),
    provideNgDocApp(),
    provideSearchEngine(NgDocDefaultSearchEngine),
    providePageSkeleton(NG_DOC_DEFAULT_PAGE_SKELETON),
    provideMainPageProcessor(NG_DOC_DEFAULT_PAGE_PROCESSORS)
  ]
};
