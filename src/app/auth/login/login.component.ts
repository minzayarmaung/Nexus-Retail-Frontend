import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { PasswordInputComponent } from '../../shared/form/password-input.component';
import { ToastService } from '../../core/toast/toast.service';
import { SessionService } from '../../core/user/session.service';
import type { UserRole } from '../../core/user/user.model';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, TranslatePipe, PasswordInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  identity = '';
  password = '';
  loading = false;

  async login(): Promise<void> {
    if (this.loading) return;
    const identity = this.identity.trim();
    const password = this.password;
    if (!identity) {
      this.toast.error('Username or email is required');
      return;
    }
    if (!password.trim()) {
      this.toast.error('Password is required');
      return;
    }

    this.loading = true;
    try {
      await this.session.login({ identity, password });
      this.toast.success('Login successful');
      await this.router.navigate(['/dashboard']);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      this.toast.error(msg);
    } finally {
      this.loading = false;
    }
  }

  enterDemo(role: UserRole): void {
    this.session.enterDemo(role);
    void this.router.navigate(['/dashboard']);
  }
}
