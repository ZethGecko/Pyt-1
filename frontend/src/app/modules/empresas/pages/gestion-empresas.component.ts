import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, finalize, forkJoin, BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { EmpresaService, EmpresaResponse, EmpresaCreateRequest, EmpresaUpdateRequest } from '../services/empresa.service';
import { GerenteService, GerenteResponse, GerenteCreateRequest } from '../services/gerente.service';
import { SubtipoTransporteService, SubtipoTransporte } from '../../configuracion/services/subtipo-transporte.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-gestion-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './gestion-empresas.component.html',
  styleUrls: ['./gestion-empresas.component.scss']
})
export class GestionEmpresasComponent implements OnInit {
  
  empresas: EmpresaResponse[] = [];
  cargando = false;
  // Paginación
  currentPage = 0;
  pageSize = 10;

  // Alias pagination
  get page(): number { return this.currentPage; }
  get totalPages(): number { return Math.ceil(this.getEmpresasFiltradas().length / this.pageSize); }
  get totalElements(): number { return this.getEmpresasFiltradas().length; }

  cambiarPagina(page: number): void {
    this.currentPage = page;
  }

  // Alias empresaEditando - returns a merged object with all needed properties
  get empresaEditando(): any {
    if (this.modoModal === 'editar' && this.empresaSeleccionada) {
      return {
        ...this.formulario,
        ...this.empresaSeleccionada
      };
    }
    return this.formulario;
  }

  // Filtros
  get filtroBusqueda(): string { return this._filtroBusqueda; }
  set filtroBusqueda(value: string) {
    this._filtroBusqueda = value;
    this.currentPage = 0; // Reset to first page on filter change
  }
  private _filtroBusqueda = '';
  
  get filtroEstado(): string { return this._filtroEstado; }
  set filtroEstado(value: string) {
    this._filtroEstado = value;
    this.currentPage = 0; // Reset to first page on filter change
  }
  private _filtroEstado = '';
  
  get filtroSubtipoTransporte(): number | undefined { return this._filtroSubtipoTransporte; }
  set filtroSubtipoTransporte(value: number | undefined) {
    this._filtroSubtipoTransporte = value;
    this.currentPage = 0; // Reset to first page on filter change
  }
  private _filtroSubtipoTransporte: number | undefined = undefined;
  
  // Modal
  mostrarModal = false;
  modoModal: 'crear' | 'editar' = 'crear';
  empresaSeleccionada: EmpresaResponse | null = null;
  
  // Formulario corregido para coincidir con el backend
  formulario: EmpresaCreateRequest = {
    nombre: '',
    codigo: '',
    ruc: '',
    direccionLegal: '',
    contactoTelefono: '',
    email: '',
    gerenteId: undefined,
    subtipoTransporteId: undefined,
    inicioVigencia: undefined,
    finVigencia: undefined,
    activo: true,
    estadoOperativo: 'en_proceso'
  };
  
  constructor(
    private empresaService: EmpresaService,
    private gerenteService: GerenteService,
    private subtipoService: SubtipoTransporteService,
    private notificationService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    console.log('ngOnInit: Iniciando carga de datos');
    this.cargarEmpresasYGerentes();
    this.cargarSubtiposTransporte();
  }
  
  // ✅ NUEVO: Cargar solo empresas (como en TUPAC)
  cargarEmpresas(): void {
    this.cargando = true;
    
    this.empresaService.listarTodos().subscribe({
      next: (data: EmpresaResponse[]) => {
        this.empresas = data;
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
        this.notificationService.error('Error al cargar empresas', 'Error', 5000);
        console.error('Error cargando empresas:', err);
      }
    });
  }
  
