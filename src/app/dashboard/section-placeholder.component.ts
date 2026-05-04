import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { SECTION_SLUG_TO_LABEL_KEY } from '../core/navigation/section-slugs';

@Component({
  selector: 'app-section-placeholder',
  imports: [TranslatePipe],
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
        {{ titleKey() | translate }}
      </h1>
      <p class="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600">
        {{ 'section.placeholderHint' | translate }}
      </p>
    </div>
  `
})
export class SectionPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' }
  );

  protected readonly titleKey = computed(() => {
    const s = this.slug();
    return SECTION_SLUG_TO_LABEL_KEY[s] ?? 'menu.dashboard';
  });
}
