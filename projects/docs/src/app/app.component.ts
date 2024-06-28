import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent } from "@ng-doc/app";

@Component({
  standalone: true,
  selector: 'doc-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    RouterLink,
    NgDocRootComponent,
    NgDocNavbarComponent,
    NgDocSidebarComponent
  ]
})
export class AppComponent { }
