import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent } from '@ng-doc/app';

@Component({
  standalone: true,
  selector: 'owl-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, NgDocRootComponent, NgDocNavbarComponent, NgDocSidebarComponent]
})
export class AppComponent {}
