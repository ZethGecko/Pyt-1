import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { forkJoin, Observable } from 'rxjs';
import { TipoTramiteService } from '../services/tipo-tramite.service';
import { TUPACService } from '../services/tupac.service';
import { RequisitoTUPACService, RequisitoTUPACEnriquecidoProjection } from '../services/requisito-tupac.service';
import { FormatoService } from '../services/formato.service';
import { TipoTramite, TipoTramiteEnriquecido, TipoTramiteCreateRequest, TipoTramiteUpdateRequest } from '../models/tipo-tramite.model';
import { TUPAC } from '../models/tupac.model';
import { RequisitoTUPAC } from '../models/requisito-tupac.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-gestion-tipos-tramite',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestion-tipos-tramite.component.html',
  styles: [`
    .page-header { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
    .header-content { display: flex; align-items: center; gap: 12px; }
    .header-back { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #f3f4f6; color: #6b7280; }
    .header-back:hover { background: #e5e7eb; }
    .page-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { font-size: 14px; color: #6b7280; margin: 4px 0 0 0; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
    .btn-secondary:hover { background: #e5e7eb; }
    .filters-card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .filters-row { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
    .filter-group { flex: 1; min-width: 200px; }
    .filter-label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
    .filter-input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; }
    .filter-actions { display: flex; gap: 8px; }
    .table-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb; }
    .data-table td { padding: 12px 16px; border-top: 1px solid #e5e7eb; }
    .code-badge { font-family: monospace; background: #e0e7ff; padding: 4px 8px; border-radius: 4px; font-size: 13px; color: #3730a3; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
    .badge-info { background: #dbeafe; color: #2563eb; }
    .tupac-info { display: flex; align-items: center; gap: 8px; }
    .tupac-descripcion { font-size: 13px; color: #6b7280; }
    .action-buttons { display: flex; align-items: center; gap: 0.5rem; flex-wrap: nowrap; }
    .btn-icon { width: 36px; height: 36px; border-radius: 0.5rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; padding: 0; }
    .btn-icon svg { width: 16px; height: 16px; }
    .btn-icon.btn-edit { background-color: #dbeafe; color: #2563eb; }
    .btn-icon.btn-edit:hover:not(:disabled) { background-color: #bfdbfe; }
    .btn-icon.btn-view { background-color: #dbeafe; color: #2563eb; }
    .btn-icon.btn-view:hover:not(:disabled) { background-color: #bfdbfe; }
    .btn-icon.btn-delete { background-color: #fee2e2; color: #dc2626; }
    .btn-icon.btn-delete:hover:not(:disabled) { background-color: #fecaca; }
    .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 40px; color: #6b7280; }
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
    .form-hint { display: block; font-size: 12px; color: #6b7280; margin-top: 4px; }
    .form-error { color: #dc2626; font-size: 12px; margin-top: 4px; }
    .form-alert { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .text-gray-400 { color: #9ca3af; }
    .modal-title-area { display: flex; align-items: center; gap: 12px; }
    .modal-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .modal-icon.create { background: #dcfce7; color: #16a34a; }
    .modal-icon.edit { background: #dbeafe; color: #2563eb; }
    .modal-subtitle { font-size: 13px; color: #6b7280; margin: 4px 0 0 0; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .modal-large { max-width: 90%; width: 1200px; }
  `]
})
export class GestionTiposTramiteComponent implements OnInit {
  tiposTramite: TipoTramiteEnriquecido[] = [];
  cargando = false;
  error: string | null = null;
  success: string | null = null;
  filtro = '';
  categoriaFiltro: string | null = null;

  // Modal
  mostrarModal = false;
  modoEditar = false;
  tipoEditando: TipoTramiteEnriquecido | null = null;
  form: { codigo: string; descripcion: string; diasDescargo?: number | null; tupacId: number | null } = {
    codigo: '',
    descripcion: '',
    diasDescargo: undefined,
    tupacId: null
  };

  // Permisos (por ahora hardcodeados, luego se conectan al sistema de permisos)
  puedeCrear = true;
  puedeEditar = true;
  puedeEliminar = true;

  // TUPACs para selector
  tupacs: TUPAC[] = [];
  
  // Gestión de requisitos
  requisitosDisponibles: RequisitoTUPAC[] = [];
  requisitosSeleccionados: RequisitoTUPAC[] = [];
  cargandoRequisitos = false;

  // Modal Requisitos por Tipo de Trámite
  mostrarModalRequisitosPorTipo = false;
  tipoSeleccionado: (TipoTramiteEnriquecido & { requisitosDetalle: RequisitoTUPAC[] }) | null = null;
  cargandoRequisitosPorTipo = false;

