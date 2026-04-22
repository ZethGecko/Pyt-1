import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { CategoriaTransporteService, CategoriaTransporteResponse } from '../services/categoria-transporte.service';
import { TipoTransporteService, TipoTransporteResponse, SubtipoTransporteResponse, SubtipoTransporteCreateRequest } from '../services/tipo-transporte.service';
import { SubtipoTransporteService } from '../services/subtipo-transporte.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NotificationService } from '../../../shared/services/notification.service';

interface Categoria {
  id: number;
  nombre: string;
  tipos: Tipo[];
}

interface Tipo {
  id: number;
  nombre: string;
  categoriaId: number;
  subtipos: Subtipo[];
}

interface Subtipo {
  id: number;
  nombre: string;
  tipoId: number;
}

@Component({
  selector: 'app-gestion-tipos-transporte',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-6">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <a routerLink="/app/configuracion" class="header-back">
            <app-icon name="arrow-left" size="md"></app-icon>
          </a>
          <div class="header-text">
            <h1 class="page-title">Tipos de Transporte</h1>
            <p class="page-subtitle">Gestiona categorías, tipos y subtipos de transporte</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions-row">
        <button (click)="abrirModalCategoria()" class="btn btn-primary">
          <app-icon name="folder-plus" size="sm"></app-icon>
          Nueva Categoría
        </button>
        <button (click)="abrirModalTipo()" class="btn btn-indigo" [disabled]="categorias.length === 0">
          <app-icon name="plus" size="sm"></app-icon>
          Nuevo Tipo
        </button>
        <button (click)="abrirModalSubtipo()" class="btn btn-purple" [disabled]="!tieneTiposConCategoria()">
          <app-icon name="list-plus" size="sm"></app-icon>
          Nuevo Subtipo
        </button>
      </div>

      <!-- Loading -->
      @if (cargando) {
        <div class="loading-state">
          <app-icon name="refresh" size="lg" customClass="animate-spin text-blue-500"></app-icon>
          <span>Cargando...</span>
        </div>
      } @else {
        <!-- Categories Section -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title">
              <app-icon name="folder" size="md" customClass="text-blue-500"></app-icon>
              <h2>Categorías</h2>
              <span class="count-badge">{{ categorias.length }}</span>
            </div>
          </div>

          <div class="tree-grid">
            @for (categoria of categorias; track categoria.id) {
              <div class="tree-item category-item">
                <div class="tree-item-header">
                  <div class="tree-item-info">
                    <span class="tree-item-name">{{ categoria.nombre }}</span>
                  </div>
                  <div class="action-buttons">
                    <button class="action-btn edit" (click)="editarCategoria(categoria)" title="Editar">
                      <app-icon name="edit" size="sm"></app-icon>
                    </button>
                    <button class="action-btn delete" (click)="eliminarCategoria(categoria)" title="Eliminar">
                      <app-icon name="trash-2" size="sm"></app-icon>
                    </button>
                  </div>
                </div>

                <!-- Tipos inside Category -->
                <div class="tree-children">
                  @for (tipo of categoria.tipos; track tipo.id) {
                    <div class="tree-item tipo-item">
                      <div class="tree-item-header">
                        <div class="tree-item-info">
                          <span class="tree-item-name">{{ tipo.nombre }}</span>
                        </div>
                        <div class="action-buttons">
                          <button class="action-btn edit" (click)="editarTipo(tipo, categoria)" title="Editar">
                            <app-icon name="edit" size="sm"></app-icon>
                          </button>
                          <button class="action-btn delete" (click)="eliminarTipo(tipo, categoria)" title="Eliminar">
                            <app-icon name="trash-2" size="sm"></app-icon>
                          </button>
                        </div>
                      </div>

                      <!-- Subtipos inside Tipo -->
                      <div class="tree-children">
                        @for (subtipo of tipo.subtipos; track subtipo.id) {
                          <div class="tree-item subtipo-item">
                            <div class="tree-item-header">
                              <div class="tree-item-info">
                                <span class="tree-item-name">{{ subtipo.nombre }}</span>
                              </div>
                              <div class="action-buttons">
                                <button class="action-btn edit" (click)="editarSubtipo(subtipo, tipo)" title="Editar">
                                  <app-icon name="edit" size="sm"></app-icon>
                                </button>
                                <button class="action-btn delete" (click)="eliminarSubtipo(subtipo, tipo)" title="Eliminar">
                                  <app-icon name="trash-2" size="sm"></app-icon>
                                </button>
                              </div>
                            </div>
                          </div>
                        } @empty {
                          <div class="empty-children">Sin subtipos</div>
                        }
                      </div>
                    </div>
                  } @empty {
                    <div class="empty-children">Sin tipos</div>
                  }
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <app-icon name="folder" size="xl" customClass="text-gray-300"></app-icon>
                <p>No hay categorías registradas</p>
                <button class="btn btn-primary btn-sm" (click)="abrirModalCategoria()">
                  <app-icon name="plus" size="sm"></app-icon>
                  Crear primera categoría
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Modal Categoría -->
    @if (mostrarModalCategoria) {
      <div class="modal-overlay" (click)="cerrarModalCategoria()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <app-icon name="folder" size="md" customClass="mr-2 text-blue-500"></app-icon>
              {{ modoEditarCategoria ? 'Editar' : 'Nueva' }} Categoría
            </h2>
            <button class="modal-close" (click)="cerrarModalCategoria()">
              <app-icon name="x" size="sm"></app-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" [(ngModel)]="formCategoria.nombre" class="form-input" placeholder="Ej: Personas, Mercancía">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModalCategoria()">Cancelar</button>
            <button class="btn btn-primary" (click)="guardarCategoria()">
              {{ modoEditarCategoria ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Tipo -->
    @if (mostrarModalTipo) {
      <div class="modal-overlay" (click)="cerrarModalTipo()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <app-icon name="layers" size="md" customClass="mr-2 text-indigo-500"></app-icon>
              {{ modoEditarTipo ? 'Editar' : 'Nuevo' }} Tipo
            </h2>
            <button class="modal-close" (click)="cerrarModalTipo()">
              <app-icon name="x" size="sm"></app-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Categoría *</label>
              <select [(ngModel)]="formTipo.categoriaId" class="form-input">
                <option value="">Seleccionar categoría</option>
                @for (cat of categorias; track cat.id) {
                  <option [value]="cat.id">{{ cat.nombre }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" [(ngModel)]="formTipo.nombre" class="form-input" placeholder="Ej: General, Regular">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModalTipo()">Cancelar</button>
            <button class="btn btn-indigo" (click)="guardarTipo()">
              {{ modoEditarTipo ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Subtipo -->
    @if (mostrarModalSubtipo) {
      <div class="modal-overlay" (click)="cerrarModalSubtipo()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <app-icon name="list" size="md" customClass="mr-2 text-purple-500"></app-icon>
              {{ modoEditarSubtipo ? 'Editar' : 'Nuevo' }} Subtipo
            </h2>
            <button class="modal-close" (click)="cerrarModalSubtipo()">
              <app-icon name="x" size="sm"></app-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Categoría *</label>
              <select [(ngModel)]="filtroModalCategoria" (change)="onCategoriaChange()" class="form-input">
                <option value="">Seleccionar categoría</option>
                @for (cat of categorias; track cat.id) {
                  <option [value]="cat.id">{{ cat.nombre }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Tipo *</label>
              <select [(ngModel)]="formSubtipo.tipoId" class="form-input" [disabled]="!filtroModalCategoria">
                <option value="">Seleccionar tipo</option>
                @for (tipo of getTiposPorCategoria(filtroModalCategoria); track tipo.id) {
                  <option [value]="tipo.id">{{ tipo.nombre }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" [(ngModel)]="formSubtipo.nombre" class="form-input" placeholder="Ej: Urbano, Interurbano">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModalSubtipo()">Cancelar</button>
            <button class="btn btn-purple" (click)="guardarSubtipo()">
              {{ modoEditarSubtipo ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `.page-header { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header-content { display: flex; align-items: center; gap: 12px; }
    .header-back { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #f3f4f6; color: #6b7280; }
    .header-back:hover { background: #e5e7eb; }
    .page-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { font-size: 14px; color: #6b7280; margin: 4px 0 0 0; }

    .actions-row { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover:not(:disabled) { background: #1d4ed8; }
    .btn-indigo { background: #4f46e5; color: white; }
    .btn-indigo:hover:not(:disabled) { background: #4338ca; }
    .btn-purple { background: #7c3aed; color: white; }
    .btn-purple:hover:not(:disabled) { background: #6d28d9; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
    .btn-secondary:hover:not(:disabled) { background: #e5e7eb; }
    .btn-sm { padding: 8px 12px; font-size: 13px; }

    .section-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
    .section-header { padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
    .section-title { display: flex; align-items: center; gap: 8px; }
    .section-title h2 { font-size: 16px; font-weight: 600; color: #111827; margin: 0; }
    .count-badge { background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }

    .tree-grid { padding: 16px; }
    .tree-item { margin-bottom: 8px; }
    .tree-item-header { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: 8px; }
    .category-item > .tree-item-header { background: #eff6ff; border: 1px solid #bfdbfe; }
    .tipo-item > .tree-item-header { background: #eef2ff; border: 1px solid #c7d2fe; }
    .subtipo-item > .tree-item-header { background: #f5f3ff; border: 1px solid #ddd6fe; }
    .tree-item-info { display: flex; align-items: center; gap: 8px; }
    .tree-item-name { font-weight: 500; color: #111827; }
    .tree-item-actions { display: flex; gap: 4px; }
    .tree-children { margin-left: 24px; margin-top: 8px; }
    .empty-children { padding: 12px; text-align: center; color: #9ca3af; font-size: 13px; font-style: italic; }

    .action-buttons { display: flex; align-items: center; gap: 0.5rem; flex-wrap: nowrap; }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all 0.2s;
      border: 1px solid transparent;
      cursor: pointer;
      width: auto;
      min-width: 32px;
      height: 32px;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .action-btn.edit {
      background-color: #dbeafe;
      color: #2563eb;
      border-color: #bfdbfe;

      &:hover:not(:disabled) {
        background-color: #bfdbfe;
      }
    }

    .action-btn.delete {
      background-color: #fee2e2;
      color: #b91c1c;
      border-color: #fecaca;

      &:hover:not(:disabled) {
        background-color: #fecaca;
      }
    }

    .btn-text {
      display: none;
      font-size: 0.75rem;

      @media (min-width: 640px) {
        display: inline;
      }
    }

    .empty-state { text-align: center; padding: 40px; color: #6b7280; }
    .empty-state p { margin: 12px 0; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 12px; color: #6b7280; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
    .modal-content { background: white; border-radius: 16px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb; }
    .modal-header h2 { display: flex; align-items: center; font-size: 18px; font-weight: 600; margin: 0; }
    .modal-close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; cursor: pointer; }
    .modal-close:hover { background: #f3f4f6; }
    .modal-body { padding: 20px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid #e5e7eb; background: #f9fafb; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .form-input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
    .form-input:disabled { background: #f3f4f6; }
  `]
})
export class GestionTiposTransporteComponent implements OnInit {
  categorias: Categoria[] = [];
  cargando = false;

  // Modal states
  mostrarModalCategoria = false;
  mostrarModalTipo = false;
  mostrarModalSubtipo = false;

  // Edit modes
  modoEditarCategoria = false;
  modoEditarTipo = false;
  modoEditarSubtipo = false;

  // Forms
  formCategoria = { nombre: '' };
  formTipo = { nombre: '', categoriaId: '' as any };
  formSubtipo = { nombre: '', tipoId: '' as any };

  // For subtipo modal
  filtroModalCategoria = '' as any;

  // Editing references
  categoriaEditando: Categoria | null = null;
  tipoEditando: Tipo | null = null;
  categoriaDelTipo: Categoria | null = null;
  subtipoEditando: Subtipo | null = null;
  tipoDelSubtipo: Tipo | null = null;

  constructor(
    private router: Router,
    private categoriaService: CategoriaTransporteService,
    private tipoService: TipoTransporteService,
    private subtipoService: SubtipoTransporteService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;

    this.categoriaService.listarTodos().subscribe({
      next: (categoriasBackend) => {
        if (!categoriasBackend || categoriasBackend.length === 0) {
          this.categorias = [];
          this.cargando = false;
          return;
        }

        const categoriasMapeadas: Categoria[] = categoriasBackend.map(cat => ({
          id: cat.id,
          nombre: cat.nombre,
          tipos: []
        }));

        const observablesTiposPorCategoria = categoriasMapeadas.map(categoria =>
          this.tipoService.listarPorCategoria(categoria.id).pipe(
            map((tiposBackend) => ({
              categoriaId: categoria.id,
               tipos: tiposBackend.map(tb => ({
                 id: tb.id,
                 nombre: tb.nombre,
                 categoriaId: tb.categoriaTransporte?.id || categoria.id,
                 subtipos: []
               }))
            })),
            catchError((err) => {
              console.error(`Error cargando tipos de categoría ${categoria.id}:`, err);
              return of({
                categoriaId: categoria.id,
                tipos: [] as any[]
              });
            })
          )
        );

        forkJoin(observablesTiposPorCategoria).subscribe({
          next: (resultadosTipos) => {
            resultadosTipos.forEach((resultado) => {
              const categoria = categoriasMapeadas.find(c => c.id === resultado.categoriaId);
              if (categoria) {
                categoria.tipos = resultado.tipos;
              }
            });

            const todosLosTipos: Array<{tipo: any, categoria: Categoria}> = [];
            categoriasMapeadas.forEach(cat => {
              cat.tipos.forEach(tipo => {
                todosLosTipos.push({tipo, categoria: cat});
              });
            });

            if (todosLosTipos.length === 0) {
              this.categorias = categoriasMapeadas;
              this.cargarSubtiposParaCategorias(categoriasMapeadas);
              return;
            }

            const observablesSubtiposPorTipo = todosLosTipos.map(({tipo, categoria}) =>
              this.subtipoService.getByTipoTransporte(tipo.id).pipe(
                map((subtiposBackend) => ({
                  tipoId: tipo.id,
                  subtipos: subtiposBackend.map(sb => ({
                    id: sb.id,
                    nombre: sb.nombre,
                    tipoId: sb.tipoTransporte?.id || tipo.id
                  }))
                })),
                catchError((err) => {
                  console.error(`Error cargando subtipos del tipo ${tipo.id}:`, err);
                  return of({
                    tipoId: tipo.id,
                    subtipos: [] as any[]
                  });
                })
              )
            );

            forkJoin(observablesSubtiposPorTipo).subscribe({
              next: (resultadosSubtipos) => {
                resultadosSubtipos.forEach(({tipoId, subtipos}) => {
                  const categoria = categoriasMapeadas.find(c => c.tipos.some(t => t.id === tipoId));
                  if (categoria) {
                    const tipo = categoria.tipos.find(t => t.id === tipoId);
                    if (tipo) {
                      tipo.subtipos = subtipos;
                    }
                  }
                });

                this.categorias = categoriasMapeadas;
                this.cargando = false;
                this.changeDetectorRef.detectChanges();
              },
              error: (err) => {
                console.error('Error cargando subtipos:', err);
                this.categorias = categoriasMapeadas;
                this.cargando = false;
                this.changeDetectorRef.detectChanges();
              }
            });
          },
          error: (err) => {
            console.error('Error cargando tipos:', err);
            this.notificationService.error('Error al cargar los tipos de transporte', 'Error');
            this.cargando = false;
            this.changeDetectorRef.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error cargando categorías:', err);
        this.notificationService.error('Error al cargar las categorías de transporte', 'Error');
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  cargarSubtiposParaCategorias(categorias: Categoria[]) {
    const todosLosTipos: Array<{tipo: any, categoria: Categoria}> = [];
    categorias.forEach(cat => {
      cat.tipos.forEach(tipo => {
        todosLosTipos.push({tipo, categoria: cat});
      });
    });

    if (todosLosTipos.length === 0) {
      this.cargando = false;
      this.changeDetectorRef.detectChanges();
      return;
    }

    const observablesSubtiposPorTipo = todosLosTipos.map(({tipo, categoria}) =>
      this.subtipoService.getByTipoTransporte(tipo.id).pipe(
        map((subtiposBackend) => ({
          tipoId: tipo.id,
          subtipos: subtiposBackend.map(sb => ({
            id: sb.id,
            nombre: sb.nombre,
            tipoId: sb.tipoTransporte?.id || tipo.id
          }))
        })),
        catchError((err) => {
          console.error(`Error cargando subtipos del tipo ${tipo.id}:`, err);
          return of({
            tipoId: tipo.id,
            subtipos: [] as any[]
          });
        })
      )
    );

    forkJoin(observablesSubtiposPorTipo).subscribe({
      next: (resultadosSubtipos) => {
        resultadosSubtipos.forEach(({tipoId, subtipos}) => {
          const categoria = categorias.find(c => c.tipos.some(t => t.id === tipoId));
          if (categoria) {
            const tipo = categoria.tipos.find(t => t.id === tipoId);
            if (tipo) {
              tipo.subtipos = subtipos;
            }
          }
        });

        this.categorias = categorias;
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando subtipos:', err);
        this.categorias = categorias;
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getTiposPorCategoria(categoriaId: number | string) {
    const id = typeof categoriaId === 'string' ? parseInt(categoriaId, 10) : categoriaId;
    const categoria = this.categorias.find(c => c.id === id);
    return categoria ? categoria.tipos : [];
  }

  tieneTiposConCategoria(): boolean {
    return this.categorias.some(cat => cat.tipos.length > 0);
  }

  // ==== Categoría ====
  abrirModalCategoria() {
    this.modoEditarCategoria = false;
    this.categoriaEditando = null;
    this.formCategoria = { nombre: '' };
    this.mostrarModalCategoria = true;
  }

  editarCategoria(categoria: Categoria) {
    this.modoEditarCategoria = true;
    this.categoriaEditando = categoria;
    this.formCategoria = { nombre: categoria.nombre };
    this.mostrarModalCategoria = true;
  }

  cerrarModalCategoria() {
    this.mostrarModalCategoria = false;
  }

  guardarCategoria() {
    if (!this.formCategoria.nombre.trim()) {
      this.notificationService.error('El nombre de la categoría es requerido', 'Validación');
      return;
    }

    if (this.modoEditarCategoria && this.categoriaEditando) {
      this.categoriaService.actualizar(this.categoriaEditando.id, { nombre: this.formCategoria.nombre.trim() }).subscribe({
        next: () => {
          this.cargarDatos();
          this.notificationService.success('Categoría actualizada correctamente', 'Éxito');
          this.cerrarModalCategoria();
        },
        error: (err: any) => {
          console.error('Error actualizando categoría:', err);
          this.notificationService.error(err.error?.message || 'Error al actualizar la categoría', 'Error');
        }
      });
    } else {
      this.categoriaService.crear({ nombre: this.formCategoria.nombre.trim() }).subscribe({
        next: () => {
          this.cargarDatos();
          this.notificationService.success('Categoría creada correctamente', 'Éxito');
          this.cerrarModalCategoria();
        },
        error: (err: any) => {
          console.error('Error creando categoría:', err);
          this.notificationService.error(err.error?.message || 'Error al crear la categoría', 'Error');
        }
      });
    }
  }

  eliminarCategoria(categoria: Categoria) {
    if (!confirm('¿Está seguro que desea eliminar esta categoría? Se eliminarán también todos los tipos y subtipos asociados.')) {
      return;
    }

    this.categoriaService.eliminar(categoria.id).subscribe({
      next: () => {
        this.cargarDatos();
        this.notificationService.success('Categoría eliminada correctamente', 'Éxito');
      },
      error: (err: any) => {
        console.error('Error eliminando categoría:', err);
        this.notificationService.error(err.error?.message || 'Error al eliminar la categoría', 'Error');
      }
    });
  }

  // ==== Tipo ====
  abrirModalTipo() {
    this.modoEditarTipo = false;
    this.tipoEditando = null;
    this.formTipo = { nombre: '', categoriaId: '' as any };
    this.mostrarModalTipo = true;
  }

  editarTipo(tipo: Tipo, categoria: Categoria) {
    this.modoEditarTipo = true;
    this.tipoEditando = tipo;
    this.categoriaDelTipo = categoria;
    this.formTipo = {
      nombre: tipo.nombre,
      categoriaId: categoria.id
    };
    this.mostrarModalTipo = true;
  }

  cerrarModalTipo() {
    this.mostrarModalTipo = false;
  }

  guardarTipo() {
    if (!this.formTipo.nombre.trim()) {
      this.notificationService.error('El nombre del tipo es requerido', 'Validación');
      return;
    }
    if (!this.formTipo.categoriaId) {
      this.notificationService.error('Debes seleccionar una categoría', 'Validación');
      return;
    }

    if (this.modoEditarTipo && this.tipoEditando) {
      this.tipoService.actualizar(this.tipoEditando.id, {
        nombre: this.formTipo.nombre.trim(),
        categoriaTransporte: { idCategoriaTransporte: this.formTipo.categoriaId }
      }).subscribe({
        next: () => {
          this.cargarDatos();
          this.notificationService.success('Tipo actualizado correctamente', 'Éxito');
          this.cerrarModalTipo();
        },
        error: (err: any) => {
          console.error('Error actualizando tipo:', err);
          this.notificationService.error(err.error?.message || 'Error al actualizar el tipo', 'Error');
        }
      });
    } else {
      this.tipoService.crear({
        nombre: this.formTipo.nombre.trim(),
        categoriaTransporte: { idCategoriaTransporte: this.formTipo.categoriaId }
      }).subscribe({
        next: () => {
          this.cargarDatos();
          this.notificationService.success('Tipo creado correctamente', 'Éxito');
          this.cerrarModalTipo();
        },
        error: (err: any) => {
          console.error('Error creando tipo:', err);
          this.notificationService.error(err.error?.message || 'Error al crear el tipo', 'Error');
        }
      });
    }
  }

  eliminarTipo(tipo: Tipo, categoria: Categoria) {
    if (!confirm('¿Está seguro que desea eliminar este tipo? Se eliminarán también todos los subtipos asociados.')) {
      return;
    }

    this.tipoService.eliminar(tipo.id).subscribe({
      next: () => {
        this.cargarDatos();
        this.notificationService.success('Tipo eliminado correctamente', 'Éxito');
      },
      error: (err: any) => {
        console.error('Error eliminando tipo:', err);
        this.notificationService.error(err.error?.message || 'Error al eliminar el tipo', 'Error');
      }
    });
  }

  // ==== Subtipo ====
  abrirModalSubtipo() {
    this.modoEditarSubtipo = false;
    this.subtipoEditando = null;
    this.filtroModalCategoria = '';
    this.formSubtipo = { nombre: '', tipoId: '' as any };
    this.mostrarModalSubtipo = true;
  }

  onCategoriaChange() {
    this.formSubtipo.tipoId = '' as any;
  }

  cerrarModalSubtipo() {
    this.mostrarModalSubtipo = false;
  }

  guardarSubtipo() {
    if (!this.formSubtipo.nombre.trim()) {
      this.notificationService.error('El nombre del subtipo es requerido', 'Validación');
      return;
    }
    if (!this.formSubtipo.tipoId) {
      this.notificationService.error('Debes seleccionar un tipo', 'Validación');
      return;
    }

    const payload: SubtipoTransporteCreateRequest = {
      nombre: this.formSubtipo.nombre.trim(),
      tipoTransporte: { idTipoTransporte: this.formSubtipo.tipoId }
    };

    if (this.modoEditarSubtipo && this.subtipoEditando) {
      this.subtipoService.update(this.subtipoEditando.id, payload).subscribe({
        next: () => {
          this.cargarDatos();
          this.notificationService.success('Subtipo actualizado correctamente', 'Éxito');
          this.cerrarModalSubtipo();
        },
        error: (err: any) => {
          console.error('Error actualizando subtipo:', err);
          this.notificationService.error(err.error?.message || 'Error al actualizar el subtipo', 'Error');
        }
      });
    } else {
      this.subtipoService.create(payload).subscribe({
        next: () => {
          this.cargarDatos();
          this.notificationService.success('Subtipo creado correctamente', 'Éxito');
          this.cerrarModalSubtipo();
        },
        error: (err: any) => {
          console.error('Error creando subtipo:', err);
          this.notificationService.error(err.error?.message || 'Error al crear el subtipo', 'Error');
        }
      });
    }
  }

  editarSubtipo(subtipo: Subtipo, tipo: Tipo) {
    this.modoEditarSubtipo = true;
    this.subtipoEditando = subtipo;
    this.tipoDelSubtipo = tipo;
    this.filtroModalCategoria = tipo.categoriaId;
    this.formSubtipo = {
      nombre: subtipo.nombre,
      tipoId: tipo.id
    };
    this.mostrarModalSubtipo = true;
  }

  eliminarSubtipo(subtipo: Subtipo, tipo: Tipo) {
    if (!confirm('¿Está seguro que desea eliminar este subtipo?')) {
      return;
    }

    this.subtipoService.delete(subtipo.id).subscribe({
      next: () => {
        this.cargarDatos();
        this.notificationService.success('Subtipo eliminado correctamente', 'Éxito');
      },
      error: (err: any) => {
        console.error('Error eliminando subtipo:', err);
        this.notificationService.error(err.error?.message || 'Error al eliminar el subtipo', 'Error');
      }
    });
  }
}
