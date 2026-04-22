import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <!-- Header -->
      @if (title || subtitle || headerTemplate) {
        <div [class]="headerClasses">
          @if (headerTemplate) {
            <ng-template [ngTemplateOutlet]="headerTemplate"></ng-template>
          } @else {
            <div class="flex items-center justify-between">
              <div>
                @if (title) {
                  <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                }
                @if (subtitle) {
                  <p class="text-sm text-gray-500 mt-0.5">{{ subtitle }}</p>
                }
              </div>
              @if (headerActions) {
                <div class="flex items-center gap-2">
                  <ng-content select="[card-actions]"></ng-content>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <!-- Header projection without title -->
        <div [class]="headerClasses">
          <ng-content select="[card-header]"></ng-content>
        </div>
      }

      <!-- Body -->
      <div [class]="bodyClasses">
        <ng-content></ng-content>
      </div>

      <!-- Footer -->
      @if (showFooter || footerTemplate) {
        <div [class]="footerClasses">
          @if (footerTemplate) {
            <ng-template [ngTemplateOutlet]="footerTemplate"></ng-template>
          } @else {
            <ng-content select="[card-footer]"></ng-content>
          }
        </div>
      }
    </div>
  `
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() bordered = false;
  @Input() hoverable = false;
  @Input() noPadding = false;
  @Input() headerActions = false;
  @Input() showFooter = true; // Changed to true by default

  @ContentChild('cardHeaderTemplate') headerTemplate?: TemplateRef<any>;
  @ContentChild('cardFooterTemplate') footerTemplate?: TemplateRef<any>;

  get cardClasses(): string {
    let classes = 'bg-white rounded-xl shadow-sm border';
    
    if (this.bordered) {
      classes += ' border-gray-200';
    } else {
      classes += ' border-transparent';
    }
    
    if (this.hoverable) {
      classes += ' transition-shadow hover:shadow-md cursor-pointer';
    }
    
    return classes;
  }

  get headerClasses(): string {
    let classes = 'px-6 py-4 border-b';
    
    if (this.bordered) {
      classes += ' border-gray-200';
    } else {
      classes += ' border-transparent';
    }
    
    return classes;
  }

  get bodyClasses(): string {
    let classes = 'p-6';
    
    if (this.noPadding) {
      classes = 'p-0';
    }
    
    return classes;
  }

  get footerClasses(): string {
    let classes = 'px-6 py-4 border-t';
    
    if (this.bordered) {
      classes += ' border-gray-200';
    } else {
      classes += ' border-transparent';
    }
    
    return classes;
  }
}
