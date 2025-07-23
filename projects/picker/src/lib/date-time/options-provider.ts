import { InjectionToken, Provider } from '@angular/core';

export function defaultOptionsFactory(): Options {
  return DefaultOptions.create();
}

export function multiYearOptionsFactory(options: Options): Options['multiYear'] {
  return options.multiYear;
}

export type Options = {
  multiYear: {
    yearsPerRow: number;
    yearRows: number;
  };
};

export class DefaultOptions {
  public static create(): Options {
    // Always return new instance
    return {
      multiYear: {
        yearRows: 7,
        yearsPerRow: 3
      }
    };
  }
}

export abstract class OptionsTokens {
  public static all = new InjectionToken<Options>('All options token');
}

export const optionsProviders: Array<Provider> = [
  {
    provide: OptionsTokens.all,
    useFactory: defaultOptionsFactory
  }
];
