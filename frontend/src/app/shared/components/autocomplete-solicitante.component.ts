import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { SolicitanteService, Solicitante } from '../../modules/solicitantes/services/solicitante.service';

interface SolicitanteOption {
  id: number;
  nombreCompleto: string;
  documento: string;
  email?: string;
  telefono?: string;
  tipo: string;
  solicitante: Solicitante;
}

@Component({
  selector: 'app-autocomplete-solicitante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <!-- Label -->
      @if (label) {
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ label }}
          @if (required) {
            <span class="text-red-500">*</span>
          }
        </label>
      }
      
      <!-- Input Container -->
      <div class="relative">
        <!-- Input -->
        <div class="relative">
          <input type="text"
                 [ngModel]="searchTerm"
                 (ngModelChange)="onSearch($event)"
                 [placeholder]="placeholder"
                 [disabled]="disabled"
                 (focus)="onFocus()"
                 (blur)="onBlur()"
                 (keydown.escape)="closeDropdown()"
                 (keydown.enter)="selectFirstOption()"
                 class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                 [class.border-red-500]="error"
                 [class.focus:ring-red-500]="error">
          
          <!-- Loading Spinner -->
          @if (loading) {
            <div class="absolute right-3 top-1/2 -translate-y-1/2">
              <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          }
          
          <!-- Clear Button -->
          @if (!loading && searchTerm && !disabled) {
            <button type="button"
                    (click)="clear()"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          }
        </div>
        
        <!-- Dropdown -->
        @if (showDropdown && (options.length > 0 || searchTerm.length >= minChars)) {
          <div class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
               [class.hidden]="options.length === 0 && !loading">
            
            <!-- Loading State -->
            @if (loading) {
              <div class="px-4 py-3 text-center text-gray-500">
                <span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></span>
                Buscando...
              </div>
            }
            
            <!-- Options -->
            @if (!loading) {
              @for (option of options; track option.id) {
                <button type="button"
                        (click)="selectOption(option)"
                        class="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ option.nombreCompleto }}</p>
                     <p class="text-xs text-gray-500">
                         {{ option.tipo === 'PersonaNatural' ? 'Persona Natural' : (option.tipo === 'Empresa' ? 'Empresa' : 'Vehículo') }} 
                         • Doc: {{ option.documento }}
                       </p>
                    </div>
                    <div class="text-right">
                      @if (option.email) {
                        <p class="text-xs text-gray-500">{{ option.email }}</p>
                      }
                      @if (option.telefono) {
                        <p class="text-xs text-gray-500">{{ option.telefono }}</p>
                      }
                    </div>
                  </div>
                </button>
              }
              
              <!-- No Results -->
              @if (options.length === 0 && searchTerm.length >= minChars) {
                <div class="px-4 py-3 text-center text-gray-500">
                  <p class="text-sm">No se encontraron resultados</p>
                  @if (allowCreate) {
                    <button type="button"
                            (click)="createNew.emit()"
                            class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                      + Crear nuevo solicitante
                    </button>
                  }
                </div>
              }
            }
          </div>
        }
      </div>
      
      <!-- Error Message -->
      @if (error) {
        <p class="mt-1 text-sm text-red-600">{{ error }}</p>
      }
      
      <!-- Help Text -->
      @if (helpText && !error) {
        <p class="mt-1 text-sm text-gray-500">{{ helpText }}</p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AutocompleteSolicitanteComponent implements OnInit, OnDestroy {
  @Input() label = 'Solicitante';
  @Input() placeholder = 'Buscar por nombre o documento...';
  @Input() required = false;
  @Input() disabled = false;
  @Input() error: string | null = null;
  @Input() helpText: string | null = null;
  @Input() minChars = 2;
  @Input() allowCreate = true;
  @Input() debounceTime = 300;
  
   @Output() selected = new EventEmitter<Solicitante | null>();
   @Output() createNew = new EventEmitter<void>();
  
  searchTerm = '';
  options: SolicitanteOption[] = [];
  loading = false;
  showDropdown = false;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  constructor(private solicitanteService: SolicitanteService) {}
  
   ngOnInit(): void {
     this.searchSubject.pipe(
       debounceTime(this.debounceTime),
       distinctUntilChanged(),
       switchMap(term => {
         if (term.length < this.minChars) {
           return [];
         }
         this.loading = true;
         return this.solicitanteService.search(term);
       }),
       takeUntil(this.destroy$)
     ).subscribe({
       next: (results: Solicitante[]) => {
         this.options = results.map(r => {
           let nombreCompleto = '';
           let documento = '';
           
           if (r.tipoSolicitante === 'PersonaNatural' && r.personaNatural) {
             nombreCompleto = (r.personaNatural.nombres || '') + ' ' + (r.personaNatural.apellidos || '');
             documento = r.personaNatural.dni?.toString() || '';
           } else if (r.tipoSolicitante === 'Empresa' && r.empresa) {
             nombreCompleto = r.empresa.nombre || '';
             documento = r.empresa.ruc || '';
           } else if (r.tipoSolicitante === 'Vehiculo' && r.vehiculo) {
             const v = r.vehiculo;
             nombreCompleto = `${v.marca || ''} ${v.modelo || ''}${v.color ? ' ' + v.color : ''} - Placa: ${v.placa || ''}`;
             documento = v.placa || '';
           }
           
           return {
             id: r.id,
             nombreCompleto: nombreCompleto.trim(),
             documento,
             email: r.email || undefined,
             telefono: r.telefono || undefined,
             tipo: r.tipoSolicitante,
             solicitante: r
           };
         });
         this.loading = false;
       },
       error: () => {
         this.loading = false;
         this.options = [];
       }
     });
   }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onSearch(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }
  
  onFocus(): void {
    this.showDropdown = true;
    if (this.searchTerm.length >= this.minChars) {
      this.searchSubject.next(this.searchTerm);
    }
  }
  
  onBlur(): void {
    // Delay to allow click event on option
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }
  
   selectOption(option: SolicitanteOption): void {
     this.searchTerm = option.nombreCompleto;
     this.showDropdown = false;
     this.selected.emit(option.solicitante);
   }
  
  selectFirstOption(): void {
    if (this.options.length > 0) {
      this.selectOption(this.options[0]);
    }
  }
  
  closeDropdown(): void {
    this.showDropdown = false;
  }
  
  clear(): void {
    this.searchTerm = '';
    this.options = [];
    this.selected.emit(null);
  }
}