  @ViewChild('formulario') formulario: any;

  constructor(
    private tipoTramiteService: TipoTramiteService,
    private tupacService: TUPACService,
    private requisitoTUPACService: RequisitoTUPACService,
    private formatoService: FormatoService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
    this.cargarTupacs();
  }

  cargarDatosIniciales() {
    this.cargando = true;
    this.error = null;

    this.tipoTramiteService.listarTodos().subscribe({
      next: (tipos) => {
        this.tiposTramite = tipos;
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando datos iniciales:', err);
        this.error = err.error?.message || 'Error al cargar los datos';
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getTiposTramiteFiltrados() {
    return this.tiposTramite.filter(t => {
      const coincideBusqueda = !this.filtro ||
        t.codigo.toLowerCase().includes(this.filtro.toLowerCase()) ||
        t.descripcion.toLowerCase().includes(this.filtro.toLowerCase());
      // Nota: categoriaFiltro no está implementado en el modelo actual, se deja como referencia futura
      // const coincideCategoria = !this.categoriaFiltro || t.categoria === this.categoriaFiltro;
      return coincideBusqueda; // && coincideCategoria;
    });
  }

  abrirModal() {
    this.modoEditar = false;
    this.tipoEditando = null;
    this.form = {
      codigo: '',
      descripcion: '',
      diasDescargo: undefined,
      tupacId: null
    };
    this.requisitosSeleccionados = [];
    this.mostrarModal = true;
    this.error = null;
  }

  editar(tipo: TipoTramiteEnriquecido) {
    this.modoEditar = true;
    this.tipoEditando = tipo;
    this.form = {
      codigo: tipo.codigo,
      descripcion: tipo.descripcion,
      diasDescargo: tipo.diasDescargo,
      tupacId: tipo.tupacId || null
    };
    
    // Cargar requisitos seleccionados si tiene TUPAC
    if (tipo.tupacId) {
      this.cargarRequisitosSeleccionados(tipo.id);
    } else {
      this.requisitosSeleccionados = [];
    }
    
    this.mostrarModal = true;
    this.error = null;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.tipoEditando = null;
    this.form = {
      codigo: '',
      descripcion: '',
      diasDescargo: undefined,
      tupacId: null
    };
    this.requisitosSeleccionados = [];
    this.requisitosDisponibles = [];
  }

  async guardar() {
    if (this.formulario && this.formulario.invalid) {
      return;
    }

    try {
      if (this.modoEditar && this.tipoEditando) {
        // Actualizar tipo de trámite
        const updateRequest: TipoTramiteUpdateRequest = {
          codigo: this.form.codigo,
          descripcion: this.form.descripcion,
          diasDescargo: this.form.diasDescargo || undefined,
          tupacId: this.form.tupacId
        };
        
        await this.tipoTramiteService.actualizar(this.tipoEditando.id, updateRequest).toPromise();
        
        // Actualizar requisitos asociados
        if (this.form.tupacId) {
          const requisitoIds = this.requisitosSeleccionados.map(r => r.id).filter((id): id is number => id !== undefined);
          await this.tipoTramiteService.asociarRequisitos(this.tipoEditando.id, requisitoIds).toPromise();
        }
        
        this.notificationService.showSuccess('Tipo de trámite actualizado correctamente');
      } else {
        // Crear nuevo tipo de trámite
        const createRequest: TipoTramiteCreateRequest = {
          codigo: this.form.codigo,
          descripcion: this.form.descripcion,
          diasDescargo: this.form.diasDescargo || undefined,
          tupacId: this.form.tupacId
        };
        
        const nuevoTipo = await this.tipoTramiteService.crear(createRequest).toPromise();
        
        // Asociar requisitos si hay TUPAC y requisitos seleccionados
        if (nuevoTipo && this.form.tupacId && this.requisitosSeleccionados.length > 0) {
          const requisitoIds = this.requisitosSeleccionados.map(r => r.id).filter((id): id is number => id !== undefined);
          await this.tipoTramiteService.asociarRequisitos(nuevoTipo.id, requisitoIds).toPromise();
        }
        
        this.notificationService.showSuccess('Tipo de trámite creado correctamente');
      }
      
      this.cerrarModal();
      this.cargarDatosIniciales();
    } catch (error: any) {
      console.error('Error guardando tipo de trámite:', error);
      this.error = error.error?.message || 'Error al guardar el tipo de trámite';
    }
  }

  async eliminar(tipo: TipoTramiteEnriquecido) {
    if (!confirm(`¿Estás seguro de eliminar el tipo de trámite "${tipo.codigo}"?`)) {
      return;
    }

    try {
      await this.tipoTramiteService.eliminar(tipo.id).toPromise();
      this.notificationService.showSuccess('Tipo de trámite eliminado correctamente');
      this.cargarDatosIniciales();
    } catch (error: any) {
      console.error('Error eliminando tipo de trámite:', error);
      this.error = error.error?.message || 'Error al eliminar el tipo de trámite';
    }
  }

  cargarTupacs() {
    this.tupacService.listarTodos().subscribe({
      next: (tupacs: TUPAC[]) => {
        this.tupacs = tupacs;
      },
      error: (err: any) => {
        console.error('Error cargando TUPACs:', err);
      }
    });
  }

  onTupacChange() {
    // Limpiar requisitos seleccionados al cambiar el TUPAC
    this.requisitosSeleccionados = [];
    this.requisitosDisponibles = [];
    
    if (this.form.tupacId) {
      this.cargarRequisitosDisponibles(this.form.tupacId);
    }
  }

  cargarRequisitosDisponibles(tupacId: number) {
    this.cargandoRequisitos = true;
    this.tupacService.obtenerRequisitosPorTupac(tupacId).subscribe({
      next: (requisitos: RequisitoTUPAC[]) => {
        this.requisitosDisponibles = requisitos;
        this.cargandoRequisitos = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando requisitos del TUPAC:', err);
        this.requisitosDisponibles = [];
        this.cargandoRequisitos = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  cargarRequisitosSeleccionados(tipoTramiteId: number) {
    this.cargandoRequisitos = true;
    this.tipoTramiteService.obtenerRequisitos(tipoTramiteId).subscribe({
      next: (requisitos: RequisitoTUPAC[]) => {
        this.requisitosSeleccionados = requisitos;
        // También cargar los disponibles para saber cuáles faltan
        if (this.form.tupacId) {
          this.cargarRequisitosDisponibles(this.form.tupacId);
        }
        this.cargandoRequisitos = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando requisitos seleccionados:', err);
        this.requisitosSeleccionados = [];
        this.cargandoRequisitos = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  aplicarTodosLosRequisitos() {
    if (!this.form.tupacId) return;
    
    // Asegurarse de que requisitosDisponibles es un array
    if (Array.isArray(this.requisitosDisponibles)) {
      this.requisitosSeleccionados = [...this.requisitosDisponibles];
    } else {
      this.requisitosSeleccionados = [];
      console.warn('requisitosDisponibles no es un array:', this.requisitosDisponibles);
    }
  }

  eliminarRequisitoSeleccionado(requisitoId: number) {
    this.requisitosSeleccionados = this.requisitosSeleccionados.filter(r => r.id !== requisitoId);
  }

  getDescripcionCorta(descripcion: string): string {
    if (!descripcion) return '';
    if (descripcion.length > 100) {
      return descripcion.substring(0, 100) + '...';
    }
    return descripcion;
  }

  // --- Modal Requisitos por Tipo de Trámite ---

  verRequisitosTipo(tipo: TipoTramiteEnriquecido) {
    // Verificar si el tipo tiene requisitos usando totalRequisitos
    if (!tipo.totalRequisitos || tipo.totalRequisitos === 0) {
      this.notificationService.showWarning('Este tipo de trámite no tiene requisitos asignados', 'Sin requisitos');
      return;
    }

    this.cargandoRequisitosPorTipo = true;
    this.tipoSeleccionado = null;
    this.mostrarModalRequisitosPorTipo = true;

    // Obtener los requisitos del tipo desde el backend
    this.requisitoTUPACService.listarParaTipoTramite(tipo.id.toString()).subscribe({
      next: (requisitos) => {
        this.tipoSeleccionado = {
          ...tipo,
          requisitosDetalle: requisitos
        };
        this.cargandoRequisitosPorTipo = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando requisitos del tipo:', err);
        this.cargandoRequisitosPorTipo = false;
        this.notificationService.showError('Error al cargar requisitos', err.message);
        this.mostrarModalRequisitosPorTipo = false;
      }
    });
  }

  cerrarModalRequisitosPorTipo() {
    this.mostrarModalRequisitosPorTipo = false;
    this.tipoSeleccionado = null;
  }

  verFormatoDesdeLista(formatoId: number) {
    this.formatoService.download(formatoId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = window.open(url, '_blank');
        if (!a) {
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = 'formato.pdf';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(downloadLink);
        }
      },
      error: (err) => {
        this.error = 'Error al abrir el formato';
        console.error('Error abriendo formato:', err);
      }
    });
  }
}
