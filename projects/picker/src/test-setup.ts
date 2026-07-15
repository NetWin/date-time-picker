/**
 * This whole file (and all references to it) can be removed once we go zoneless in Angular.
 *
 * @see https://github.com/angular/angular/blob/028336648c86898caee6e3600b5daadfbf86c2bf/adev/src/content/tutorials/zoneless-migration/steps/2-use-zoneless-for-tests/README.md
 */
import { provideZoneChangeDetection } from '@angular/core';
import 'zone.js';

export default [provideZoneChangeDetection()];
