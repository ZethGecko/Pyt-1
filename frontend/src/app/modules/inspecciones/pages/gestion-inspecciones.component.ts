import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InspeccionService, InspeccionResponse, BloqueInspeccionDTO, InspeccionInstanciaResponse } from '../../inspecciones/services/inspeccion.service';
import { EmpresaService, EmpresaResponse } from '../../empresas/services/empresa.service';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { ModalProgramarInspeccionComponent } from '../components/modal-programar-inspeccion.component';
import { ModalInstanciasDisponiblesComponent } from '../components/modal-instancias-disponibles.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { FichaInspeccionService, FichaInspeccion } from '../../inspecciones/services/ficha-inspeccion.service';
import { Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-gestion-inspecciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalProgramarInspeccionComponent, ModalInstanciasDisponiblesComponent],
  templateUrl: './gestion-inspecciones.component.html',
  styleUrls: ['./gestion-inspecciones.component.scss']
})
export class GestionInspeccionesComponent implements OnInit {
  constructor(
    private inspeccionService: InspeccionService,
    private empresaService: EmpresaService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private authState: AuthStateService,
    private notificationService: NotificationService,
    private fichaInspeccionService: FichaInspeccionService
  ) {}

  ngOnInit(): void {
    this.cargarInspecciones();
    this.cargarEmpresas();
  }