  // ✅ NUEVO: Cargar empresas y gerentes (para operaciones con gerentes)
  cargarEmpresasYGerentes(): void {
    this.cargando = true;
    
    forkJoin({
      empresas: this.empresaService.listarTodos(),
      gerentes: this.gerenteService.listarTodos()
    }).subscribe({
      next: (resultado) => {
        this.empresas = resultado.empresas;
        this.todosGerentes = resultado.gerentes;

        console.log('Todos los gerentes recibidos:', resultado.gerentes);
        console.log('Gerentes activos:', resultado.gerentes.filter(g => g.activo));

        // TEMPORALMENTE: mostrar todos los gerentes para identificar el problema
        this.gerentesDisponibles = resultado.gerentes;
        console.log('Mostrando TODOS los gerentes temporalmente:', resultado.gerentes);
        this.gerentesDisponibles$.next(this.gerentesDisponibles);

        console.log('Gerentes disponibles para empresas (todos activos):', this.gerentesDisponibles.length, this.gerentesDisponibles);
        this.gerentes = this.gerentesDisponibles;
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
        this.notificationService.error('Error al cargar datos', 'Error', 5000);
        console.error('Error cargando empresas y gerentes:', err);
      }
    });
  }
  
  // 🎯 SUBTIPOS DE TRANSPORTE
  subtiposTransporte: SubtipoTransporte[] = [];
  
  cargarSubtiposTransporte(): void {
    this.subtipoService.getAll().subscribe({
      next: (response: SubtipoTransporte[]) => {
        console.log('Subtipos response:', response);
        this.subtiposTransporte = response;
      },
      error: (err) => console.error('Error cargando subtipos de transporte:', err)
    });
  }
  
  // 🎯 GERENTES
  gerentes: GerenteResponse[] = [];
  gerentesDisponibles$ = new BehaviorSubject<GerenteResponse[]>([]);
  gerentesDisponibles: GerenteResponse[] = [];

  // Getter para compatibilidad
  get gerentesDisponiblesValue(): GerenteResponse[] {
    return this.gerentesDisponibles$.value;
  }
  
  // 🎯 MODAL GERENTE
  mostrarModalGerente = false;
  formularioGerente: {
   nombre: string;
   dni: number;
   telefono: string;
   whatsapp: string;
   partidaElectronica: string;
   inicioVigenciaPoder?: Date | string | null;
   finVigenciaPoder?: Date | string | null;
   activo: boolean;
 } = {
    nombre: '',
    dni: 0,
    telefono: '',
    whatsapp: '',
    partidaElectronica: '',
    inicioVigenciaPoder: new Date(),
    finVigenciaPoder: undefined,
    activo: true
  };
  errorGerente: string | null = null;
  
  get isEditandoGerente(): boolean { return !!this.gerenteEditandoId; }
  
  // 🎯 LISTA DE GERENTES
  mostrarListaGerentes = false;
  todosGerentes: GerenteResponse[] = [];
  filtroGerente = '';
  filtroEstadoGerente = '';
  
  get gerentesFiltrados(): GerenteResponse[] {
    return this.todosGerentes.filter(g => {
      const coincideBusqueda = !this.filtroGerente || 
        g.nombre?.toLowerCase().includes(this.filtroGerente.toLowerCase()) ||
        g.dni?.toString().includes(this.filtroGerente);
      const coincideEstado = !this.filtroEstadoGerente || 
        this.filtroEstadoGerente === 'todos' ||
        (this.filtroEstadoGerente === 'activo' && g.activo) ||
        (this.filtroEstadoGerente === 'inactivo' && !g.activo) ||
        (this.filtroEstadoGerente === 'poder_vigente' && this.tienePoderVigente(g));
      return coincideBusqueda && coincideEstado;
    });
  }
  
  tienePoderVigente(gerente: GerenteResponse): boolean {
    if (!gerente.activo) return false;
    if (!gerente.inicioVigenciaPoder) return false;

    try {
      const inicio = new Date(gerente.inicioVigenciaPoder);
      const fin = gerente.finVigenciaPoder ? new Date(gerente.finVigenciaPoder) : null;
      const ahora = new Date();

      // Set time to start of day for date comparison
      const inicioStartOfDay = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
      const ahoraStartOfDay = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

      const inicioValido = inicioStartOfDay <= ahoraStartOfDay;
      const finValido = !fin || fin >= ahoraStartOfDay;

      return inicioValido && finValido;
    } catch (error) {
      console.error('Error parsing dates for gerente:', gerente.id, error);
      return false;
    }
  }
  
