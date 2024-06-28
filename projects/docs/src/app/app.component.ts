import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'doc-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet]
})
export class AppComponent { }
