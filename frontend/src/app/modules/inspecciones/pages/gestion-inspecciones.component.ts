import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InspeccionService, InspeccionResponse, BloqueInspeccionDTO } from '../../inspecciones/services/inspeccion.service';
import { EmpresaService, EmpresaResponse } from '../../empresas/services/empresa.service';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { ModalProgramarInspeccionComponent } from '../components/modal-programar-inspeccion.component';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-gestion-inspecciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalProgramarInspeccionComponent],
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
    private notificationService: NotificationService
  ) {}

  // 🎯 ESTADOS
  bloques: BloqueInspeccionDTO[] = [];
  empresas: EmpresaResponse[] = [];
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

   // 🎯 FILTROS
   filtroEmpresa = '';
   filtroEstado = '';
   filtroFecha = '';
   filtroRuc = '';

   // 🎯 MODAL CREACIÓN/AGREGAR
   mostrandoModalCreacion = false;
   inspeccionParaEditarId?: number;

  // 🎯 ESTADOS DISPONIBLES
  estadosInspeccion = [
    { value: 'todos', label: 'Todos' },
    { value: 'PROGRAMADA', label: 'Programada' },
    { value: 'INICIADA', label: 'Iniciada' },
    { value: 'EN_PROCESO', label: 'En Proceso' },
    { value: 'FINALIZADA', label: 'Finalizada' },
    { value: 'CANCELADA', label: 'Cancelada' }
  ];

  // 🎯 CLASES CSS POR ESTADO
  clasesEstado: { [key: string]: string } = {
    'PROGRAMADA': 'bg-blue-100 text-blue-800 border-blue-200',
    'INICIADA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'EN_PROCESO': 'bg-orange-100 text-orange-800 border-orange-200',
    'FINALIZADA': 'bg-green-100 text-green-800 border-green-200',
    'CANCELADA': 'bg-red-100 text-red-800 border-red-200'
  };

  ngOnInit(): void {
    this.cargarInspecciones();
    this.cargarEmpresas();
  }

  // 🎯 CARGAR DATOS POR BLOQUES
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

  // 🎯 MODAL
  abrirModalCreacion(): void {
    this.inspeccionParaEditarId = undefined;
    this.mostrandoModalCreacion = true;
  }

  editarInspeccion(inspeccion: InspeccionResponse): void {
    this.inspeccionParaEditarId = inspeccion.idInspeccion;
    this.mostrandoModalCreacion = true;
  }

  cerrarModalCreacion(): void {
    this.mostrandoModalCreacion = false;
    this.inspeccionParaEditarId = undefined;
  }

  onInspeccionGuardada(): void {
    this.cargarInspecciones();
    this.cerrarModalCreacion();
  }

  // 🎯 BÚSQUEDA Y FILTROS (a nivel de bloque)
  get bloquesFiltrados(): BloqueInspeccionDTO[] {
    return this.bloques.filter((bloque) => {
      // Filtrar por empresa (verificar si alguna inspección del bloque coincide)
      const coincideEmpresa = !this.filtroEmpresa ||
        bloque.inspecciones.some(i =>
          i.empresaNombre?.toLowerCase().includes(this.filtroEmpresa.toLowerCase())
        );

      // Filtrar por estado (verificar si alguna inspección del bloque coincide)
      const coincideEstado = !this.filtroEstado || this.filtroEstado === 'todos' ||
        bloque.inspecciones.some(i => i.estado === this.filtroEstado);

      // Filtrar por RUC
      const coincideRuc = !this.filtroRuc ||
        bloque.inspecciones.some(i =>
          i.empresaNombre?.toLowerCase().includes(this.filtroRuc.toLowerCase())
        );

      return coincideEmpresa && coincideEstado && coincideRuc;
    });
  }

   // 🎯 ACCIONES SOBRE BLOQUES
   iniciarBloque(bloque: BloqueInspeccionDTO): void {
     if (!confirm(`¿Está seguro de iniciar todas las inspecciones del bloque ${bloque.empresaNombre} (Trámite: ${bloque.idTramite})?`)) {
       return;
     }
     this.cargando = true;
     // Obtener fecha y lugar de la primera inspección del bloque
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
     // Obtener fecha y lugar de la primera inspección del bloque
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

   // 🆕 Ver instancias del trámite (mantenida por compatibilidad)
   verInstancias(bloque: BloqueInspeccionDTO): void {
     // Navegar a la vista de detalle del trámite o abrir modal
     this.router.navigate(['/tramites/detalle', bloque.idTramite]);
   }

   // 🆕 Agregar instancias al bloque (mantenida por compatibilidad)
   agregarInstancias(bloque: BloqueInspeccionDTO): void {
     // Navegar a modal de agregar instancias al trámite/inspección
     // Por ahora, solo mostramos mensaje
     this.notificationService.info('Función en desarrollo', 'Info', 2000);
   }

   // 🆕 Ver instancias de una inspección específica
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

  // 🎯 ACCIONES SOBRE INSPECCIONES INDIVIDUALES (dentro de bloque)
  verFicha(inspeccion: InspeccionResponse): void {
    this.router.navigate(['/inspecciones', 'realizar', inspeccion.idInspeccion]);
  }

  iniciarInspeccion(inspeccion: InspeccionResponse): void {
    if (inspeccion.estado !== 'PROGRAMADA') {
      this.notificationService.warning('La inspección ya fue iniciada o finalizada', 'Acción no permitida', 3000);
      return;
    }
    this.cargando = true;
    this.inspeccionService.cambiarEstado(inspeccion.idInspeccion, 'INICIADA').subscribe({
      next: () => {
        this.notificationService.success('Inspección iniciada', 'Éxito', 2000);
        this.cargarInspecciones();
        this.router.navigate(['/inspecciones', 'realizar', inspeccion.idInspeccion]);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Error al iniciar inspección', 'Error', 5000);
        this.cargando = false;
      }
    });
  }

  terminarInspeccion(inspeccion: InspeccionResponse): void {
    if (!confirm(`¿Está seguro de terminar la inspección ${inspeccion.codigo}?`)) return;
    this.cargando = true;
    this.inspeccionService.cambiarEstado(inspeccion.idInspeccion, 'FINALIZADA').subscribe({
      next: () => {
        this.notificationService.success('Inspección finalizada exitosamente', 'Éxito', 3000);
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
        this.notificationService.success('Inspección cancelada correctamente', 'Éxito', 3000);
        this.cargarInspecciones();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Error al cancelar inspección', 'Error', 5000);
        this.cargando = false;
      }
    });
  }

  // 🎯 UTILIDADES
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
      'INICIADA': 'Iniciada',
      'EN_PROCESO': 'En Proceso',
      'FINALIZADA': 'Finalizada',
      'CANCELADA': 'Cancelada'
    };
    return map[estado] || estado;
  }

  // Estadísticas globales
  get totalInspecciones(): number {
    return this.bloques.reduce((sum, b) => sum + (b.count || 0), 0);
  }
  get programadas(): number {
    return this.bloques.reduce((sum, b) =>
      sum + b.inspecciones.filter(i => i.estado === 'PROGRAMADA').length, 0);
  }
  get iniciadas(): number {
    return this.bloques.reduce((sum, b) =>
      sum + b.inspecciones.filter(i => i.estado === 'INICIADA' || i.estado === 'EN_PROCESO').length, 0);
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

  // Paginación a nivel de bloques
  currentPage = 0;
  pageSize = 5; // Mostrar 5 bloques por página
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
       this.editarInspeccion(inspeccion);
     }
   }
 }