  getLabelEstadoGerente(gerente: GerenteResponse): string {
    if (!gerente.activo) return 'Inactivo';
    if (this.tienePoderVigente(gerente)) return 'Poder Vigente';
    return 'Poder Vencido';
  }
  
  getClassEstadoGerente(gerente: GerenteResponse): string {
    if (!gerente.activo) return 'badge-danger';
    if (this.tienePoderVigente(gerente)) return 'badge-success';
    return 'badge-warning';
  }
  
  abrirListaGerentes(): void {
    // ✅ Cerrar modal de empresa si está abierto
    this.cerrarModal();
    // ✅ Mostrar el modal de gerentes inmediatamente
    this.mostrarListaGerentes = true;
    this.changeDetectorRef.detectChanges();
  }
  
  cerrarListaGerentes(): void {
    this.mostrarListaGerentes = false;
    this.filtroGerente = '';
    this.filtroEstadoGerente = '';
  }
  
  editarGerente(gerente: GerenteResponse): void {
    // Open modal to edit gerente
    this.formularioGerente = {
      nombre: gerente.nombre,
      dni: gerente.dni,
      telefono: gerente.telefono || '',
      whatsapp: gerente.whatsapp || '',
      partidaElectronica: gerente.partidaElectronica || '',
      inicioVigenciaPoder: gerente.inicioVigenciaPoder ? this.formatDateForInput(gerente.inicioVigenciaPoder) : null,
      finVigenciaPoder: gerente.finVigenciaPoder ? this.formatDateForInput(gerente.finVigenciaPoder) : null,
      activo: gerente.activo
    };
    this.gerenteEditandoId = gerente.id;
    this.mostrarModalGerente = true;
    this.cerrarListaGerentes();
  }
  
  gerenteEditandoId: number | null = null;
  
  // ✅ Cargar gerentes con poder vigente (TUPAC pattern) y PRECARGAR todos
  cargarGerentes(): void {
    // ✅ Ahora usa cargarEmpresasYGerentes para consistencia
    this.cargarEmpresasYGerentes();
  }
  
  abrirModalGerente(): void {
    // ✅ Cerrar modal de lista de gerentes si está abierto
    this.cerrarListaGerentes();
    this.formularioGerente = {
      nombre: '',
      dni: 0,
      telefono: '',
      whatsapp: '',
      partidaElectronica: '',
      inicioVigenciaPoder: null,
      finVigenciaPoder: null,
      activo: true
    };
    this.errorGerente = null;
    this.gerenteEditandoId = null;
    this.mostrarModalGerente = true;
  }
  
   cerrarModalGerente(): void {
     this.mostrarModalGerente = false;
     this.errorGerente = null;
   }

   // Manejar cambio en checkbox de activo
   onActivoChange(event: any): void {
     if (!event.target.checked) {
       // Si se desactiva, limpiar fechas de poder
       this.formularioGerente.inicioVigenciaPoder = null;
       this.formularioGerente.finVigenciaPoder = null;
     }
   }
   
   // Formatear fecha para input HTML date (yyyy-MM-dd)
   private formatDateForInput(date: Date | string | null | undefined): string | null {
     if (!date) return null;
     const d = new Date(date);
     if (isNaN(d.getTime())) return null;
     const year = d.getFullYear();
     const month = String(d.getMonth() + 1).padStart(2, '0');
     const day = String(d.getDate()).padStart(2, '0');
     return `${year}-${month}-${day}`;
   }
  
