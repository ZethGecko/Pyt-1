import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { VehiculoService, VehiculoResponse } from '../../vehiculos/services/vehiculo.service';
import { EmpresaService, EmpresaResponse } from '../../empresas/services/empresa.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-gestion-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-vehiculos.component.html',
  styleUrls: ['./gestion-vehiculos.component.scss']
})
export class GestionVehiculosComponent implements OnInit {
  
  vehiculos: VehiculoResponse[] = [];
  empresas: EmpresaResponse[] = [];
  cargando = false;
  error: string | null = null;
  exito: string | null = null;
  
  mostrandoModal = false;
  vehiculoEditando: VehiculoResponse | null = null;
  modoEdicion = false;
  
  estadosVehiculo = [
    { value: 'todos', label: 'Todos' },
    { value: 'habilitado', label: 'Habilitado' },
    { value: 'no_habilitado', label: 'No Habilitado' },
    { value: 'en_tramite', label: 'En Trámite' },
    { value: 'baja', label: 'De Baja' }
  ];
  
  clasesEstado: { [key: string]: string } = {
    'habilitado': 'bg-green-100 text-green-800 border-green-200',
    'no_habilitado': 'bg-gray-100 text-gray-800 border-gray-200',
    'en_tramite': 'bg-blue-100 text-blue-800 border-blue-200',
    'baja': 'bg-red-100 text-red-800 border-red-200'
  };
  
  nuevoVehiculo: Partial<VehiculoResponse> = {
    placa: '',
    marca: '',
    modelo: '',
    fechaFabricacion: 0,
    color: '',
    categoria: '',
    pesoNeto: undefined,
    tipoTransporteId: 0,
    categoriaTransporteId: 0,
    empresa: undefined,
    activo: true,
    estadoTecnico: '',
    observaciones: ''
  };
  
  filtroPlaca: string = '';
  filtroEstado: string = '';
  filtroEmpresa: string = '';
  filtroFechaFabricacionInicio: number | null = null;
  filtroFechaFabricacionFin: number | null = null;
  
  // Filtro de empresa en modal
  filtroEmpresaModal: string = '';
  
  currentPage = 0;
  pageSize = 10;
  
  constructor(
    private vehiculoService: VehiculoService,
    private empresaService: EmpresaService,
    private notificationService: NotificationService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.cargarDatosIniciales();
  }
  
  // ✅ CARGAR TODOS LOS DATOS EN PARALELO CON forkJoin
  cargarDatosIniciales(): void {
    this.cargando = true;
    this.error = null;
    
    forkJoin({
      vehiculos: this.vehiculoService.listarTodos(),
      empresas: this.empresaService.listarTodos()
    }).subscribe({
      next: (resultado) => {
        this.vehiculos = resultado.vehiculos;
        // Mostrar todas las empresas activas (sin filtro por estadoOperativo)
        this.empresas = resultado.empresas.filter(emp => emp.activo === true);
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.error = 'Error al cargar datos iniciales';
        console.error('Error cargando datos iniciales:', err);
      }
    });
  }
  
  abrirModalCrear(): void {
    this.nuevoVehiculo = {
      placa: '',
      marca: '',
      modelo: '',
      fechaFabricacion: 0,
      color: '',
      categoria: '',
      pesoNeto: undefined,
      tipoTransporteId: 0,
      categoriaTransporteId: 0,
      empresa: undefined,
      activo: true,
      estadoTecnico: '',
      observaciones: ''
    };
    this.vehiculoEditando = null;
    this.modoEdicion = false;
    this.limpiarMensajes();
    this.mostrandoModal = true;
  }
  
  abrirModalEditar(vehiculo: VehiculoResponse): void {
    this.vehiculoEditando = { ...vehiculo };
    this.modoEdicion = true;
    this.limpiarMensajes();
    this.mostrandoModal = true;
  }
  
  cerrarModal(): void {
    this.mostrandoModal = false;
    this.vehiculoEditando = null;
    this.modoEdicion = false;
    this.limpiarMensajes();
  }
  
  limpiarMensajes(): void {
    this.error = null;
    this.exito = null;
  }
   
  onVehiculoGuardado(): void {
    this.cargarDatosIniciales();
    this.notificationService.success('Vehículo guardado correctamente');
  }
  
  // ✅ Métodos mantenidos para compatibilidad, pero ahora usan cargarDatosIniciales()
  cargarVehiculos(): void {
    console.warn('cargarVehiculos() llamado individualmente - considera usar cargarDatosIniciales()');
  }
  
  cargarEmpresas(): void {
    console.warn('cargarEmpresas() llamado individualmente - considera usar cargarDatosIniciales()');
  }

  get aniosDisponibles(): number[] {
    const anios = new Set<number>();
    this.vehiculos.forEach(v => {
      if (v.fechaFabricacion && v.fechaFabricacion > 0) {
        anios.add(v.fechaFabricacion);
      }
    });
    return Array.from(anios).sort((a, b) => b - a);
  }
  
