import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { SessionService } from '../../core/user/session.service';
import type { UserRole } from '../../core/user/user.model';

@Component({
  selector: 'app-login',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  login() {}

  enterDemo(role: UserRole): void {
    this.session.enterDemo(role);
    void this.router.navigate(['/dashboard']);
  }
}