  guardarGerente(): void {
    if (!this.formularioGerente.nombre || !this.formularioGerente.dni) {
      this.notificationService.warning('Por favor complete el nombre y DNI', 'Validación', 3000);
      return;
    }
    
    this.cargando = true; // Usar variable global
    this.errorGerente = null;
    
    // Preparar datos para enviar al backend
    const gerenteData = {
      nombre: this.formularioGerente.nombre,
      dni: this.formularioGerente.dni,
      telefono: this.formularioGerente.telefono || undefined,
      whatsapp: this.formularioGerente.whatsapp || undefined,
      partidaElectronica: this.formularioGerente.partidaElectronica || undefined,
      inicioVigenciaPoder: this.formularioGerente.inicioVigenciaPoder || undefined,
      finVigenciaPoder: this.formularioGerente.finVigenciaPoder || undefined,
      activo: this.formularioGerente.activo
    };
    
    // Si estamos editando
    if (this.gerenteEditandoId) {
      this.gerenteService.actualizar(this.gerenteEditandoId, gerenteData).subscribe({
        next: () => {
          this.cargando = false;
          this.notificationService.success('Gerente actualizado exitosamente', 'Éxito', 3000);
          this.cerrarModalGerente();
          // ✅ RECARGAR EMPRESAS Y GERENTES (optimizado)
          this.cargarEmpresasYGerentes();
        },
        error: (err) => {
          this.cargando = false;
          this.errorGerente = err.error?.message || 'Error al actualizar gerente';
          this.notificationService.error(err.error?.message || 'Error al actualizar gerente', 'Error', 5000);
        }
      });
    } else {
      // Creating new
      this.gerenteService.crear(gerenteData).subscribe({
        next: (gerente: GerenteResponse) => {
          this.cargando = false;
          // ✅ RECARGAR EMPRESAS Y GERENTES (optimizado)
          this.cargarEmpresasYGerentes();
          this.formulario.gerenteId = gerente.id;
          this.cerrarModalGerente();
          this.notificationService.success('Gerente creado exitosamente', 'Éxito', 3000);
        },
        error: (err) => {
          this.cargando = false;
          this.errorGerente = err.error?.message || 'Error al crear gerente';
          this.notificationService.error(err.error?.message || 'Error al crear gerente', 'Error', 5000);
        }
      });
    }
  }
  
  // 🎯 ESTADÍSTICAS - Actualizadas para usar el campo correcto
  get totalEmpresas(): number { return this.empresas.length; }
  
  get empresasPaginadas(): EmpresaResponse[] {
    const filtered = this.getEmpresasFiltradas();
    const start = this.currentPage * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }
  
  get empresasActivas(): number { 
    return this.empresas.filter(e => e.activo === true).length; 
  }
  
  get empresasInactivas(): number { 
    return this.empresas.filter(e => e.activo === false).length; 
  }
  
  get empresasPendientes(): number {
    return this.empresas.filter(e => e.estadoOperativo === 'en_proceso').length;
  }
  