  get vehiculosFiltrados(): VehiculoResponse[] {
    return this.vehiculos.filter((v: VehiculoResponse) => {
      const coincidePlaca = !this.filtroPlaca ||
        v.placa?.toLowerCase().includes(this.filtroPlaca.toLowerCase());
      
      const estadoCalculado = this.calcularEstado(v);
      const coincideEstado = !this.filtroEstado || this.filtroEstado === 'todos' ||
        estadoCalculado === this.filtroEstado;
      
      const coincideEmpresa = !this.filtroEmpresa ||
        v.empresa?.nombre?.toLowerCase().includes(this.filtroEmpresa.toLowerCase());
      
      const coincideAnioInicio = !this.filtroFechaFabricacionInicio ||
        !v.fechaFabricacion || v.fechaFabricacion >= this.filtroFechaFabricacionInicio;
      const coincideAnioFin = !this.filtroFechaFabricacionFin ||
        !v.fechaFabricacion || v.fechaFabricacion <= this.filtroFechaFabricacionFin;
      
      return coincidePlaca && coincideEstado && coincideEmpresa && coincideAnioInicio && coincideAnioFin;
    });
  }

  calcularEstado(vehiculo: VehiculoResponse): string {
    if (!vehiculo.activo) return 'no_habilitado';
    return 'habilitado';
  }
  
  get page(): number { return this.currentPage; }
  get totalPages(): number { return Math.ceil(this.vehiculosFiltrados.length / this.pageSize); }
  get totalElements(): number { return this.vehiculosFiltrados.length; }
  
  cambiarPagina(page: number): void {
    this.currentPage = page;
  }
  
  get vehiculosPaginados(): VehiculoResponse[] {
    const start = this.currentPage * this.pageSize;
    return this.vehiculosFiltrados.slice(start, start + this.pageSize);
  }
  
  get totalVehiculos(): number { return this.vehiculos.length; }
  get habilitados(): number { return this.vehiculos.filter(v => v.activo === true).length; }
  get noHabilitados(): number { return this.vehiculos.filter(v => v.activo === false).length; }
  get enTramite(): number { return 0; }
  
  getEstadoFormateado(vehiculo: VehiculoResponse): string {
    if (!vehiculo.activo) return 'No Habilitado';
    if (vehiculo.estadoTecnico) {
      const estados: { [key: string]: string } = {
        'apto': 'Apto',
        'condicional': 'Condicional',
        'no_apto': 'No Apto',
        'pendiente_inspeccion': 'Pendiente Inspección'
      };
      return estados[vehiculo.estadoTecnico] || vehiculo.estadoTecnico;
    }
    return 'Habilitado';
  }
  
