import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col gap-1.5">
      <!-- Label -->
      @if (label) {
        <label class="text-sm font-medium text-gray-700">
          {{ label }}
          @if (required) {
            <span class="text-red-500">*</span>
          }
        </label>
      }

      <!-- Input wrapper -->
      <div 
        class="relative flex items-center rounded-lg border transition-all duration-200"
        [class.border-gray-300]="!focused && !error"
        [class.border-blue-500]="focused && !error"
        [class.border-red-500]="error"
        [class.bg-gray-50]="disabled"
        [class.hover:border-gray-400]="!disabled && !error"
        [class.focus-within:ring-2]="focused"
        [class.focus-within:ring-blue-500/20]="focused && !error"
        [class.focus-within:ring-red-500/20]="error"
      >
        <!-- Prefix Icon -->
        @if (prefixIcon) {
          <div class="pl-3 text-gray-400">
            <app-icon [name]="prefixIcon" [size]="'md'"></app-icon>
          </div>
        }

        <!-- Input -->
        <input
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [value]="value"
          (input)="onInputChange($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          class="flex-1 px-3 py-2.5 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 disabled:cursor-not-allowed"
          [class.pl-3]="!prefixIcon"
          [class.pr-3]="!suffixIcon && !clearable"
        />

        <!-- Suffix Icon / Clear Button -->
        @if (suffixIcon || (clearable && value)) {
          <div class="pr-3 flex items-center gap-2">
            @if (clearable && value) {
              <button
                type="button"
                (click)="clearValue()"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <app-icon name="x-circle" [size]="'sm'"></app-icon>
              </button>
            }
            @if (suffixIcon && !clearable) {
              <app-icon [name]="suffixIcon" [size]="'md'" class="text-gray-400"></app-icon>
            }
          </div>
        }
      </div>

      <!-- Help Text / Error -->
      @if (error || helpText) {
        <p class="text-xs" [class.text-red-500]="error" [class.text-gray-500]="!error">
          {{ error || helpText }}
        </p>
      }
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'url' = 'text';
  @Input() helpText?: string;
  @Input() error?: string;
  @Input() prefixIcon?: string;
  @Input() suffixIcon?: string;
  @Input() clearable = false;
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() value: string | number = '';

  @Output() valueChange = new EventEmitter<string | number>();
  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();

  focused = false;

  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | number): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    let newValue: string | number = target.value;
    
    // Convert to number if type is number
    if (this.type === 'number' && target.value) {
      newValue = parseFloat(target.value);
    }
    
    this.value = newValue;
    this.onChange(newValue);
    this.valueChange.emit(newValue);
  }

  onFocus(): void {
    this.focused = true;
    this.focus.emit();
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
    this.blur.emit();
  }

  clearValue(): void {
    this.value = '';
    this.onChange('');
    this.valueChange.emit('');
  }
}