  getEmpresasFiltradas(): EmpresaResponse[] {
    return this.empresas.filter(empresa => {
      const coincideBusqueda = !this.filtroBusqueda ||
        (empresa.nombre && empresa.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase())) ||
        empresa.ruc.includes(this.filtroBusqueda);
      
      // El filtro de estado ahora usa estadoOperativo
      const coincideEstado = !this.filtroEstado ||
        empresa.estadoOperativo === this.filtroEstado ||
        (this.filtroEstado === 'activa' && empresa.activo === true) ||
        (this.filtroEstado === 'inactiva' && empresa.activo === false);
      
      const coincideSubtipo = this.filtroSubtipoTransporte === undefined ||
        empresa.subtipoTransporteId === this.filtroSubtipoTransporte;
      
      return coincideBusqueda && coincideEstado && coincideSubtipo;
    });
  }
  
  abrirModalCrear(): void {
    // ✅ Cerrar modal de lista de gerentes si está abierto
    this.cerrarListaGerentes();
    this.modoModal = 'crear';
    this.empresaSeleccionada = null;
    this.formulario = {
      nombre: '',
      codigo: '',
      ruc: '',
      direccionLegal: '',
      contactoTelefono: '',
      email: '',
      gerenteId: undefined,
      subtipoTransporteId: undefined,
      inicioVigencia: undefined,
      finVigencia: undefined,
      activo: true,
      estadoOperativo: 'en_proceso'
    };
    this.mostrarModal = true;
  }
  
  abrirModalEditar(empresa: EmpresaResponse): void {
    // ✅ Cerrar modal de lista de gerentes si está abierto
    this.cerrarListaGerentes();
    this.modoModal = 'editar';
    this.empresaSeleccionada = empresa;
    
    // Convertir fecha de inicioVigencia a formato para input datetime-local
    let inicioVigenciaFormateada: string | Date | undefined;
    if (empresa.inicioVigencia) {
      const formateada = this.formatDateForInput(empresa.inicioVigencia);
      inicioVigenciaFormateada = formateada !== null ? formateada : undefined;
    } else {
      inicioVigenciaFormateada = undefined;
    }
    
    // Convertir finVigencia también
    let finVigenciaFormateada: string | Date | undefined;
    if (empresa.finVigencia) {
      const formateada = this.formatDateForInput(empresa.finVigencia);
      finVigenciaFormateada = formateada !== null ? formateada : undefined;
    } else {
      finVigenciaFormateada = undefined;
    }

    this.formulario = {
      nombre: empresa.nombre || '',
      codigo: empresa.codigo || '',
      ruc: empresa.ruc,
      direccionLegal: empresa.direccionLegal || '',
      contactoTelefono: empresa.contactoTelefono || '',
      email: empresa.email || '',
      gerenteId: empresa.gerenteId,
      subtipoTransporteId: empresa.subtipoTransporteId,
      inicioVigencia: inicioVigenciaFormateada,
      finVigencia: finVigenciaFormateada,
      activo: empresa.activo !== undefined ? empresa.activo : true,
      estadoOperativo: empresa.estadoOperativo || 'en_proceso'
    };
    this.mostrarModal = true;
  }
  
  cerrarModal(): void {
    this.mostrarModal = false;
    this.empresaSeleccionada = null;
  }
  
  guardar(): void {
    if (!this.validarFormulario()) {
      this.notificationService.warning('Por favor complete todos los campos requeridos', 'Validación', 3000);
      return;
    }
    
    if (this.modoModal === 'crear') {
      this.crearEmpresa();
    } else {
      this.actualizarEmpresa();
    }
  }
  
  validarFormulario(): boolean {
    return !!this.formulario.nombre &&
           !!this.formulario.ruc &&
           !!this.formulario.direccionLegal &&
           !!this.formulario.contactoTelefono &&
           !!this.formulario.inicioVigencia;
  }
  
  crearEmpresa(): void {
  this.cargando = true;
    
  // Convertir fechas a formato yyyy-MM-dd (sin hora) para LocalDate
  const data: any = {
    ...this.formulario
  };
   
  if (this.formulario.inicioVigencia) {
    data.inicioVigencia = this.formatDateForInput(this.formulario.inicioVigencia);
  }
   
  if (this.formulario.finVigencia) {
    data.finVigencia = this.formatDateForInput(this.formulario.finVigencia);
  } else {
    data.finVigencia = undefined;
  }
    
  // Asegurar que se envíen los IDs de gerente y subtipo de transporte como undefined si están vacíos
  if (!data.gerenteId) {
    data.gerenteId = undefined;
  }
    
  if (!data.subtipoTransporteId) {
    data.subtipoTransporteId = undefined;
  }
    
  // Asegurar que contactoTelefono se envíe como undefined si está vacío
  if (!data.contactoTelefono) {
    data.contactoTelefono = undefined;
  }
    
  if (!data.email) {
    data.email = undefined;
  }
    
  this.empresaService.crear(data).subscribe({
    next: () => {
      this.cargando = false;
      this.notificationService.success('Empresa creada exitosamente', 'Éxito', 3000);
      this.cerrarModal();
      this.cargarEmpresas(); // ✅ Recargar solo empresas (optimizado)
    },
    error: (err: any) => {
      this.cargando = false;
      this.notificationService.error(err.error?.message || 'Error al crear empresa', 'Error', 5000);
      console.error(err);
    }
  });
}
  
  actualizarEmpresa(): void {
  if (!this.empresaSeleccionada) return;
    
  this.cargando = true;
    
  // Crear update request con todos los campos necesarios
  const updateRequest: any = {
    nombre: this.formulario.nombre,
    ruc: this.formulario.ruc,  // RUC es requerido
    codigo: this.formulario.codigo || undefined,
    direccionLegal: this.formulario.direccionLegal,
    contactoTelefono: this.formulario.contactoTelefono || undefined,
    email: this.formulario.email || undefined,
    gerenteId: this.formulario.gerenteId,
    subtipoTransporteId: this.formulario.subtipoTransporteId,
    activo: this.formulario.activo,
    estadoOperativo: this.formulario.estadoOperativo
  };
   
  // Convertir fechas a formato yyyy-MM-dd (sin hora) para LocalDate
  if (this.formulario.inicioVigencia) {
    updateRequest.inicioVigencia = this.formatDateForInput(this.formulario.inicioVigencia);
  }
   
  if (this.formulario.finVigencia) {
    updateRequest.finVigencia = this.formatDateForInput(this.formulario.finVigencia);
  } else {
    updateRequest.finVigencia = undefined;
  }
    
  this.empresaService.actualizar(this.empresaSeleccionada.id, updateRequest).subscribe({
    next: () => {
      this.cargando = false;
      this.notificationService.success('Empresa actualizada exitosamente', 'Éxito', 3000);
      this.cerrarModal();
      this.cargarEmpresas(); // ✅ Recargar solo empresas (optimizado)
    },
    error: (err: any) => {
      this.cargando = false;
      this.notificationService.error(err.error?.message || 'Error al actualizar empresa', 'Error', 5000);
      console.error(err);
    }
  });
}
  
  activarEmpresa(empresa: EmpresaResponse): void {
    if (!confirm(`¿Está seguro de activar a ${empresa.nombre}?`)) return;
    
    this.empresaService.activar(empresa.id).subscribe({
      next: () => {
        this.notificationService.success('Empresa activada exitosamente', 'Éxito', 3000);
        this.cargarEmpresas(); // ✅ Recargar solo empresas (optimizado)
      },
      error: (err: any) => {
        this.notificationService.error(err.error?.message || 'Error al activar empresa', 'Error', 5000);
      }
    });
  }
  
  desactivarEmpresa(empresa: EmpresaResponse): void {
    if (!confirm(`¿Está seguro de desactivar a ${empresa.nombre}?`)) return;
    
    this.empresaService.desactivar(empresa.id).subscribe({
      next: () => {
        this.notificationService.success('Empresa desactivada exitosamente', 'Éxito', 3000);
        this.cargarEmpresas(); // ✅ Recargar solo empresas (optimizado)
      },
      error: (err: any) => {
        this.notificationService.error(err.error?.message || 'Error al desactivar empresa', 'Error', 5000);
      }
    });
  }
  
  eliminarEmpresa(empresa: EmpresaResponse): void {
    if (!confirm(`¿Está seguro de eliminar a ${empresa.nombre}? Esta acción no se puede deshacer.`)) return;
    
    this.empresaService.eliminar(empresa.id).subscribe({
      next: () => {
        this.notificationService.success('Empresa eliminada exitosamente', 'Éxito', 3000);
        this.cargarEmpresas(); // ✅ Recargar solo empresas (optimizado)
      },
      error: (err: any) => {
        this.notificationService.error(err.error?.message || 'Error al eliminar empresa', 'Error', 5000);
      }
    });
  }
  
  // Actualizado para usar estadoOperativo
  getBadgeClass(estado: string | undefined): string {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    switch (estado) {
      case 'habilitada': return 'bg-green-100 text-green-800';
      case 'suspendida': return 'bg-red-100 text-red-800';
      case 'en_proceso': return 'bg-yellow-100 text-yellow-800';
      case 'inhabilitada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Actualizado para usar estadoOperativo
  getEstadoLabel(estado: string | undefined): string {
    if (!estado) return 'Sin estado';
    
    switch (estado) {
      case 'habilitada': return 'Habilitada';
      case 'suspendida': return 'Suspendida';
      case 'en_proceso': return 'En Proceso';
      case 'inhabilitada': return 'Inhabilitada';
      default: return estado;
    }
  }
  
  // 🎯 Get gerente nombre
  getGerenteNombre(gerenteId?: number): string {
    if (!gerenteId) return 'Sin asignar';
    const gerente = this.gerentes.find(g => g.id === gerenteId);
    return gerente ? `${gerente.nombre} (DNI: ${gerente.dni})` : 'Sin asignar';
  }
  
  // 🎯 Get nombre corto de gerente
  getGerenteNombreCorto(gerenteId?: number): string {
    if (!gerenteId) return 'Sin asignar';
    const gerente = this.gerentes.find(g => g.id === gerenteId);
    return gerente ? gerente.nombre : 'Sin asignar';
  }
  
// 🎯 MODAL DETALLES
mostrarModalDetalles = false;
empresaDetalle: any = null;

verDetalles(empresa: any): void {
  this.cargando = true;
  // Cargar la proyección completa desde el backend
  this.empresaService.obtenerProjection(empresa.id).subscribe({
    next: (proyeccion) => {
      this.empresaDetalle = proyeccion;
      this.mostrarModalDetalles = true;
      this.cargando = false;
    },
    error: (err) => {
      this.notificationService.error('Error al cargar detalles de empresa', 'Error', 5000);
      this.cargando = false;
      console.error(err);
    }
  });
}

cerrarModalDetalles(): void {
  this.mostrarModalDetalles = false;
  this.empresaDetalle = null;
}

// Helper para obtener nombre de subtipo de transporte
getSubtipoTransporteNombre(subtipoId: number | undefined): string {
  if (!subtipoId) return 'No asignado';
  const subtipo = this.subtiposTransporte.find(st => st.id === subtipoId);
  return subtipo ? subtipo.nombre : 'No encontrado';
}

  // 🗑️ Eliminar gerente
   eliminarGerente(gerente: GerenteResponse): void {
     if (!confirm(`¿Está seguro de eliminar al gerente ${gerente.nombre}? Esta acción no se puede deshacer.`)) return;

     this.cargando = true;

     this.gerenteService.eliminar(gerente.id).subscribe({
       next: () => {
         this.cargando = false;
         this.notificationService.success('Gerente eliminado exitosamente', 'Éxito', 3000);
         this.cargarEmpresasYGerentes(); // ✅ Recargar empresas y gerentes (optimizado)
         this.cerrarListaGerentes();
       },
       error: (err: any) => {
         this.cargando = false;
         const errorMsg = err.error?.message || 'Error al eliminar gerente';
         this.notificationService.error(errorMsg, 'Error', 5000);
       }
     });
   }

   // 🔴 Deshabilitar gerente
    deshabilitarGerente(gerente: GerenteResponse): void {
      if (!confirm(`¿Está seguro de deshabilitar al gerente ${gerente.nombre}? Se mantendrán las fechas de poder como histórico.`)) return;

      this.cargando = true;

      this.gerenteService.desactivar(gerente.id).subscribe({
        next: () => {
          this.cargando = false;
          this.notificationService.success('Gerente deshabilitado exitosamente', 'Éxito', 3000);
          this.cargarEmpresasYGerentes(); // ✅ Recargar empresas y gerentes (optimizado)
          this.cerrarListaGerentes();
        },
        error: (err: any) => {
          this.cargando = false;
          const errorMsg = err.error?.message || 'Error al deshabilitar gerente';
          this.notificationService.error(errorMsg, 'Error', 5000);
        }
      });
    }

   // 🟢 Habilitar gerente
    habilitarGerente(gerente: GerenteResponse): void {
      if (!confirm(`¿Está seguro de habilitar al gerente ${gerente.nombre}?`)) return;

      this.cargando = true;

      this.gerenteService.activar(gerente.id).subscribe({
        next: () => {
          this.cargando = false;
          this.notificationService.success('Gerente habilitado exitosamente', 'Éxito', 3000);
          this.cargarEmpresasYGerentes(); // ✅ Recargar empresas y gerentes (optimizado)
          this.cerrarListaGerentes();
        },
        error: (err: any) => {
          this.cargando = false;
          const errorMsg = err.error?.message || 'Error al habilitar gerente';
          this.notificationService.error(errorMsg, 'Error', 5000);
        }
      });
    }
}
