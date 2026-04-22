import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <!-- Cabecera -->
      <div class="table-header">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            @if (enableSelection) {
              <input type="checkbox" 
                     [checked]="allSelected" 
                     (change)="toggleSelectAll()"
                     class="checkbox">
            }
            <span class="text-sm text-gray-600">
              {{data.length}} registros
            </span>
          </div>
          <div class="flex gap-2">
            <button (click)="exportarCSV()" class="btn btn-sm">
              📥 Exportar
            </button>
          </div>
        </div>
      </div>
      
      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              @for (col of columns; track col.key) {
                <th class="px-4 py-2 text-left">
                  {{col.label}}
                  @if (col.sortable) {
                    <button (click)="sort(col.key)" class="sort-btn">
                      {{sortColumn === col.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}}
                    </button>
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (item of dataPaginated; track item.id; let i = $index) {
              <tr [class.selected]="estaSeleccionado(item.id)"
                  (click)="onRowClick(item)"
                  class="hover:bg-gray-50 cursor-pointer">
                
                @for (col of columns; track col.key) {
                  <td class="px-4 py-2 border-t">
                    
                    @if (col.key === 'acciones') {
                      <div class="flex gap-1">
                        <button (click)="onAccionClick(item, 'ver')" 
                                class="btn-icon btn-sm">
                          👁️
                        </button>
                        <button (click)="onAccionClick(item, 'editar')" 
                                class="btn-icon btn-sm"
                                [hidden]="!item.puedeEditar">
                          ✏️
                        </button>
                      </div>
                    }
                    
                    @else if (col.type === 'badge') {
                      <span class="badge" [style.background]="item[col.key + 'Color']">
                        {{item[col.key]}}
                      </span>
                    }
                    
                    @else if (col.type === 'date') {
                      {{item[col.key] | date:'dd/MM/yyyy'}}
                    }
                    
                    @else {
                      {{item[col.key]}}
                    }
                    
                  </td>
                }
                
              </tr>
            }
          </tbody>
        </table>
      </div>
      
      <!-- Paginación -->
      @if (totalPages > 1) {
        <div class="pagination">
          <button (click)="prevPage()" [disabled]="currentPage === 0">←</button>
          <span>Página {{currentPage + 1}} de {{totalPages}}</span>
          <button (click)="nextPage()" [disabled]="currentPage === totalPages - 1">→</button>
        </div>
      }
    </div>
  `
})
export class SmartTableComponent {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() loading = false;
  @Input() pageSize = 20;
  @Input() enableSelection = false;
  
  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() actionClick = new EventEmitter<{item: any, action: string}>();
  
  currentPage = 0;
  selectedIds = new Set<number>();
  
  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }
  
  get dataPaginated(): any[] {
    const start = this.currentPage * this.pageSize;
    return this.data.slice(start, start + this.pageSize);
  }
  
  onRowClick(item: any): void {
    this.rowClick.emit(item);
  }
  
  onAccionClick(item: any, action: string): void {
    this.actionClick.emit({ item, action });
    event?.stopPropagation();
  }
  
  // Métodos de paginación, selección, etc...
}