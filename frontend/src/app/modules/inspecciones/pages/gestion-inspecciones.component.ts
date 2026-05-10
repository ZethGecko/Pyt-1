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
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

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

   // 🎯 ESTADOS
   bloques: BloqueInspeccionDTO[] = [];
   empresas: EmpresaResponse[] = [];
   cargando = false;
   error: string | null = null;
   exito: string | null = null;

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

   // 🎯 FILTROS
   filtroEmpresa = '';
   filtroEstado = '';
   filtroFecha = '';
   filtroRuc = '';

   // 🎯 MODAL CREACIÓN/AGREGAR
   mostrandoModalCreacion = false;
   inspeccionParaEditarId?: number;
   modoModal: 'crear' | 'agregar' | 'editar-datos' = 'crear';

   // 🎯 MODAL AGREGAR INSTANCIAS INDIVIDUALES
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
          this.onInspeccionGuardada(); // refresca tabla
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

    // Obtiene el idTramite buscando en los bloques la inspección dada
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

   verFichaVehiculo(instancia: any): void {
     if (!instancia.fichaId) {
       // Si no tiene ficha, preguntar si crear una (debería haber sido creada al iniciar)
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

     // Iniciar la inspección (cambia estado a INICIADA)
     this.inspeccionService.cambiarEstado(inspeccion.idInspeccion, 'INICIADA').subscribe({
       next: () => {
         this.notificationService.success('Inspección iniciada', 'Éxito', 2000);
         this.cargarInspecciones();

         // Para cada vehículo (instancia) asignado a esta inspección, crear su ficha de inspección individual
         this.crearFichasParaVehiculos(inspeccion);
       },
       error: (err) => {
         this.notificationService.error(err.error?.message || 'Error al iniciar inspección', 'Error', 5000);
         this.cargando = false;
       }
     });
   }

    private crearFichasParaVehiculos(inspeccion: InspeccionResponse): void {
      // Obtener las instancias (vehículos) asignados a esta inspección
      this.inspeccionService.obtenerConInstancias(inspeccion.idInspeccion).subscribe({
        next: (data: InspeccionResponse) => {
          const instancias = data.instancias || [];
          if (instancias.length === 0) {
            this.notificationService.warning('No hay vehículos asignados a esta inspección', 'Advertencia', 3000);
            this.cargando = false;
            return;
          }

          let contador = 0;
          let primeraFichaId: number | null = null;

           instancias.forEach((instancia) => {
             // Crear una ficha de inspección para cada vehículo
             this.crearFichaPorVehiculo(inspeccion.idInspeccion, instancia.idInstancia!).subscribe({
              next: (fichaCreada: FichaInspeccion) => {
                contador++;
                // Guardar el ID de la primera ficha para navegar
                if (contador === 1) {
                  primeraFichaId = fichaCreada.id!;
                }
                // cuando se creen todas, navegar a la primera ficha
                if (contador === instancias.length) {
                  if (primeraFichaId) {
                    this.router.navigate(['/inspecciones', 'ficha', primeraFichaId]);
                  } else {
                    // Fallback: ir a la inspección general
                    this.router.navigate(['/inspecciones', 'realizar', data.idInspeccion]);
                  }
                  this.cargando = false;
                }
              },
              error: (err: any) => {
                console.error('Error creando ficha para vehículo', instancia.identificador, err);
                contador++;
                if (contador === instancias.length) {
                  this.cargando = false;
                }
              }
            });
          });
        },
        error: (err: any) => {
          this.notificationService.error('Error al cargar vehículos de la inspección', 'Error', 3000);
          this.cargando = false;
        }
      });
    }

   private crearFichaPorVehiculo(inspeccionId: number, instanciaId: number, vehiculoId?: number): Observable<FichaInspeccion> {
      if (!inspeccionId || inspeccionId <= 0) {
        return throwError(() => new Error('ID de inspección no válido'));
      }
      const currentUserId = this.authState.currentUser()?.id;
      const datosFicha: any = {
        inspeccionId,
        estado: true
      };
      if (vehiculoId !== undefined) {
        datosFicha.vehiculoId = vehiculoId;
      }
      if (currentUserId !== undefined) {
        datosFicha.usuarioInspector = currentUserId;
      }
      return this.fichaInspeccionService.create(datosFicha).pipe(
       switchMap((nuevaFicha: FichaInspeccion) => {
         // Obtener la ficha de formato (la primera ficha de la inspección) para copiar sus parámetros
         return this.fichaInspeccionService.getByInspeccion(inspeccionId).pipe(
           switchMap((fichas: FichaInspeccion[]) => {
             if (fichas && fichas.length > 0) {
               const plantilla = fichas[0];
               if (plantilla.parametros && plantilla.parametros.length > 0) {
                  // Crear parámetros copiados a la nueva ficha (sin idParametros)
                  const ops = plantilla.parametros.map(p =>
                    this.inspeccionService.crearParametro(nuevaFicha.id!, {
                      parametro: p.parametro,
                      observacion: p.observacion || '',
                      tipoEvaluacion: p.tipoEvaluacion || 'TEXTO',
                      seccion: p.seccion
                    })
                  );
                 return forkJoin(ops).pipe(
                   map(() => nuevaFicha)
                 );
               }
             }
             return of(nuevaFicha);
           })
         );
       })
     );
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

    // Navegar a la ficha de inspección (primera ficha encontrada)
    verFichaInspeccion(inspeccion: InspeccionResponse): void {
     this.fichaInspeccionService.getByInspeccion(inspeccion.idInspeccion).subscribe({
       next: (fichas) => {
         if (fichas && fichas.length > 0) {
           this.router.navigate(['/inspecciones', 'ficha', fichas[0].id]);
         } else {
           this.notificationService.warning('No hay fichas creadas para esta inspección. Inicie la inspección primero.', 'Sin fichas', 3000);
         }
       },
       error: () => {
         this.notificationService.error('Error al cargar fichas', 'Error');
       }
     });
   }

   // Navegar al editor de formato (Canvas en modo diseño)
   editarFormato(inspeccion: InspeccionResponse): void {
     // Navegar a la ruta de formato con el ID de la inspección para cargar su formato existente
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
        this.agregarVehiculosAInspeccion(inspeccion);
      }
    }
 }