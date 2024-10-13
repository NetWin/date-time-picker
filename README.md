# :date: :clock1: Angular Date/Time Picker

[![npm](https://img.shields.io/npm/v/@netwin/angular-datetime-picker.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/@netwin/angular-datetime-picker)
[![npm](https://img.shields.io/npm/dm/@netwin/angular-datetime-picker.svg)](https://www.npmjs.com/package/@netwin/angular-datetime-picker)

## How to Use

Install this library by running

```sh
npm install @netwin/angular-datetime-picker
```

Afterwards, add the global stylesheet to your styles section within your angular.json file:

```json
"styles": [
    "node_modules/@netwin/angular-datetime-picker/assets/style/picker.min.css",
    "... other styles"
]
```

To then use it, import both the `OwlDateTimeModule` and `OwlNativeDateTimeModule` in your `app.module.ts` or
in your component that wants to use it:

```typescript
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@netwin/angular-datetime-picker';

@NgModule({
  imports: [OwlDateTimeModule, OwlNativeDateTimeModule],
  ...
})
export class AppModule {}
```

or

```typescript
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@netwin/angular-datetime-picker';

@Component({
  standalone: true,
  selector: 'app-my-feature-with-datetime-picker',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [OwlDateTimeModule, OwlNativeDateTimeModule]
})
export class MyFeatureWithDatetimePickerComponent {}
```

Last but not least, simply use the picker in your HTML file like so:

```html
<owl-date-time-inline [...]="..." />
```

for more information see the [documentation](https://netwin.github.io/date-time-picker/).

## Localization and DateTime Format

Localization for different languages and formats is defined by `OWL_DATE_TIME_LOCALE` and `OWL_DATE_TIME_FORMATS`.
You could learn more about this from [here](https://danielykpan.github.io/date-time-picker#locale-formats).

## License

- License: MIT

## Author

Maintained by NetWin, based on the awesome work from Daniel Moncada and Daniel Pan.
The original repo is still active, go check it out [here](https://github.com/danielmoncada/date-time-picker).
