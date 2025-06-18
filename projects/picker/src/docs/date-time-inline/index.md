The Inline Date Time Picker is a component that allows the user to select a date and time from a calendar that is displayed inline on the page.

# Single mode demo

The single mode allows the user to select a single date/time.

{{ NgDocActions.playground("DateTimeInline", { inputs: { selectMode: 'single' } }) }}

# Range mode demo

The range mode allows the user to select a start and end date/time. The provided/returned value is and array with exactly two elements, the first being the start date/time and the second being the end date/time.

{{ NgDocActions.playground("DateTimeInline", { inputs: { selectMode: 'range' } }) }}
