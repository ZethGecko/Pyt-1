import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

export interface SelectOption {
  id: number | string;
  label: string;
  subtitle?: string;
  disabled?: boolean;
  icon?: string;
  data?: any;
}

@Component({
  selector: 'app-select-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="select-container" [class.disabled]="disabled">
      @if (label) {
        <label class="select-label">
          {{ label }}
          @if (required) { <span class="required">*</span> }
        </label>
      }

      <div 
        class="select-trigger"
        [class.open]="isOpen"
        [class.has-value]="selectedOption"
        (click)="toggleDropdown()">
        
        @if (selectedOption) {
          <div class="selected-value">
            @if (selectedOption.icon) { <span class="option-icon">{{ selectedOption.icon }}</span> }
            <span class="option-label">{{ selectedOption.label }}</span>
          </div>
        } @else {
          <span class="placeholder">{{ placeholder }}</span>
        }
        
        <span class="dropdown-arrow" [class.open]="isOpen">▼</span>
      </div>

      @if (isOpen) {
        <div class="dropdown-overlay" (click)="closeDropdown()"></div>
        <div class="dropdown-menu">
          @if (searchable) {
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input 
                type="text"
                [(ngModel)]="searchText"
                (input)="onSearch()"
                [placeholder]="searchPlaceholder"
                #searchInput>
            </div>
          }

          <div class="options-list">
            @if (isLoading) {
              <div class="loading-state">
                <span class="spinner"></span>
                <span>Cargando...</span>
              </div>
            } @else if (filteredOptions.length === 0) {
              <div class="empty-state">
                @if (searchText) {
                  <span>No se encontraron resultados para "{{ searchText }}"</span>
                } @else {
                  <span>No hay opciones disponibles</span>
                }
              </div>
            } @else {
              @for (option of filteredOptions; track option.id) {
                <div 
                  class="option-item"
                  [class.selected]="isSelected(option)"
                  [class.disabled]="option.disabled"
                  (click)="selectOption(option)">
                  <span class="option-label">{{ option.label }}</span>
                  @if (isSelected(option)) { <span class="check-icon">✓</span> }
                </div>
              }
            }
          </div>

          @if (showFooter && !selectedOption) {
            <div class="dropdown-footer" (click)="onAddNew()">
              <span>+ {{ addNewText }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .select-container {
      position: relative;
      width: 100%;
    }
    .select-container.disabled { opacity: 0.6; pointer-events: none; }
    .select-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }
    .required { color: #ef4444; margin-left: 2px; }
    .select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background-color: white;
      cursor: pointer;
      min-height: 42px;
      transition: all 0.2s;
    }
    .select-trigger:hover { border-color: #9ca3af; }
    .select-trigger.open {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    .selected-value { display: flex; align-items: center; gap: 8px; flex: 1; overflow: hidden; }
    .option-label { font-size: 14px; color: #111827; }
    .placeholder { color: #9ca3af; font-size: 14px; }
    .dropdown-arrow { font-size: 12px; color: #6b7280; transition: transform 0.2s; }
    .dropdown-arrow.open { transform: rotate(180deg); }
    .dropdown-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 99;
    }
    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0; right: 0;
      background-color: white;
      border: 1px solid #3b82f6;
      border-top: none;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 100;
      max-height: 280px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .search-box {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
      background-color: #f9fafb;
    }
    .search-icon { font-size: 16px; margin-right: 8px; }
    .search-box input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 14px;
      outline: none;
    }
    .options-list { flex: 1; overflow-y: auto; }
    .loading-state, .empty-state {
      padding: 24px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .spinner {
      display: inline-block;
      width: 16px; height: 16px;
      border: 2px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .option-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      cursor: pointer;
      transition: background-color 0.15s;
    }
    .option-item:hover { background-color: #f3f4f6; }
    .option-item.selected { background-color: #eff6ff; color: #1e40af; }
    .option-item.disabled { opacity: 0.5; cursor: not-allowed; }
    .option-content { flex: 1; overflow: hidden; }
    .check-icon { color: #3b82f6; font-weight: bold; margin-left: auto; }
    .dropdown-footer {
      padding: 12px;
      border-top: 1px solid #e5e7eb;
      background-color: #f9fafb;
      cursor: pointer;
      font-size: 14px;
      color: #3b82f6;
      font-weight: 500;
      text-align: center;
    }
    .dropdown-footer:hover { background-color: #eff6ff; }
  `]
})
export class SelectAutocompleteComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() label?: string;
  @Input() placeholder: string = 'Seleccionar...';
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() addNewText: string = 'Agregar nuevo';
  @Input() options: SelectOption[] = [];
  @Input() selectedId?: number | string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() searchable = true;
  @Input() showFooter = false;
  @Input() loadOptions?: (query: string) => Promise<SelectOption[]>;
  @Input() externalSearch = false;

  @Output() selectionChange = new EventEmitter<SelectOption | null>();
  @Output() addNew = new EventEmitter<string>();

  @ViewChild('searchInput') searchInput?: ElementRef;

  isOpen = false;
  isLoading = false;
  searchText = '';
  filteredOptions: SelectOption[] = [];
  selectedOption: SelectOption | null = null;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.filteredOptions = [...this.options];
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => this.onSearchQuery(query));

    if (this.selectedId) {
      this.selectedOption = this.options.find(o => o.id === this.selectedId) || null;
    }
  }

  ngAfterViewChecked(): void {
    if (this.isOpen && this.searchable) {
      setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.externalSearch && this.loadOptions) {
      this.loadOptions('').then(options => this.filteredOptions = options);
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.searchText = '';
    this.filteredOptions = [...this.options];
  }

  onSearch(): void {
    this.searchSubject.next(this.searchText);
  }

  private onSearchQuery(query: string): void {
    if (this.loadOptions && this.externalSearch) {
      this.isLoading = true;
      this.loadOptions(query).then(options => {
        this.filteredOptions = options;
        this.isLoading = false;
      });
    } else {
      if (!query) {
        this.filteredOptions = [...this.options];
      } else {
        const queryLower = query.toLowerCase();
        this.filteredOptions = this.options.filter(o => 
          o.label.toLowerCase().includes(queryLower) ||
          o.subtitle?.toLowerCase().includes(queryLower)
        );
      }
    }
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;
    this.selectedOption = option;
    this.selectedId = option.id;
    this.selectionChange.emit(option);
    this.closeDropdown();
  }

  isSelected(option: SelectOption): boolean {
    return this.selectedId === option.id;
  }

  onAddNew(): void {
    this.addNew.emit(this.searchText);
    this.closeDropdown();
  }

  setValue(id: number | string): void {
    const option = this.options.find(o => o.id === id);
    if (option) {
      this.selectedOption = option;
      this.selectedId = id;
    }
  }

  clear(): void {
    this.selectedOption = null;
    this.selectedId = undefined;
    this.selectionChange.emit(null);
  }
}
