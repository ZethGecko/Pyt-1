import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { IconComponent } from './icon.component';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
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

      <!-- Select wrapper -->
      <div class="relative">
        <button
          type="button"
          [disabled]="disabled"
          (click)="toggleDropdown()"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-200 text-left"
          [class.border-gray-300]="!isOpen && !error"
          [class.border-blue-500]="isOpen && !error"
          [class.border-red-500]="error"
          [class.bg-gray-50]="disabled"
          [class.hover:border-gray-400]="!disabled && !error"
        >
          <span [class.text-gray-400]="!selectedOption" [class.text-gray-900]="selectedOption">
            {{ selectedOption?.label || placeholder }}
          </span>
          <app-icon 
            [name]="isOpen ? 'chevron-up' : 'chevron-down'" 
            [size]="'md'"
            class="text-gray-400 transition-transform"
            [class.rotate-180]="isOpen"
          ></app-icon>
        </button>

        <!-- Dropdown -->
        @if (isOpen) {
          <div class="absolute z-50 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-auto">
            @for (option of options; track option.value) {
              <button
                type="button"
                [disabled]="option.disabled"
                (click)="selectOption(option)"
                class="w-full px-3 py-2.5 text-left transition-colors flex items-center justify-between"
                [class.bg-blue-50]="option.value === value"
                [class.text-blue-700]="option.value === value"
                [class.hover:bg-gray-50]="option.value !== value"
                [class.cursor-not-allowed]="option.disabled"
                [class.opacity-50]="option.disabled"
              >
                {{ option.label }}
                @if (option.value === value) {
                  <app-icon name="check" [size]="'sm'" class="text-blue-600"></app-icon>
                }
              </button>
            }

            @if (options.length === 0) {
              <div class="px-3 py-4 text-center text-gray-500 text-sm">
                No hay opciones disponibles
              </div>
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
export class SelectComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder = 'Seleccionar...';
  @Input() options: SelectOption[] = [];
  @Input() helpText?: string;
  @Input() error?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() value: string | number | null = null;

  @Output() valueChange = new EventEmitter<string | number>();
  @Output() open = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  isOpen = false;

  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  get selectedOption(): SelectOption | undefined {
    return this.options.find(opt => opt.value === this.value);
  }

  writeValue(value: string | number): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.open.emit();
    } else {
      this.close.emit();
    }
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    this.value = option.value;
    this.onChange(option.value);
    this.valueChange.emit(option.value);
    this.isOpen = false;
    this.close.emit();
    this.onTouched();
  }
}
