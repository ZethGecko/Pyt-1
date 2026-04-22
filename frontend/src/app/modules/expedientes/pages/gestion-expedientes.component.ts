import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ExpedienteService,
  ExpedienteResponse,
  ExpedienteCreateRequest,
  ExpedienteUpdateRequest
} from '../../expedientes/services/expediente.service';
import { EmpresaService, EmpresaResponse } from '../../empresas/services/empresa.service';

@Component({
  selector: 'app-gestion-expedientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-expedientes.component.html',
  styleUrls: ['./gestion-expedientes.component.scss']
})
export class GestionExpedientesComponent implements OnInit {
  
  // 🎯 ESTADOS
  expedientes: ExpedienteResponse[] = [];
  empresas: EmpresaResponse[] = [];
  tiposTramite: Array<{id: number, label: string}> = [];
  cargando = false;
  error: string | null = null;
  exito: string | null = null;
  
  // 🎯 FILTROS
  filtroCodigo = '';
  filtroEmpresa = '';
  filtroEstado = '';
  filtroAnio: number | null = null;
  
  // 🎯 MODAL
  mostrandoModal = false;
  expedienteEditando: ExpedienteResponse | null = null;
  modoEdicion = false;
  
  // 🎯 ESTADOS DISPONIBLES (alineados con backend)
  estadosExpediente = [
    { value: 'todos', label: 'Todos' },
    { value: 'en_revision', label: 'En Revisión' },
    { value: 'observado', label: 'Observado' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' }
  ];
  
  // 🎯 CLASES CSS POR ESTADO
  clasesEstado: { [key: string]: string } = {
    'en_revision': 'bg-blue-100 text-blue-800 border-blue-200',
    'observado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'aprobado': 'bg-green-100 text-green-800 border-green-200',
    'rechazado': 'bg-red-100 text-red-800 border-red-200'
  };
  
  // 🎯 DATOS PARA FORMULARIO
  nuevoExpediente: ExpedienteCreateRequest = {
    codigo: '',
    nombre: '',
    año: new Date().getFullYear(),
    empresaId: 0,
    tipoTramiteId: 0,
    observacionesGenerales: ''
  };
  
  // 🎯 Paginación
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  
  // 🎯 Alias para template
  get clearMessages(): () => void { return this.limpiarMensajes.bind(this); }
  get page(): number { return this.currentPage; }
  get totalPages(): number { return Math.ceil(this.totalElements / this.pageSize); }
  get cambiarPaginaFn(): (p: number) => void { return this.cambiarPagina.bind(this); }
  
  cambiarPagina(page: number): void {
    this.currentPage = page;
    this.cargarExpedientes();
  }
  
  limpiarMensajes(): void {
    this.error = null;
    this.exito = null;
  }
  
  constructor(
    private expedienteService: ExpedienteService,
    private empresaService: EmpresaService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.cargarEmpresas();
    this.cargarTiposTramite();
    this.cargarAniosDisponibles();
    this.cargarExpedientes();
  }
  
  cargarTiposTramite(): void {
    this.expedienteService.obtenerTiposTramiteParaSelect().subscribe({
      next: (tipos: Array<{id: number, label: string}>) => {
        this.tiposTramite = tipos as any;
      },
      error: (err: any) => {
        console.error('Error al cargar tipos de trámite:', err);
        this.tiposTramite = [];
      }
    });
  }
  
  cargarAniosDisponibles(): void {
    this.expedienteService.obtenerAniosDisponibles().subscribe({
      next: (anios: number[]) => {
        this.aniosDisponibles = anios;
      },
      error: (err: any) => {
        console.error('Error al cargar años disponibles:', err);
        this.aniosDisponibles = this.generarAniosLocal();
      }
    });
  }
  
  generarAniosLocal(): number[] {
    const anioActual = new Date().getFullYear();
    const anios: number[] = [];
    for (let i = anioActual; i >= anioActual - 10; i--) {
      anios.push(i);
    }
    return anios;
  }
  
  // 🎯 CARGAR DATOS
  cargarExpedientes(): void {
    this.cargando = true;
    this.error = null;
    
    this.expedienteService.listarEnriquecidos(this.currentPage, this.pageSize).subscribe({
      next: (response: { content: ExpedienteResponse[]; totalElements: number }) => {
        this.expedientes = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al cargar expedientes';
        this.cargando = false;
        console.error('Error cargando expedientes:', err);
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }
  
  cargarEmpresas(): void {
    this.empresaService.listarTodos().subscribe({
      next: (empresas: EmpresaResponse[]) => {
        // Filtrar solo empresas activas y habilitadas
        this.empresas = empresas.filter(emp =>
          emp.activo === true && emp.estadoOperativo === 'habilitada'
        );
      },
      error: (err: any) => console.error('Error al cargar empresas:', err)
    });
  }

  
  // 🎯 BÚSQUEDA Y FILTROS
  get expedientesFiltrados(): ExpedienteResponse[] {
    return this.expedientes.filter((e: ExpedienteResponse) => {
      const coincideCodigo = !this.filtroCodigo ||
        e.codigo?.toLowerCase().includes(this.filtroCodigo.toLowerCase());
      const coincideEstado = !this.filtroEstado || this.filtroEstado === 'todos' ||
        e.estado === this.filtroEstado;
      const coincideEmpresa = !this.filtroEmpresa ||
        e.empresaNombre?.toLowerCase().includes(this.filtroEmpresa.toLowerCase());
      const coincideAnio = !this.filtroAnio || e.año === this.filtroAnio;
      return coincideCodigo && coincideEstado && coincideEmpresa && coincideAnio;
    });
  }
  
  // 🎯 ESTADÍSTICAS (basadas en estados del backend)
  get totalExpedientes(): number { return this.totalElements; }
  get enRevision(): number { return this.expedientes.filter(e => e.estado === 'en_revision').length; }
  get observados(): number { return this.expedientes.filter(e => e.estado === 'observado').length; }
  get aprobados(): number { return this.expedientes.filter(e => e.estado === 'aprobado').length; }
  get rechazados(): number { return this.expedientes.filter(e => e.estado === 'rechazado').length; }
  
  // 🎯 FORMATEO
  getEstadoFormateado(estado: string): string {
    const estados: { [key: string]: string } = {
      'en_revision': 'En Revisión',
      'observado': 'Observado',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado'
    };
    return estados[estado] || estado;
  }
  
  getColorEstado(estado: string): string {
    return this.clasesEstado[estado] || 'bg-gray-100 text-gray-800';
  }
  
  // 🎯 CRUD
  abrirModalExpediente(expediente?: ExpedienteResponse): void {
    if (expediente) {
      this.modoEdicion = true;
      this.expedienteEditando = { ...expediente };
    } else {
      this.modoEdicion = false;
      this.expedienteEditando = null;
      this.nuevoExpediente = {
        codigo: '',
        nombre: '',
        año: new Date().getFullYear(),
        empresaId: 0,
        tipoTramiteId: 0,
        observacionesGenerales: ''
      };
    }
    this.limpiarMensajes();
    this.mostrandoModal = true;
  }
  
  cerrarModal(): void {
    this.mostrandoModal = false;
    this.expedienteEditando = null;
    this.modoEdicion = false;
    this.limpiarMensajes();
  }
  
  guardarExpediente(): void {
    if (!this.validarExpediente()) return;
    
    this.cargando = true;
    this.error = null;
    
    const operation = this.modoEdicion && this.expedienteEditando
      ? this.expedienteService.actualizar(this.expedienteEditando.id, { ...this.expedienteEditando })
      : this.expedienteService.crear({ ...this.nuevoExpediente });
    
    operation.subscribe({
      next: () => {
        this.cargarExpedientes();
        this.cerrarModal();
        this.mostrarExito(this.modoEdicion
          ? 'Expediente actualizado correctamente'
          : 'Expediente creado correctamente');
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al guardar expediente';
        console.error('Error guardando expediente:', err);
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }
  
  validarExpediente(): boolean {
    const datos = this.modoEdicion && this.expedienteEditando
      ? this.expedienteEditando
      : this.nuevoExpediente;
    
    if (!datos.nombre || datos.nombre.trim() === '') {
      this.error = 'El nombre del expediente es obligatorio';
      return false;
    }
    
    if (!datos.año || datos.año < 2000 || datos.año > new Date().getFullYear() + 1) {
      this.error = `El año debe estar entre 2000 y ${new Date().getFullYear() + 1}`;
      return false;
    }
    
    if (!datos.empresaId || datos.empresaId === 0) {
      this.error = 'Seleccione una empresa';
      return false;
    }
    
    if (!datos.tipoTramiteId || datos.tipoTramiteId === 0) {
      this.error = 'Seleccione un tipo de trámite';
      return false;
    }
    
    return true;
  }
  
  cerrarExpediente(expediente: ExpedienteResponse): void {
    if (confirm(`¿Está seguro de cerrar el expediente ${expediente.codigo}?`)) {
      this.cargando = true;
      this.error = null;
      
      this.expedienteService.cerrar(expediente.id).subscribe({
        next: () => {
          this.cargarExpedientes();
          this.mostrarExito('Expediente cerrado correctamente');
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error al cerrar expediente';
          this.cargando = false;
          console.error('Error cerrando expediente:', err);
        }
        // complete no es necesario: cargando será manejado por cargarExpedientes() en caso de éxito
      });
    }
  }
  
  verDetalle(expediente: ExpedienteResponse): void {
    this.router.navigate(['/app/expedientes', expediente.id]);
  }
  
  // 🎯 UTILIDADES
  mostrarExito(mensaje: string): void {
    this.exito = mensaje;
    setTimeout(() => this.exito = null, 3000);
  }
  
  generarCodigoAutomatico(): void {
    const anio = this.modoEdicion && this.expedienteEditando
      ? this.expedienteEditando.año
      : this.nuevoExpediente.año;
    
    this.expedienteService.generarCodigo('EXP', anio).subscribe({
      next: (response: { codigoGenerado: string }) => {
        if (this.modoEdicion && this.expedienteEditando) {
          this.expedienteEditando.codigo = response.codigoGenerado;
        } else {
          this.nuevoExpediente.codigo = response.codigoGenerado;
        }
      },
      error: (err: any) => {
        console.error('Error generando código:', err);
      }
    });
  }
  
  limpiarFiltros(): void {
    this.filtroCodigo = '';
    this.filtroEstado = '';
    this.filtroEmpresa = '';
    this.filtroAnio = null;
  }
  
  getEmpresaNombre(empresaId?: number): string {
    if (!empresaId) return 'Sin asignar';
    const empresa = this.empresas.find((e: EmpresaResponse) => e.id === empresaId);
    return empresa?.nombre || 'Sin asignar';
  }

  getTipoTramiteNombre(tipoTramiteId?: number): string {
    if (!tipoTramiteId) return 'Sin asignar';
    const tipo = this.tiposTramite.find((t: any) => t.id === tipoTramiteId);
    return tipo?.label || 'Sin asignar';
  }
  
  // 🎯 OPCIONES DE AÑO
  aniosDisponibles: number[] = [];
}