  getColorEstado(vehiculo: VehiculoResponse): string {
    if (!vehiculo.activo) return 'bg-gray-100 text-gray-800 border-gray-200';
    const colores: { [key: string]: string } = {
      'apto': 'bg-green-100 text-green-800 border-green-200',
      'condicional': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'no_apto': 'bg-red-100 text-red-800 border-red-200',
      'pendiente_inspeccion': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colores[vehiculo.estadoTecnico] || 'bg-green-100 text-green-800 border-green-200';
  }
  
  abrirModalVehiculo(vehiculo?: VehiculoResponse): void {
    if (vehiculo) {
      this.modoEdicion = true;
      this.vehiculoEditando = { ...vehiculo };
    } else {
      this.modoEdicion = false;
      this.vehiculoEditando = null;
      this.nuevoVehiculo = {
        placa: '',
        marca: '',
        modelo: '',
        fechaFabricacion: 0,
        color: '',
        categoria: '',
        pesoNeto: undefined,
        tipoTransporteId: 0,
        categoriaTransporteId: 0,
        empresa: undefined,
        activo: true,
        estadoTecnico: '',
        observaciones: ''
      };
    }
    this.mostrandoModal = true;
  }
  
  guardarVehiculo(): void {
    if (!this.validarVehiculo()) return;

    this.cargando = true;
    this.error = null;

    // Preparar datos para enviar al backend
    const datos = this.modoEdicion && this.vehiculoEditando
      ? this.vehiculoEditando
      : this.nuevoVehiculo;

    // Preparar datos para enviar al backend
    const datosVehiculo = this.modoEdicion && this.vehiculoEditando
      ? this.vehiculoEditando
      : this.nuevoVehiculo;

    // Mapear datos al formato esperado por el backend
    const datosAEnviar = {
      placa: datosVehiculo.placa || '',
      fechaFabricacion: datosVehiculo.fechaFabricacion || 0,
      marca: datosVehiculo.marca || '',
      modelo: datosVehiculo.modelo || '',
      color: datosVehiculo.color || undefined,
      categoria: datosVehiculo.categoria || undefined,
      pesoNeto: datosVehiculo.pesoNeto || undefined,
      tipoTransporteId: 1, // TODO: Obtener del formulario o configuración
      categoriaTransporteId: 1, // TODO: Obtener del formulario o configuración
      empresaId: datosVehiculo.empresa?.id || undefined,
      observaciones: datosVehiculo.observaciones || undefined
    };

    console.log('Intentando guardar vehículo:', datosAEnviar);

    const operation = this.modoEdicion && this.vehiculoEditando
      ? this.vehiculoService.actualizar(this.vehiculoEditando.id, datosAEnviar)
      : this.vehiculoService.crear(datosAEnviar as any);

    operation.subscribe({
      next: (resultado) => {
        console.log('Vehículo guardado exitosamente:', resultado);
        this.cargando = false;
        this.cerrarModal();
        this.cargarDatosIniciales();
        this.notificationService.success(
          this.modoEdicion ? 'Vehículo actualizado correctamente' : 'Vehículo creado correctamente',
          'Éxito'
        );
      },
      error: (err: any) => {
        console.error('Error guardando vehículo:', err);
        this.notificationService.error(err.error?.message || 'Error al guardar vehículo', 'Error');
        this.cargando = false;
      }
    });
  }
  
  validarVehiculo(): boolean {
    this.error = null;
    const datos = this.modoEdicion && this.vehiculoEditando
      ? this.vehiculoEditando
      : this.nuevoVehiculo;

    if (!datos.placa || datos.placa.trim() === '') {
      this.notificationService.error('La placa es obligatoria', 'Validación');
      return false;
    }

    if (!datos.marca || datos.marca.trim() === '') {
      this.notificationService.error('La marca es obligatoria', 'Validación');
      return false;
    }

    if (!datos.modelo || datos.modelo.trim() === '') {
      this.notificationService.error('El modelo es obligatorio', 'Validación');
      return false;
    }

    if (!datos.fechaFabricacion || datos.fechaFabricacion < 1900 || datos.fechaFabricacion > new Date().getFullYear() + 1) {
      this.notificationService.error(`El año de fabricación debe estar entre 1900 y ${new Date().getFullYear() + 1}`, 'Validación');
      return false;
    }

    // Validar que la empresa esté seleccionada
    if (!datos.empresa) {
      this.notificationService.error('Debe seleccionar una empresa', 'Validación');
      return false;
    }

    return true;
  }

  // ✅ NUEVO: Habilitar vehículo
  habilitarVehiculo(vehiculo: VehiculoResponse): void {
    if (!confirm(`¿Está seguro de habilitar el vehículo ${vehiculo.placa}?`)) return;

    this.cargando = true;

    this.vehiculoService.habilitar(vehiculo.id).subscribe({
      next: () => {
        this.cargando = false;
        this.cargarDatosIniciales();
        this.notificationService.success('Vehículo habilitado correctamente', 'Éxito');
      },
      error: (err: any) => {
        console.error('Error habilitando vehículo:', err);
        this.notificationService.error(err.error?.message || 'Error al habilitar vehículo', 'Error');
        this.cargando = false;
      }
    });
  }

  // ✅ NUEVO: Deshabilitar vehículo
  deshabilitarVehiculo(vehiculo: VehiculoResponse): void {
    if (!confirm(`¿Está seguro de deshabilitar el vehículo ${vehiculo.placa}?`)) return;

    this.cargando = true;

    this.vehiculoService.deshabilitar(vehiculo.id).subscribe({
      next: () => {
        this.cargando = false;
        this.cargarDatosIniciales();
        this.notificationService.success('Vehículo deshabilitado correctamente', 'Éxito');
      },
      error: (err: any) => {
        console.error('Error deshabilitando vehículo:', err);
        this.notificationService.error(err.error?.message || 'Error al deshabilitar vehículo', 'Error');
        this.cargando = false;
      }
    });
   }

   eliminarVehiculo(vehiculo: VehiculoResponse): void {
     if (!confirm(`¿Está seguro de eliminar el vehículo ${vehiculo.placa}? Esta acción no se puede deshacer.`)) return;

     this.cargando = true;

     this.vehiculoService.eliminar(vehiculo.id).subscribe({
       next: () => {
         this.cargando = false;
         this.cargarDatosIniciales();
         this.notificationService.success('Vehículo eliminado correctamente', 'Éxito');
       },
       error: (err: any) => {
         console.error('Error eliminando vehículo:', err);
         this.notificationService.error(err.error?.message || 'Error al eliminar vehículo', 'Error');
         this.cargando = false;
       }
     });
   }

   verDetalle(vehiculo: VehiculoResponse): void {
    this.router.navigate(['/app/vehiculos', vehiculo.id]);
  }
  
  mostrarExito(mensaje: string): void {
    this.exito = mensaje;
    setTimeout(() => this.exito = null, 3000);
  }

  // Empresas filtradas para el modal
  get empresasFiltradas(): EmpresaResponse[] {
    if (!this.filtroEmpresaModal || this.filtroEmpresaModal.trim() === '') {
      return this.empresas;
    }
    return this.empresas.filter(emp =>
      emp.nombre.toLowerCase().includes(this.filtroEmpresaModal.toLowerCase())
    );
  }
  
  limpiarFiltros(): void {
    this.filtroPlaca = '';
    this.filtroEstado = '';
    this.filtroEmpresa = '';
    this.filtroFechaFabricacionInicio = null;
    this.filtroFechaFabricacionFin = null;
    this.currentPage = 0;
  }
}
