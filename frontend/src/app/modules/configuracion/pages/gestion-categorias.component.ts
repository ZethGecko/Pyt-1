import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { CategoriaTransporteService } from '../services/categoria-transporte.service';

interface CategoriaTransporte {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-gestion-categorias',
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
          <div class="header-icon">
            <app-icon name="folder" size="md"></app-icon>
          </div>
          <div class="header-text">
            <h1 class="page-title">Categorías de Transporte</h1>
            <p class="page-subtitle">Gestiona las categorías de transporte del sistema</p>
          </div>
        </div>
        <button (click)="abrirModal()" class="btn btn-primary">
          <app-icon name="plus" size="sm"></app-icon>
          Nueva Categoría
        </button>
      </div>

      <!-- Mensajes globales -->
      @if (globalError) {
        <div class="alert alert-error">
          <app-icon name="alert-circle" size="sm"></app-icon>
          {{ globalError }}
          <button (click)="globalError = null"><app-icon name="x" size="sm"></app-icon></button>
        </div>
      }
      @if (globalSuccess) {
        <div class="alert alert-success">
          <app-icon name="check-circle" size="sm"></app-icon>
          {{ globalSuccess }}
          <button (click)="globalSuccess = null"><app-icon name="x" size="sm"></app-icon></button>
        </div>
      }

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <app-icon name="folder" size="md"></app-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total</span>
            <span class="stat-value">{{ categorias.length }}</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Buscar</label>
            <input type="text" [(ngModel)]="filtro" placeholder="Buscar por nombre..." class="filter-input">
          </div>
          <div class="filter-actions">
            <button class="btn btn-secondary" (click)="cargarCategorias()">
              <app-icon name="refresh" size="sm"></app-icon>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      @if (cargando) {
        <div class="loading-state">
          <app-icon name="refresh" size="lg" customClass="animate-spin text-blue-500"></app-icon>
          <span>Cargando...</span>
        </div>
      } @else {
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (cat of getCategoriasFiltradas(); track cat.id) {
                <tr>
                  <td>{{ cat.nombre }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="action-btn edit" (click)="editarCategoria(cat)" title="Editar">
                        <app-icon name="edit" size="sm"></app-icon>
                      </button>
                      <button class="action-btn delete" (click)="eliminar(cat)" title="Eliminar">
                        <app-icon name="trash-2" size="sm"></app-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="2" class="empty-state">
                    <app-icon name="folder" size="xl" customClass="text-gray-300"></app-icon>
                    <p>No hay categorías registradas</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal -->
    @if (mostrarModal) {
      <div class="modal-overlay" (click)="cerrarModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <app-icon name="folder" size="md" customClass="mr-2"></app-icon>
              {{ modoEditar ? 'Editar' : 'Nueva' }} Categoría
            </h2>
            <button class="modal-close" (click)="cerrarModal()">
              <app-icon name="x" size="sm"></app-icon>
            </button>
          </div>
          <div class="modal-body">
            @if (modalError) {
              <div class="alert alert-error">
                <app-icon name="alert-circle" size="sm"></app-icon>
                {{ modalError }}
              </div>
            }
            @if (modalSuccess) {
              <div class="alert alert-success">
                <app-icon name="check-circle" size="sm"></app-icon>
                {{ modalSuccess }}
              </div>
            }
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" [(ngModel)]="form.nombre" class="form-input" placeholder="Ej: Transporte de Personas">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="guardar()" [disabled]="cargando">
              {{ modoEditar ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
    .header-content { display: flex; align-items: center; gap: 12px; }
    .header-back { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #f3f4f6; color: #6b7280; }
    .header-back:hover { background: #e5e7eb; }
    .header-icon { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); display: flex; align-items: center; justify-content: center; color: #2563eb; }
    .page-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { font-size: 14px; color: #6b7280; margin: 4px 0 0 0; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
    .btn-secondary:hover { background: #e5e7eb; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon.blue { background: #dbeafe; color: #2563eb; }
    .stat-label { font-size: 13px; color: #6b7280; }
    .stat-value { font-size: 24px; font-weight: 700; color: #111827; }
    .filters-card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .filters-row { display: flex; gap: 16px; align-items: flex-end; }
    .filter-group { flex: 1; }
    .filter-label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .filter-input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
    .table-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb; }
    .data-table td { padding: 12px 16px; border-top: 1px solid #e5e7eb; }
    .status-badge { padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
    .action-buttons { display: flex; gap: 8px; }
    .action-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: none; cursor: pointer; }
    .action-btn.edit { background: #dbeafe; color: #2563eb; }
    .action-btn.delete { background: #fee2e2; color: #dc2626; }
    .empty-state { text-align: center; padding: 40px; color: #6b7280; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 12px; color: #6b7280; }
    .alert { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
    .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
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
  `]
})
export class GestionCategoriasComponent implements OnInit {
  categorias: CategoriaTransporte[] = [];
  cargando = false;
  globalError: string | null = null;
  globalSuccess: string | null = null;
  modalError: string | null = null;
  modalSuccess: string | null = null;
  filtro = '';
  mostrarModal = false;
  modoEditar = false;
  categoriaEditando: CategoriaTransporte | null = null;
  form = { nombre: '' };

  constructor(
    private categoriaService: CategoriaTransporteService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.cargando = true;
    this.globalError = null;

    this.categoriaService.listarTodos().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.globalError = 'Error al cargar categorías';
        console.error('Error cargando categorías:', err);
      }
    });
  }

  getCategoriasFiltradas() {
    return this.categorias.filter(c =>
      !this.filtro || c.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  abrirModal() {
    this.modoEditar = false;
    this.categoriaEditando = null;
    this.form = { nombre: '' };
    this.modalError = null;
    this.modalSuccess = null;
    this.mostrarModal = true;
  }

  editarCategoria(cat: CategoriaTransporte) {
    this.modoEditar = true;
    this.categoriaEditando = cat;
    this.form = { nombre: cat.nombre };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.modalError = null;
    this.modalSuccess = null;
  }

  guardar() {
    if (!this.form.nombre) {
      this.modalError = 'El nombre es requerido';
      return;
    }

    if (this.modoEditar && this.categoriaEditando) {
      // Actualizar
      this.modalError = null;
      this.categoriaService.actualizar(this.categoriaEditando.id, this.form).subscribe({
        next: () => {
          this.cargarCategorias();
          this.modalSuccess = 'Categoría actualizada correctamente';
          this.cerrarModal();
        },
        error: (err) => {
          this.modalError = err.error?.message || 'Error al actualizar categoría';
          console.error('Error actualizando categoría:', err);
        }
      });
    } else {
      // Crear
      this.modalError = null;
      this.categoriaService.crear(this.form).subscribe({
        next: () => {
          this.cargarCategorias();
          this.modalSuccess = 'Categoría creada correctamente';
          this.cerrarModal();
        },
        error: (err) => {
          this.modalError = err.error?.message || 'Error al crear categoría';
          console.error('Error creando categoría:', err);
        }
      });
    }
  }

  eliminar(cat: CategoriaTransporte) {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${cat.nombre}"?`)) {
      return;
    }

    this.categoriaService.eliminar(cat.id).subscribe({
      next: () => {
        this.cargarCategorias();
        this.globalSuccess = 'Categoría eliminada correctamente';
      },
      error: (err) => {
        this.globalError = err.error?.message || 'Error al eliminar categoría';
        console.error('Error eliminando categoría:', err);
      }
    });
  }
}
