import { Component } from '@angular/core';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { CoreModule } from '@abp/ng.core'; // <--- 1. Agrega este import

@Component({
  selector: 'app-root',
  template: `
    <abp-loader-bar></abp-loader-bar>
    <abp-dynamic-layout></abp-dynamic-layout>
  `,
  standalone: true,
  imports: [
    CoreModule,        // <--- 2. Agrégalo aquí (IMPORTANTE para el layout)
    ThemeSharedModule  // <--- Este ya lo tenías (IMPORTANTE para el loader-bar)
  ],
})
export class AppComponent {}