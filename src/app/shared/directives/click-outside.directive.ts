import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, EventEmitter, inject, OnDestroy, OnInit, Output, PLATFORM_ID } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  
  @Output() clickOutside = new EventEmitter<void>();
  
  private listener?: (event: MouseEvent) => void;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.listener = (event: MouseEvent) => {
      const clickedInside = this.elementRef.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.clickOutside.emit();
      }
    };
    
    document.addEventListener('click', this.listener);
  }

  ngOnDestroy(): void {
    if (this.listener) {
      document.removeEventListener('click', this.listener);
    }
  }
}