  cargarInspecciones(): void {
    this.cargando = true;
    this.error = null;
    this.inspeccionService.listarPorBloque().subscribe({
      next: (bloques: BloqueInspeccionDTO[]) => {
        this.bloques = bloques;
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

  bloques: BloqueInspeccionDTO[] = [];
  empresas: EmpresaResponse[] = [];
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  estadosInspeccion = [
    { value: 'todos', label: 'Todos' },
    { value: 'PROGRAMADA', label: 'Programada' },
    { value: 'EN_CURSO', label: 'En curso' },
    { value: 'INICIADA', label: 'Iniciada' },
    { value: 'EN_PROCESO', label: 'En Proceso' },
    { value: 'FINALIZADA', label: 'Finalizada' },
    { value: 'CANCELADA', label: 'Cancelada' }
  ];

  clasesEstado: { [key: string]: string } = {
    'PROGRAMADA': 'bg-blue-100 text-blue-800 border-blue-200',
    'EN_CURSO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'INICIADA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'EN_PROCESO': 'bg-orange-100 text-orange-800 border-orange-200',
    'FINALIZADA': 'bg-green-100 text-green-800 border-green-200',
    'CANCELADA': 'bg-red-100 text-red-800 border-red-200'
  };

  filtroEmpresa = '';
  filtroEstado = '';
  filtroFecha = '';
  filtroRuc = '';

  mostrandoModalCreacion = false;
  inspeccionParaEditarId?: number;
  modoModal: 'crear' | 'agregar' | 'editar-datos' = 'crear';

  mostrarModalInstanciasDisponibles = false;
  inspeccionParaAgregarInstancias?: InspeccionResponse;
  instanciasDisponibles: InspeccionInstanciaResponse[] = [];
  cargandoInstanciasDisponibles = false;

  abrirModalCreacion(): void {
    this.inspeccionParaEditarId = undefined;
    this.modoModal = 'crear';
    this.mostrandoModalCreacion = true;
  }

  editarInspeccion(inspeccion: InspeccionResponse): void {
    this.inspeccionParaEditarId = inspeccion.idInspeccion;
    this.modoModal = 'editar-datos';
    this.mostrandoModalCreacion = true;
  }

  agregarVehiculosAInspeccion(inspeccion: InspeccionResponse): void {
    this.inspeccionParaAgregarInstancias = inspeccion;
    this.mostrarModalInstanciasDisponibles = true;
    this.cargarInstanciasDisponibles(inspeccion);
  }

  cargarInstanciasDisponibles(inspeccion: InspeccionResponse): void {
    this.cargandoInstanciasDisponibles = true;
    this.instanciasDisponibles = [];

    const tramiteId = this.obtenerIdTramiteDeInspeccion(inspeccion);
    if (!tramiteId) {
      this.cargandoInstanciasDisponibles = false;
      this.notificationService.error('No se pudo determinar el trámite de la inspección', 'Error', 3000);
      return;
    }

    this.inspeccionService.listarInstanciasDisponibles(tramiteId, inspeccion.idInspeccion).subscribe({
      next: (instancias) => {
        this.instanciasDisponibles = instancias;
        this.cargandoInstanciasDisponibles = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.cargandoInstanciasDisponibles = false;
        this.changeDetectorRef.detectChanges();
        console.error('Error cargando instancias disponibles:', err);
        this.notificationService.error('Error al cargar vehículos disponibles', 'Error', 3000);
      }
    });
  }

  agregarInstanciaAInspeccion(instanciaId: number): void {
    if (!this.inspeccionParaAgregarInstancias) return;

    this.cargando = true;
    this.inspeccionService.agregarInstancias(this.inspeccionParaAgregarInstancias.idInspeccion, [instanciaId]).subscribe({
      next: () => {
        this.notificationService.success('Vehículo agregado exitosamente', 'Éxito', 2000);
        this.cargarInstanciasDisponibles(this.inspeccionParaAgregarInstancias!);
        this.onInspeccionGuardada();
      },
      error: (err) => {
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
        this.notificationService.error(err.error?.message || 'Error al agregar vehículo', 'Error', 3000);
      }
    });
  }

  cerrarModalInstanciasDisponibles(): void {
    this.mostrarModalInstanciasDisponibles = false;
    this.inspeccionParaAgregarInstancias = undefined;
    this.instanciasDisponibles = [];
  }

  private obtenerIdTramiteDeInspeccion(inspeccion: InspeccionResponse): number | undefined {
    for (const bloque of this.bloques) {
      if (bloque.inspecciones.some(i => i.idInspeccion === inspeccion.idInspeccion)) {
        return bloque.idTramite;
      }
    }
    return undefined;
  }

  cerrarModalCreacion(): void {
    this.mostrandoModalCreacion = false;
    this.inspeccionParaEditarId = undefined;
    this.modoModal = 'crear';
  }

  onInspeccionGuardada(): void {
    this.cargarInspecciones();
    this.cerrarModalCreacion();
  }

  get bloquesFiltrados(): BloqueInspeccionDTO[] {
    return this.bloques.filter((bloque) => {
      const coincideEmpresa = !this.filtroEmpresa ||
        bloque.inspecciones.some(i =>
          i.empresaNombre?.toLowerCase().includes(this.filtroEmpresa.toLowerCase())
        );

      const coincideEstado = !this.filtroEstado || this.filtroEstado === 'todos' ||
        bloque.inspecciones.some(i => i.estado === this.filtroEstado);

      const coincideRuc = !this.filtroRuc ||
        bloque.inspecciones.some(i =>
          i.empresaNombre?.toLowerCase().includes(this.filtroRuc.toLowerCase())
        );

      return coincideEmpresa && coincideEstado && coincideRuc;
    });
  }

  iniciarBloque(bloque: BloqueInspeccionDTO): void {
    if (!confirm(`¿Está seguro de iniciar todas las inspecciones del bloque ${bloque.empresaNombre} (Trámite: ${bloque.idTramite})?`)) {
      return;
    }
    this.cargando = true;
    const primeraInspeccion = bloque.inspecciones[0];
    const fecha = primeraInspeccion.fechaProgramada.toISOString().split('T')[0];
    const lugar = primeraInspeccion.lugar || 'No especificado';

    this.inspeccionService.iniciarBloque(fecha, lugar, undefined).subscribe({
      next: () => {
        this.notificationService.success('Bloque iniciado exitosamente', 'Éxito', 2000);
        this.cargarInspecciones();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Error al iniciar bloque', 'Error', 5000);
        this.cargando = false;
      }
    });
  }

  cancelarBloque(bloque: BloqueInspeccionDTO): void {
    if (!confirm(`¿Está seguro de cancelar todas las inspecciones del bloque ${bloque.empresaNombre} (Trámite: ${bloque.idTramite})?`)) {
      return;
    }
    this.cargando = true;
    const primeraInspeccion = bloque.inspecciones[0];
    const fecha = primeraInspeccion.fechaProgramada.toISOString().split('T')[0];
    const lugar = primeraInspeccion.lugar || 'No especificado';

    this.inspeccionService.cancelarBloque(fecha, lugar).subscribe({
      next: () => {
        this.notificationService.success('Bloque cancelado exitosamente', 'Éxito', 2000);
        this.cargarInspecciones();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Error al cancelar bloque', 'Error', 5000);
        this.cargando = false;
      }
    });
  }

  verInstancias(bloque: BloqueInspeccionDTO): void {
    this.router.navigate(['/tramites/detalle', bloque.idTramite]);
  }

  agregarInstancias(bloque: BloqueInspeccionDTO): void {
    this.notificationService.info('Función en desarrollo', 'Info', 2000);
  }

  inspeccionSeleccionadaParaVer: InspeccionResponse | null = null;
  mostrarModalVerInstancias = false;
  cargandoInstancias = false;

  verInstanciasDeInspeccion(inspeccion: InspeccionResponse): void {
    this.cargandoInstancias = true;
    this.inspeccionService.obtenerConInstancias(inspeccion.idInspeccion).subscribe({
      next: (data) => {
        this.inspeccionSeleccionadaParaVer = data;
        this.mostrarModalVerInstancias = true;
        this.cargandoInstancias = false;
      },
      error: (err) => {
        this.notificationService.error('Error al cargar vehículos de la inspección', 'Error', 3000);
        this.cargandoInstancias = false;
      }
    });
  }

  cerrarModalVerInstancias(): void {
    this.mostrarModalVerInstancias = false;
    this.inspeccionSeleccionadaParaVer = null;
  }

  verFichaVehiculo(instancia: any): void {
    if (!instancia.fichaId) {
      if (confirm('Este vehículo no tiene ficha creada. ¿Desea crear una ahora?')) {
        this.crearFichaPorVehiculo(this.inspeccionSeleccionadaParaVer!.idInspeccion, instancia.idInstancia!).subscribe({
          next: (fichaCreada: FichaInspeccion) => {
            this.notificationService.success('Ficha creada. Redirigiendo...', 'Éxito', 1500);
            this.router.navigate(['/inspecciones', 'ficha', fichaCreada.id!]);
          },
          error: (err: any) => {
            this.notificationService.error('Error al crear ficha', 'Error', 3000);
          }
        });
      }
      return;
    }
    this.router.navigate(['/inspecciones', 'ficha', instancia.fichaId]);
  }

  iniciarInspeccion(inspeccion: InspeccionResponse): void {
    if (inspeccion.estado !== 'PROGRAMADA') {
      this.notificationService.warning('La inspección ya fue iniciada o finalizada', 'Acción no permitida', 3000);
      return;
    }
    this.cargando = true;

    this.inspeccionService.iniciar(inspeccion.idInspeccion, {}).subscribe({
      next: (data) => {
        inspeccion.estado = data.estado || 'EN_CURSO';
        this.notificationService.success('Inspección iniciada. Complete la ficha asignada.', 'Éxito', 2000);
        this.fichaInspeccionService.getByInspeccion(inspeccion.idInspeccion).subscribe({
          next: (fichas) => {
            this.cargando = false;
            const primeraFicha = fichas?.length ? fichas[0] : null;
            if (primeraFicha?.id) {
              this.router.navigate(['/inspecciones', 'ficha', primeraFicha.id]);
            } else {
              this.router.navigate(['/inspecciones', 'realizar', inspeccion.idInspeccion]);
            }
          },
          error: () => {
            this.cargando = false;
            this.router.navigate(['/inspecciones', 'realizar', inspeccion.idInspeccion]);
          }
        });
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Error al iniciar inspección', 'Error', 5000);
        this.cargando = false;
      }
    });
  }

  puedeEditarFichaDesdeModal(estado?: string): boolean {
    const estadoNormalizado = estado?.toUpperCase();
    return estadoNormalizado !== 'FINALIZADA' && estadoNormalizado !== 'CANCELADA';
  }

  private crearFichasParaVehiculos(inspeccion: InspeccionResponse): void {
    this.inspeccionService.obtenerConInstancias(inspeccion.idInspeccion).subscribe({
      next: (data: InspeccionResponse) => {
        const instancias = data.instancias || [];
        if (instancias.length === 0) {
          this.notificationService.warning('No hay vehículos asignados a esta inspección', 'Advertencia', 3000);
          this.cargando = false;
          return;
        }

        const sinFicha = instancias.filter(i => !i.fichaId);
        if (sinFicha.length === 0) {
          this.notificationService.success('Todas las fichas ya existen para esta inspección', 'Información', 2000);
          this.cargando = false;
          return;
        }

        let contador = 0;
        let primeraFichaId: number | null = null;

        sinFicha.forEach((instancia) => {
          this.crearFichaPorVehiculo(inspeccion.idInspeccion, instancia.idInstancia!).subscribe({
            next: (fichaCreada: FichaInspeccion) => {
              contador++;
              if (contador === 1) {
                primeraFichaId = fichaCreada.id!;
              }
              if (contador === sinFicha.length) {
                if (primeraFichaId) {
                  this.router.navigate(['/inspecciones', 'ficha', primeraFichaId]);
                } else {
                  this.router.navigate(['/inspecciones', 'realizar', data.idInspeccion]);
                }
                this.cargando = false;
              }
            },
            error: (err: any) => {
              console.error('Error creando ficha para vehículo', instancia.identificador, err);
              contador++;
              if (contador === sinFicha.length) {
                this.cargando = false;
              }
            }
          });
        });
      },
      error: (err) => {
        this.notificationService.error('Error al cargar vehículos de la inspección', 'Error', 3000);
        this.cargando = false;
      }
    });
  }

  private crearFichaPorVehiculo(inspeccionId: number, instanciaId: number, vehiculoId?: number): Observable<FichaInspeccion> {
    if (!inspeccionId || inspeccionId <= 0) {
      return throwError(() => new Error('ID de inspección no válido'));
    }
    if (!instanciaId || instanciaId <= 0) {
      return throwError(() => new Error('ID de instancia de trámite no válido'));
    }
    const currentUserId = this.authState.currentUser()?.id;
    const datosFicha: any = {
      inspeccionId,
      instanciaTramiteId: instanciaId
    };
    if (vehiculoId !== undefined) {
      datosFicha.vehiculoId = vehiculoId;
    }
    if (currentUserId !== undefined) {
      datosFicha.usuarioInspector = currentUserId;
    }
    return this.fichaInspeccionService.create(datosFicha);
  }

  terminarInspeccion(inspeccion: InspeccionResponse): void {
    if (!confirm(`¿Está seguro de terminar la inspección ${inspeccion.codigo}?`)) return;
    this.cargando = true;
    this.inspeccionService.terminar(inspeccion.idInspeccion, {}).subscribe({
      next: () => {
        this.notificationService.success('Inspección finalizada exitosamente', 'Éxito', 2000);
        this.cargarInspecciones();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Error al finalizar inspección', 'Error', 5000);
        this.cargando = false;
      }
    });
  }

  cancelarInspeccion(inspeccion: InspeccionResponse): void {
    if (!confirm(`¿Está seguro de cancelar la inspección ${inspeccion.codigo}?`)) return;
    this.cargando = true;
    this.inspeccionService.cancelar(inspeccion.idInspeccion).subscribe({
      next: () => {
        this.notificationService.success('Inspección cancelada correctamente', 'Éxito', 2000);
        this.cargarInspecciones();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Error al cancelar inspección', 'Error', 5000);
        this.cargando = false;
      }
    });
  }

  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getColorEstado(estado: string): string {
    return this.clasesEstado[estado] || 'bg-gray-100 text-gray-800';
  }

  getEstadoLabel(estado: string): string {
    const map: { [key: string]: string } = {
      'PROGRAMADA': 'Programada',
      'EN_CURSO': 'En curso',
      'INICIADA': 'Iniciada',
      'EN_PROCESO': 'En Proceso',
      'FINALIZADA': 'Finalizada',
      'CANCELADA': 'Cancelada'
    };
    return map[estado] || estado;
  }

  get totalInspecciones(): number {
    return this.bloques.reduce((sum, b) => sum + (b.count || 0), 0);
  }
  get programadas(): number {
    return this.bloques.reduce((sum, b) =>
      sum + b.inspecciones.filter(i => i.estado === 'PROGRAMADA').length, 0);
  }
  get iniciadas(): number {
    return this.bloques.reduce((sum, b) =>
      sum + b.inspecciones.filter(i => i.estado === 'EN_CURSO' || i.estado === 'INICIADA' || i.estado === 'EN_PROCESO').length, 0);
  }
  get finalizadas(): number {
    return this.bloques.reduce((sum, b) =>
      sum + b.inspecciones.filter(i => i.estado === 'FINALIZADA').length, 0);
  }
  get canceladas(): number {
    return this.bloques.reduce((sum, b) =>
      sum + b.inspecciones.filter(i => i.estado === 'CANCELADA').length, 0);
  }
  get realizadas(): number { return this.finalizadas; }

  irACanvas(): void {
    this.router.navigateByUrl('/inspecciones/realizar/0');
  }

  verFichaInspeccion(inspeccion: InspeccionResponse): void {
    this.verInstanciasDeInspeccion(inspeccion);
  }

  editarFormato(inspeccion: InspeccionResponse): void {
    this.router.navigate(['/inspecciones', 'campos', inspeccion.idInspeccion]);
  }

  aplicarFiltroRuc(): void {
    this.currentPage = 0;
  }

  limpiarFiltros(): void {
    this.filtroEmpresa = '';
    this.filtroEstado = '';
    this.filtroFecha = '';
    this.filtroRuc = '';
    this.currentPage = 0;
  }

  currentPage = 0;
  pageSize = 5;
  get page(): number { return this.currentPage; }
  get totalPages(): number { return Math.ceil(this.bloquesFiltrados.length / this.pageSize); }
  get totalElements(): number { return this.bloquesFiltrados.length; }

  cambiarPagina(page: number): void {
    this.currentPage = page;
  }

  get bloquesPaginados(): BloqueInspeccionDTO[] {
    const start = this.currentPage * this.pageSize;
    return this.bloquesFiltrados.slice(start, start + this.pageSize);
  }

  getBadgeClassInstancia(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'APROBADO': return 'success';
      case 'EN_REVISION': return 'warning';
      case 'OBSERVADO': return 'warning';
      case 'PENDIENTE': return 'info';
      case 'CERRADO': return 'secondary';
      default: return 'secondary';
    }
  }

  agregarVehiculosDesdeVer(): void {
    const inspeccion = this.inspeccionSeleccionadaParaVer;
    this.cerrarModalVerInstancias();
    if (inspeccion) {
      this.agregarVehiculosAInspeccion(inspeccion);
    }
  }
}
