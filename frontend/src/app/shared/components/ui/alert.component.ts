import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      [class]="alertClasses"
      role="alert"
    >
      <!-- Icono -->
      <app-icon [name]="getIcon()" [size]="'md'" [customClass]="'flex-shrink-0'"></app-icon>

      <!-- Contenido -->
      <div class="flex-1">
        <!-- Título (opcional) -->
        @if (title) {
          <p class="font-semibold">{{ title }}</p>
        }

        <!-- Mensaje -->
        <p [class]="title ? 'text-sm opacity-90' : ''">
          {{ message }}
        </p>

        <!-- Detalles (opcional) -->
        @if (details) {
          <p class="text-sm opacity-75 mt-1">{{ details }}</p>
        }
      </div>

      <!-- Botón de cerrar (opcional) -->
      @if (dismissible) {
        <button
          (click)="dismiss.emit()"
          class="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
          aria-label="Cerrar"
        >
          <app-icon name="x" [size]="'sm'"></app-icon>
        </button>
      }
    </div>

    <!-- Auto-dismiss timer -->
    @if (autoDismiss && !isDismissed) {
      <div class="h-1 bg-black/10 rounded-b-lg overflow-hidden">
        <div
          class="h-full transition-all ease-linear"
          [style.width.%]="progress"
          [class]="progressBarClass"
        ></div>
      </div>
    }
  `
})
export class AlertComponent {
  @Input() message = '';
  @Input() title?: string;
  @Input() details?: string;
  @Input() type: AlertType = 'info';
  @Input() dismissible = true;
  @Input() autoDismiss = false;
  @Input() dismissTimeout = 5000;

  @Output() dismiss = new EventEmitter<void>();

  isDismissed = false;
  progress = 100;
  private timer?: any;

  ngOnChanges(): void {
    if (this.autoDismiss && this.dismissTimeout > 0) {
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  get alertClasses(): string {
    const baseClasses = 'flex items-start gap-3 p-4 rounded-lg border shadow-sm';

    const typeClasses: Record<AlertType, string> = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-amber-50 border-amber-200 text-amber-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return `${baseClasses} ${typeClasses[this.type]}`;
  }

  get progressBarClass(): string {
    const classes: Record<AlertType, string> = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-amber-500',
      info: 'bg-blue-500'
    };
    return classes[this.type];
  }

  getIcon(): string {
    const icons: Record<AlertType, string> = {
      success: 'check-circle',
      error: 'alert-circle',
      warning: 'alert-triangle',
      info: 'info'
    };
    return icons[this.type];
  }

  private startTimer(): void {
    this.clearTimer();
    const interval = 50;
    const decrement = (interval / this.dismissTimeout) * 100;

    this.timer = setInterval(() => {
      this.progress -= decrement;
      if (this.progress <= 0) {
        this.isDismissed = true;
        this.dismiss.emit();
        this.clearTimer();
      }
    }, interval);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
