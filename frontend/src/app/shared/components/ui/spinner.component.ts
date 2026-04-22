import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
      [class]="sizeClasses"
      [style.color]="color"
      role="status"
    >
      <span class="sr-only">{{ text || 'Cargando...' }}</span>
    </div>
  `
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color?: string;
  @Input() text?: string;

  get sizeClasses(): string {
    const classes: Record<string, string> = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };
    return classes[this.size];
  }
}

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    @if (isLoading) {
      <div class="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm rounded-lg">
        <app-spinner [size]="size" [color]="color"></app-spinner>
        @if (text) {
          <p class="mt-3 text-sm text-gray-600">{{ text }}</p>
        }
      </div>
    }
  `
})
export class LoadingOverlayComponent {
  @Input() isLoading = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color?: string;
  @Input() text?: string;
}
