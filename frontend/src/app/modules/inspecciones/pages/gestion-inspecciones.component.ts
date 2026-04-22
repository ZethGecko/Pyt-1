import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InspeccionService, InspeccionResponse, InspeccionCreateRequest } from '../../inspecciones/services/inspeccion.service';
import { EmpresaService, EmpresaResponse } from '../../empresas/services/empresa.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-gestion-inspecciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-inspecciones.component.html',
  styleUrls: ['./gestion-inspecciones.component.scss']
})
export class GestionInspeccionesComponent implements OnInit {
  constructor(
    private inspeccionService: InspeccionService,
    private empresaService: EmpresaService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}
  
  // 🎯 ESTADOS
  inspecciones: InspeccionResponse[] = [];
  empresas: EmpresaResponse[] = [];
  cargando = false;
  error: string | null = null;
  exito: string | null = null;
  
  // 🎯 FILTROS
  filtroEmpresa = '';
  filtroEstado = '';
  filtroFecha = '';
  
  // 🎯 MODAL
  mostrandoModal = false;
  inspeccionEditando: InspeccionResponse | null = null;
  modoEdicion = false;
  
  // 🎯 ESTADOS DISPONIBLES
  estadosInspeccion = [
    { value: 'todos', label: 'Todos' },
    { value: 'programada', label: 'Programada' },
    { value: 'realizada', label: 'Realizada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];
  
  // 🎯 CLASES CSS POR ESTADO
  clasesEstado: { [key: string]: string } = {
    'programada': 'bg-blue-100 text-blue-800 border-blue-200',
    'realizada': 'bg-green-100 text-green-800 border-green-200',
    'cancelada': 'bg-red-100 text-red-800 border-red-200'
  };
  
  // 🎯 CLASES CSS POR RESULTADO
  clasesResultado: { [key: string]: string } = {
    'aprobado': 'bg-green-100 text-green-800',
    'rechazado': 'bg-red-100 text-red-800',
    'pendiente': 'bg-yellow-100 text-yellow-800'
  };
  
  // 🎯 DATOS PARA FORMULARIO
  nuevaInspeccion: Partial<InspeccionCreateRequest> = {
    expedienteId: 0,
    inspectorId: 0,
    fechaProgramada: new Date(),
    horaProgramada: '',
    lugar: '',
    observaciones: ''
  };
  
  // 🎯 Alias para compatibilidad con template de vehículos
  // El template espera propiedades de vehículos, mapeamos a inspecciones
  get totalVehiculos(): number { return this.totalInspecciones; }
  get habilitados(): number { return this.inspecciones.filter(i => i.estado === 'realizada').length; }
  get noHabilitados(): number { return this.canceladas; }
  get enTramite(): number { return this.programadas; }
  
  // Mapear filtroPlaca a filtroEmpresa para el template
  get filtroPlaca(): string { return this.filtroEmpresa; }
  set filtroPlaca(value: string) { this.filtroEmpresa = value; }
  
  // Mapear estadosVehiculo a estadosInspeccion
  get estadosVehiculo() { return this.estadosInspeccion; }
  
  // Mapear vehiculosFiltrados a inspeccionesFiltradas
  get vehiculosFiltrados() { 
    return this.inspeccionesFiltradas.map(inspeccion => ({
      placa: inspeccion.expedienteId?.toString() || 'N/A',
      marca: inspeccion.empresaNombre || 'N/A',
      modelo: inspeccion.inspectorNombre || 'N/A',
      anioFabricacion: new Date(inspeccion.fechaProgramada).getFullYear(),
      numeroMotor: '',
      numeroChasis: '',
      color: '',
      empresaId: inspeccion.empresaId,
      // Include original inspection data
      ...inspeccion
    }));
  }
  
  // Mapear vehiculoEditando a inspeccionEditando
  get vehiculoEditando() { return this.inspeccionEditando; }
  set vehiculoEditando(value: any) { this.inspeccionEditando = value as any; }
  
  // Mapear nuevoVehiculo a nuevaInspeccion
  get nuevoVehiculo() { return this.nuevaInspeccion; }
  set nuevoVehiculo(value: any) { this.nuevaInspeccion = value; }
  
  // Mapear método abrirModalCrear a abrirModalInspeccion
  abrirModalCrear(): void {
    this.abrirModalInspeccion();
  }
  
  // Mapear método abrirModalEditar a abrirModalInspeccion
  abrirModalEditar(inspeccion: any): void {
    this.abrirModalInspeccion(inspeccion);
  }
  
  // Mapear método guardarVehiculo a guardarInspeccion
  guardarVehiculo(): void {
    this.guardarInspeccion();
  }
  
  // Método para eliminar inspección
  eliminarVehiculo(inspeccion: InspeccionResponse): void {
    if (confirm('¿Está seguro de eliminar esta inspección?')) {
      this.cargando = true;
      this.inspeccionService.eliminar(inspeccion.id).subscribe({
        next: () => {
          this.cargarInspecciones();
          this.mostrarExito('Inspección eliminada correctamente');
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error al eliminar inspección';
          this.cargando = false;
        }
      });
    }
  }

  // 🎯 Alias para compatibilidad con template
  get clearMessages(): () => void { return this.limpiarMensajes.bind(this); }
  get page(): number { return this.currentPage; }
  get totalPages(): number { return Math.ceil(this.inspeccionesFiltradas.length / this.pageSize); }
  get totalElements(): number { return this.inspeccionesFiltradas.length; }
  get cambiarPaginaFn(): (p: number) => void { return this.cambiarPagina.bind(this); }
  
  // 🎯 Datos para selects del modal
  get expedientes() { return this.empresas; }
  inspectores: { id: number; nombre: string }[] = [
    { id: 1, nombre: 'Inspector General' },
    { id: 2, nombre: 'Inspector Técnico 1' },
    { id: 3, nombre: 'Inspector Técnico 2' }
  ];
  
  // 🎯 Paginación
  currentPage = 0;
  pageSize = 10;
  
  // 🎯 Métodos para paginación
  cambiarPagina(page: number): void {
    this.currentPage = page;
  }
  
  limpiarMensajes(): void {
    this.error = null;
    this.exito = null;
  }
  
  ngOnInit(): void {
    this.cargarInspecciones();
    this.cargarEmpresas();
  }
  
  // 🎯 CARGAR DATOS
  cargarInspecciones(): void {
    this.cargando = true;
    this.error = null;
    
    this.inspeccionService.listarTodos().subscribe({
      next: (inspecciones: InspeccionResponse[]) => {
        this.inspecciones = inspecciones;
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al cargar inspecciones';
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
        console.error(err);
      }
    });
  }
  
  cargarEmpresas(): void {
    this.empresaService.listarTodos().subscribe({
      next: (empresas: EmpresaResponse[]) => {
        this.empresas = empresas;
        this.changeDetectorRef.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar empresas:', err);
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  
  // 🎯 BÚSQUEDA Y FILTROS
  get inspeccionesFiltradas(): InspeccionResponse[] {
    return this.inspecciones.filter((i: InspeccionResponse) => {
      const coincideEmpresa = !this.filtroEmpresa || 
        i.empresaNombre?.toLowerCase().includes(this.filtroEmpresa.toLowerCase());
      const coincideEstado = !this.filtroEstado || this.filtroEstado === 'todos' || 
        i.estado === this.filtroEstado;
      return coincideEmpresa && coincideEstado;
    });
  }
  
  // 🎯 ESTADÍSTICAS
  get totalInspecciones(): number { return this.inspecciones.length; }
  get programadas(): number { return this.inspecciones.filter(i => i.estado === 'programada').length; }
  get realizadas(): number { return this.inspecciones.filter(i => i.estado === 'realizada').length; }
  get canceladas(): number { return this.inspecciones.filter(i => i.estado === 'cancelada').length; }
  
  // 🎯 FORMATEO
  getEstadoFormateado(estado: string): string {
    const estados: { [key: string]: string } = {
      'programada': 'Programada',
      'realizada': 'Realizada',
      'cancelada': 'Cancelada'
    };
    return estados[estado] || estado;
  }
  
  getColorEstado(estado: string): string {
    return this.clasesEstado[estado] || 'bg-gray-100 text-gray-800';
  }
  
  getColorResultado(resultado?: string): string {
    if (!resultado) return 'bg-gray-100 text-gray-800';
    return this.clasesResultado[resultado] || 'bg-gray-100 text-gray-800';
  }
  
  // 🎯 CRUD
  abrirModalInspeccion(inspeccion?: InspeccionResponse): void {
    if (inspeccion) {
      this.modoEdicion = true;
      this.inspeccionEditando = { ...inspeccion };
    } else {
      this.modoEdicion = false;
      this.inspeccionEditando = null;
      this.nuevaInspeccion = {
        expedienteId: 0,
        inspectorId: 0,
        fechaProgramada: new Date(),
        horaProgramada: '',
        lugar: '',
        observaciones: ''
      };
    }
    this.mostrandoModal = true;
  }
  
  cerrarModal(): void {
    this.mostrandoModal = false;
    this.inspeccionEditando = null;
    this.modoEdicion = false;
  }
  
  guardarInspeccion(): void {
    if (!this.validarInspeccion()) return;
    
    this.cargando = true;
    this.error = null;
    
    this.inspeccionService.crear(this.nuevaInspeccion as InspeccionService['crear'] extends (req: infer R) => any ? R : never).subscribe({
      next: () => {
        this.cargarInspecciones();
        this.cerrarModal();
        this.mostrarExito('Inspección programada correctamente');
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al programar inspección';
        this.cargando = false;
      }
    });
  }
  
  validarInspeccion(): boolean {
    if (!this.nuevaInspeccion.expedienteId || this.nuevaInspeccion.expedienteId === 0) {
      this.error = 'Seleccione un expediente';
      return false;
    }
    if (!this.nuevaInspeccion.inspectorId || this.nuevaInspeccion.inspectorId === 0) {
      this.error = 'Seleccione un inspector';
      return false;
    }
    if (!this.nuevaInspeccion.lugar || this.nuevaInspeccion.lugar.trim() === '') {
      this.error = 'Ingrese el lugar de la inspección';
      return false;
    }
    return true;
  }
  
   realizarInspeccion(inspeccion: InspeccionResponse): void {
     this.router.navigate(['/inspecciones/realizar', inspeccion.id]);
   }

   irACanvas(): void {
     // Si hay inspecciones, navegar a la primera; si no, navegar en modo diseño (id=0)
     const inspeccionId = this.inspecciones.length > 0 ? this.inspecciones[0].id : 0;
     this.router.navigate(['/inspecciones/realizar', inspeccionId]);
   }
  
  cancelarInspeccion(inspeccion: InspeccionResponse): void {
    if (confirm(`¿Está seguro de cancelar la inspección programada para ${inspeccion.empresaNombre}?`)) {
      this.cargando = true;
      this.error = null;
      
      this.inspeccionService.cancelar(inspeccion.id).subscribe({
        next: () => {
          this.cargarInspecciones();
          this.mostrarExito('Inspección cancelada correctamente');
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error al cancelar inspección';
          this.cargando = false;
        }
      });
    }
  }
  
  verDetalle(inspeccion: InspeccionResponse): void {
    this.router.navigate(['/app/inspecciones', inspeccion.id]);
  }
  
  // 🎯 UTILIDADES
  mostrarExito(mensaje: string): void {
    this.exito = mensaje;
    setTimeout(() => this.exito = null, 3000);
  }
  
  limpiarFiltros(): void {
    this.filtroEmpresa = '';
    this.filtroEstado = '';
    this.filtroFecha = '';
  }
  
  getEmpresaNombre(empresaId?: number): string {
    if (!empresaId) return 'Sin asignar';
    const empresa = this.empresas.find((e: EmpresaResponse) => e.id === empresaId);
    return empresa?.nombre || 'Sin asignar';
  }
}
