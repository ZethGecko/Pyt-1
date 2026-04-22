import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 z-50 bg-black/50 transition-opacity"
        [class.opacity-0]="!animate"
        [class.opacity-100]="animate"
        (click)="closeOnBackdrop && close.emit()"
      ></div>

      <!-- Modal -->
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          class="bg-white rounded-2xl shadow-xl w-full pointer-events-auto transform transition-all duration-300"
          [class.scale-95]="!animate"
          [class.scale-100]="animate"
          [class.opacity-0]="!animate"
          [class.opacity-100]="animate"
          [style.max-width]="maxWidth"
          [style.max-height]="maxHeight"
        >
          <!-- Header -->
          @if (showHeader) {
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                @if (title) {
                  <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
                }
                @if (subtitle) {
                  <p class="text-sm text-gray-500 mt-0.5">{{ subtitle }}</p>
                }
              </div>
              @if (showClose) {
                <button 
                  (click)="close.emit()"
                  class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <app-icon name="x" [size]="'md'"></app-icon>
                </button>
              }
            </div>
          }

          <!-- Body -->
          <div 
            class="px-6 py-4 overflow-y-auto"
            [style.max-height]="bodyMaxHeight"
          >
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          @if (showFooter) {
            <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <ng-content select="[modal-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() maxWidth = '32rem';
  @Input() maxHeight = '90vh';
  @Input() bodyMaxHeight = '60vh';
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() showClose = true;
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;

  @Output() close = new EventEmitter<void>();

  animate = false;
  private escapeHandler?: (e: KeyboardEvent) => void;

  ngOnInit(): void {
    if (this.closeOnEscape) {
      this.escapeHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close.emit();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);
    }
  }

  ngOnDestroy(): void {
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      setTimeout(() => {
        this.animate = true;
        document.body.style.overflow = 'hidden';
      }, 10);
    } else {
      this.animate = false;
      document.body.style.overflow = '';
    }
  }
}
