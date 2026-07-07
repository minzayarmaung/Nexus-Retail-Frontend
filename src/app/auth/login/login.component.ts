import { Component, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TranslatePipe } from '../../i18n/translate.pipe';

import { PasswordInputComponent } from '../../shared/form/password-input.component';

import { ToastService } from '../../core/toast/toast.service';

import { SessionService } from '../../core/user/session.service';

import { validateInternalReturnUrl } from '../../core/auth/auth-return-url';

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

  private readonly route = inject(ActivatedRoute);

  private readonly toast = inject(ToastService);



  identity = '';

  password = '';

  readonly loading = signal(false);



  async login(): Promise<void> {

    if (this.loading()) return;

    const identity = (this.identity ?? '').trim();

    const password = (this.password ?? '').trim();

    if (!identity) {

      this.toast.error('Username or email is required');

      return;

    }

    if (!password) {

      this.toast.error('Password is required');

      return;

    }



    this.loading.set(true);

    try {

      await this.session.login({ identity, password });

      this.toast.success('Login successful');

      await this.navigateAfterAuth();

    } catch (e) {

      const msg = e instanceof Error ? e.message : 'Login failed';

      this.toast.error(msg);

      this.loading.set(false);

    }

  }



  enterDemo(role: UserRole): void {

    this.session.enterDemo(role);

    void this.navigateAfterAuth();

  }



  private async navigateAfterAuth(): Promise<void> {

    const raw = this.route.snapshot.queryParamMap.get('returnUrl');

    const url = validateInternalReturnUrl(raw);

    await this.router.navigateByUrl(url ?? '/dashboard');

  }

}

