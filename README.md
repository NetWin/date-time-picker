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

See below for more information on the properties you can use.

## Properties for `owl-date-time-inline`

| Name               | Type                                      | Required | Default  | Description                                                                                                                                                                                                                                                                                                                        |
| ------------------ | ----------------------------------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pickerType`       | `both`, `calendar`, `timer`               | Optional | `both`   | Set the type of the dateTime picker. `both`: show both calendar and timer, `calendar`: only show calendar, `timer`: only show timer.                                                                                                                                                                                               |
| `startView`        | `month`, `year`, `multi-year`             | Optional | `month`  | The view that the calendar should start in.                                                                                                                                                                                                                                                                                        |
| `startAt`          | `T / null`                                | Optional | `null`   | The moment to open the picker to initially.                                                                                                                                                                                                                                                                                        |
| `endAt`            | `T / null`                                | Optional | `null`   | The the default selected time for range calendar end time                                                                                                                                                                                                                                                                          |
| `firstDayOfWeek`   | `number`                                  | Optional | `0`      | Set the first day of week. Valid value is from 0 to 6. 0: Sunday - 6: Saturday                                                                                                                                                                                                                                                     |
| `showSecondsTimer` | `boolean`                                 | Optional | `false`  | When specify it to true, it would show a timer to configure the second's value                                                                                                                                                                                                                                                     |
| `hideOtherMonths`  | `boolean`                                 | Optional | `false`  | Whether to hide dates in other months at the start or end of the current month                                                                                                                                                                                                                                                     |
| `hour12Timer`      | `boolean`                                 | Optional | `false`  | When specify it to true, the timer would be in hour12 format mode                                                                                                                                                                                                                                                                  |
| `stepHour`         | `number`                                  | Optional | `1`      | Hours to change per step.                                                                                                                                                                                                                                                                                                          |
| `stepMinute`       | `number`                                  | Optional | `1`      | Minutes to change per step.                                                                                                                                                                                                                                                                                                        |
| `stepSecond`       | `number`                                  | Optional | `1`      | Seconds to change per step.                                                                                                                                                                                                                                                                                                        |
| `disabled`         | `boolean`                                 | Optional | `false`  | When specify to true, it would disable the picker.                                                                                                                                                                                                                                                                                 |
| `dateFilter`       | `( date: T)=>boolean `                    | Optional | `null`   | A function to filter date time.                                                                                                                                                                                                                                                                                                    |
| `min`              | `<T>`                                     | Optional | `null`   | The minimum valid date time.                                                                                                                                                                                                                                                                                                       |
| `max`              | `<T>`                                     | Optional | `null`   | The maximum valid date time.                                                                                                                                                                                                                                                                                                       |
| `selectMode`       | `single`, `range`, `rangeFrom`, `rangeTo` | Optional | `single` | Specify the picker's select mode. `single`: a single value allowed, `range`: allow users to select a range of date-time, `rangeFrom`: the input would only show the 'from' value and the picker could only selects 'from' value, `rangeTo`: the input would only show the 'to' value and the picker could only selects 'to' value. |

> [!NOTE]
> There are more expored / usable components in the [previous implementation](https://github.com/danielmoncada/date-time-picker).
> In order to improve simplicity and reusability, these components (while still in the bundle as of version 18.x)
> are not recommended to be used anymore.

## Localization and DateTime Format

Localization for different languages and formats is defined by `OWL_DATE_TIME_LOCALE` and `OWL_DATE_TIME_FORMATS`.
You could learn more about this from [here](https://danielykpan.github.io/date-time-picker#locale-formats).

## License

- License: MIT

## Author

Maintained by NetWin, based on the awesome work from Daniel Moncada and Daniel Pan.
The original repo is still active, go check it out [here](https://github.com/danielmoncada/date-time-picker).
