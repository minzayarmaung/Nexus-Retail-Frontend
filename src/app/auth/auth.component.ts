import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LanguageSwitcherComponent } from '../i18n/language-switcher.component';
import { TranslatePipe } from '../i18n/translate.pipe';
import { ThemeToggleComponent } from '../core/theme/theme-toggle.component';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, RouterLink, TranslatePipe, LanguageSwitcherComponent, ThemeToggleComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  protected readonly year = new Date().getFullYear();
}
