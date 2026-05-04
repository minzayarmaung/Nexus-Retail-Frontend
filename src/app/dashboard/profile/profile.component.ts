import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslateService } from '../../core/i18n/translate.service';
import { ToastService } from '../../core/toast/toast.service';
import {
  AVATAR_IDS,
  type AvatarId,
  avatarDataUrl,
  resolveAvatarId
} from '../../core/user/avatars';
import { SessionService } from '../../core/user/session.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly tr = inject(TranslateService);

  protected readonly user = this.session.user;
  protected readonly avatars = AVATAR_IDS;
  protected readonly avatarUrl = avatarDataUrl;

  protected readonly draftUsername = signal('');
  protected readonly draftAvatar = signal<AvatarId>(resolveAvatarId(undefined));

  constructor() {
    const u = this.session.user();
    if (u) {
      this.draftUsername.set(u.username);
      this.draftAvatar.set(resolveAvatarId(u.avatarId));
    }
  }

  saveProfile(): void {
    const name = this.draftUsername().trim();
    if (name.length < 3 || name.length > 32) {
      return;
    }
    this.session.updateProfile({
      username: name,
      avatarId: this.draftAvatar()
    });
    this.toast.success(this.tr.instant('profile.savedToast'));
  }
}
