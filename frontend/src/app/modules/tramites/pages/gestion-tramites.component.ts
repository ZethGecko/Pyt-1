import { TramiteService } from '../services/tramite.service';
import { RequisitoTramiteRevisionService } from '../services/requisito-tramite-revision.service';
import { RevisionRequisitosComponent } from '../components/revision-requisitos/revision-requisitos.component';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TramiteFormModalComponent } from '../components/tramite-form-modal/tramite-form-modal.component';
import { SeleccionarDepartamentoModalComponent } from '../components/seleccionar-departamento-modal/seleccionar-departamento-modal.component';
import { forkJoin, Subject, of, combineLatest } from 'rxjs';
import { takeUntil, catchError, switchMap } from 'rxjs/operators';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { Tramite, TramiteEnriquecido, TramiteCreateRequest } from '../models/tramite.model';
import { SolicitanteService } from '../../solicitantes/services/solicitante.service';
import { TipoTramiteService } from '../../configuracion/services/tipo-tramite.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { PersonaNaturalService } from '../../personas-naturales/services/persona-natural.service';
import { PersonaNaturalCreateRequest } from '../../personas-naturales/models/persona-natural.model';
import { EmpresaService } from '../../empresas/services/empresa.service';
import { GerenteService } from '../../empresas/services/gerente.service';
import { EmpresaResponse } from '../../empresas/services/empresa.service';
import { GerenteResponse } from '../../empresas/services/gerente.service';
import { DepartamentoService } from '../../configuracion/services/departamento.service';

  @Component({
    selector: 'app-gestion-tramites',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, TramiteFormModalComponent, SeleccionarDepartamentoModalComponent, RevisionRequisitosComponent],
    templateUrl: './gestion-tramites.component.html',
    styleUrls: ['./gestion-tramites.component.scss']
  })
export class GestionTramitesComponent implements OnInit, OnDestroy {
  // 🎯 ESTADOS
  tramites: TramiteEnriquecido[] = [];
  tramitesFiltrados: TramiteEnriquecido[] = [];
  tramitesPaginados: TramiteEnriquecido[] = []; // Página actual
  columnas: any[] = [];

  // 🎯 ESTADÍSTICAS
  estadisticas: any = {};
  cargandoEstadisticas = false;

  // 🎯 FILTROS AVANZADOS
  filtros = {
    estado: '',
    prioridad: '',
    search: '',
    tipoSolicitante: '',
    desde: '',
    hasta: ''
  };

  // 🎯 PAGINACIÓN
  paginaActual = 1;
  itemsPorPagina = 20;
  totalItems = 0;

  // 🎯 UI
  mostrarDetalle = false;
  tramiteSeleccionado: TramiteEnriquecido | null = null;
  mostrarFiltrosAvanzados = false;
  cargandoInicial = false;

  // Modal de revisión de requisitos
  mostrarModalRequisitos = false;
  tramiteParaRevisar: TramiteEnriquecido | null = null;

  // Modales adicionales
  mostrarModalCrear = false;
  mostrarModalPersonaNatural = false;
  mostrarModalFormulario = false;
  tramiteParaEditar: TramiteEnriquecido | null = null;
  mostrandoModalDerivacion = false;
  tramiteParaDerivar: TramiteEnriquecido | null = null;

   // Formulario de creación
   formCrear: {
     tipoTramiteId: number | null;
     solicitante: any;
     prioridad: string;
     observaciones: string;
     codigoRUT: string;
   } = {
     tipoTramiteId: null,
     solicitante: null,
     prioridad: '',
     observaciones: '',
     codigoRUT: ''
   };
  filtroTipoSolicitante = 'todos';
  textoBusquedaSolicitante = '';
  mostrarDropdown = false;

  // Formulario persona natural
  personaNaturalForm = {
    nombres: '',
    apellidos: '',
    dni: 0,
    genero: '',
    telefono: '',
    email: ''
  };
  cargandoPersonaNatural = false;

    // Datos auxiliares
    tiposTramite: any[] = [];
    solicitantes: any[] = [];
    solicitantesCompletos: any[] = []; // Lista completa original

   private destroy$ = new Subject<void>();

   constructor(
    private tramiteService: TramiteService,
    private cdr: ChangeDetectorRef,
    private authState: AuthStateService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private solicitanteService: SolicitanteService,
    private tipoTramiteService: TipoTramiteService,
    private personaNaturalService: PersonaNaturalService,
    private empresaService: EmpresaService,
    private gerenteService: GerenteService,
    private departamentoService: DepartamentoService,
    private revisionService: RequisitoTramiteRevisionService
  ) {}

  ngOnInit(): void {
    this.cargarTramites();
    this.cargarCatalogos();
    this.escucharParametrosRuta();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🎯 CARGA DE TRÁMITES - LISTAR TODOS (sin filtros de departamento)
   cargarTramites(): void {
     this.cargandoInicial = true;

     this.tramiteService.listarTodos().pipe(
       takeUntil(this.destroy$),
       catchError(err => {
         this.cargandoInicial = false;
         this.cdr.detectChanges();
         this.notificationService.showError('Error al cargar trámites');
         console.error('Error en cargarTramites:', err);
         return of([]);
       })
     ).subscribe({
       next: (tramites: TramiteEnriquecido[]) => {
         console.log('✅ Trámites recibidos en frontend:', tramites.length, tramites);
         this.tramites = tramites;
         this.tramitesFiltrados = [...this.tramites];
         this.totalItems = this.tramites.length;
         this.cargarEstadisticas();

         // Configurar columnas para gestión completa
         this.columnas = [
           { key: 'codigoRUT', label: 'Código RUT' },
           { key: 'tipoTramiteDescripcion', label: 'Tipo Trámite' },
           { key: 'solicitanteNombre', label: 'Solicitante' },
           { key: 'estado', label: 'Estado' },
           { key: 'prioridad', label: 'Prioridad' },
           { key: 'departamentoActualNombre', label: 'Departamento Actual' },
           { key: 'usuarioResponsableNombre', label: 'Responsable' },
           { key: 'fechaRegistro', label: 'Fecha Registro' },
           { key: 'acciones', label: 'Acciones' }
         ];

         this.actualizarPaginacion();
         this.cargandoInicial = false;
         this.cdr.detectChanges();
       },
       error: (err) => {
         console.error('❌ Error en cargarTramites:', err);
         this.cargandoInicial = false;
         this.cdr.detectChanges();
         this.notificationService.showError('Error al cargar trámites');
       }
     });
   }

  cargarCatalogos(): void {
    console.log('[Frontend] Iniciando carga de catálogos');
    this.tipoTramiteService.listarTodos().subscribe({
      next: (tipos) => {
        this.tiposTramite = tipos;
      },
      error: (err) => {
        console.error('Error cargando tipos de trámite:', err);
        this.tiposTramite = [];
      }
    });

    // Cargar solicitantes combinados (Empresas, Personas Naturales, Gerentes)
    this.cargarSolicitantesCombinados();
  }

  cargarSolicitantesCombinados(): void {
    console.log('[Frontend] Iniciando carga de solicitantes combinados');
    forkJoin({
      empresas: this.empresaService.listarActivas().pipe(
        catchError(err => {
          console.error('Error cargando empresas:', err);
          return of([]);
        })
      ),
      personas: this.personaNaturalService.listarTodos().pipe(
        catchError(err => {
          console.error('Error cargando personas naturales:', err);
          return of([]);
        })
      ),
      gerentes: this.gerenteService.listarActivos().pipe(
        catchError(err => {
          console.error('Error cargando gerentes:', err);
          return of([]);
        })
      )
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (resultado) => {
        console.log('[Backend] Resultado de servicios:', resultado);
        console.log('[Backend] Empresas:', resultado.empresas?.length || 0, resultado.empresas);
        console.log('[Backend] Personas:', resultado.personas?.length || 0, resultado.personas);
        console.log('[Backend] Gerentes:', resultado.gerentes?.length || 0, resultado.gerentes);

        // Transformar empresas - usar razonSocial y ruc como identificacion
        const empresasTransformadas = (resultado.empresas || [])
          .filter(emp => emp.id != null)
          .map((emp: EmpresaResponse) => {
            console.log('[Backend] Empresa transformada:', emp.id, emp.nombre);
            return {
              id: emp.id,
              razonSocial: emp.nombre,
              nombre: '',
              apellido: '',
              identificacion: emp.ruc,
              tipoSolicitante: 'Empresa',
              activo: emp.activo
            };
          });

        // Transformar personas naturales - separar nombres y apellidos
        const personasTransformadas = (resultado.personas || [])
          .filter(persona => persona.id != null)
          .map((persona: any) => {
            console.log('[Backend] Persona transformada:', persona.id, persona.nombres, persona.apellidos);
            return {
              id: persona.id,
              razonSocial: '',
              nombre: persona.nombres,
              apellido: persona.apellidos,
              identificacion: persona.dni?.toString(),
              tipoSolicitante: 'PersonaNatural',
              activo: persona.activo
            };
          });

        // Transformar gerentes - solo nombre, sin apellido
        const gerentesTransformados = (resultado.gerentes || [])
          .filter(ger => ger.id != null)
          .map((ger: GerenteResponse) => {
            console.log('[Backend] Gerente transformado:', ger.id, ger.nombre);
            return {
              id: ger.id,
              razonSocial: '',
              nombre: ger.nombre,
              apellido: '',
              identificacion: ger.dni?.toString(),
              tipoSolicitante: 'Gerente',
              activo: ger.activo
            };
          });

        // Combinar todos en un solo array
        this.solicitantesCompletos = [
          ...empresasTransformadas,
          ...personasTransformadas,
          ...gerentesTransformados
        ];
        this.solicitantes = [...this.solicitantesCompletos]; // Copia para trabajar

        console.log('[Backend] Solicitantes finales:', this.solicitantes.length);
        console.log('[Backend] Solicitantes con IDs válidos:', this.solicitantes.filter(s => s.id != null).length);
        console.log('[Backend] Solicitantes sin ID:', this.solicitantes.filter(s => s.id == null).length);
      },
      error: (err) => {
        console.error('Error en cargarSolicitantesCombinados:', err);
        this.solicitantes = [];
      }
    });
  }

  // 🎯 ESTADÍSTICAS (calculadas localmente)
  cargarEstadisticas(): void {
    this.estadisticas = {
      total: this.tramites.length,
      registrados: this.tramites.filter(t => t.estado === 'registrado').length,
      enRevision: this.tramites.filter(t => t.estado === 'en_revision').length,
      aprobados: this.tramites.filter(t => t.estado === 'aprobado').length,
      observados: this.tramites.filter(t => t.estado === 'observado').length,
      derivados: this.tramites.filter(t => t.estado === 'derivado').length,
      rechazados: this.tramites.filter(t => t.estado === 'rechazado').length,
      finalizados: this.tramites.filter(t => t.estado === 'finalizado').length,
      cancelados: this.tramites.filter(t => t.estado === 'cancelado').length
    };
  }

  get totalTramites(): number { return this.estadisticas?.total || 0; }
  get enRevision(): number { return this.estadisticas?.enRevision || 0; }
  get aprobados(): number { return this.estadisticas?.aprobados || 0; }
  get observados(): number { return this.estadisticas?.observados || 0; }
  get registrados(): number { return this.estadisticas?.registrados || 0; }
  get derivados(): number { return this.estadisticas?.derivados || 0; }
  get rechazados(): number { return this.estadisticas?.rechazados || 0; }
  get finalizados(): number { return this.estadisticas?.finalizados || 0; }
  get cancelados(): number { return this.estadisticas?.cancelados || 0; }

  // 🎯 FILTRADO AVANZADO
   aplicarFiltros(): void {
     this.tramitesFiltrados = this.tramites.filter(tramite => {
       // Filtro por estado
       if (this.filtros.estado && tramite.estado !== this.filtros.estado) {
         return false;
       }

       // Filtro por prioridad
       if (this.filtros.prioridad && tramite.prioridad !== this.filtros.prioridad) {
         return false;
       }

       // Filtro por tipo de solicitante
       if (this.filtros.tipoSolicitante && this.filtros.tipoSolicitante !== 'todos') {
         const tipoSolicitante = tramite.solicitanteTipo;
         const tipoFiltro = this.filtros.tipoSolicitante === 'Vehiculo' ? 'GERENTE' : this.filtros.tipoSolicitante;

         // Mapear tipos del backend a frontend
         const tipoBackend = tipoSolicitante === 'GERENTE' ? 'Vehiculo' : tipoSolicitante;

         if (tipoBackend !== this.filtros.tipoSolicitante) {
           return false;
         }
       }

       // Filtro por búsqueda general (código, solicitante, tipo)
       if (this.filtros.search) {
         const searchLower = this.filtros.search.toLowerCase();
         const coincideCodigo = tramite.codigoRUT?.toLowerCase().includes(searchLower) || false;
         const coincideSolicitante = tramite.solicitanteNombre?.toLowerCase().includes(searchLower) || false;
         const coincideTipo = tramite.tipoTramiteDescripcion?.toLowerCase().includes(searchLower) || false;

         if (!(coincideCodigo || coincideSolicitante || coincideTipo)) {
           return false;
         }
       }

       // Filtro por fechas
       if (this.filtros.desde) {
         const fechaDesde = new Date(this.filtros.desde);
         const fechaRegistro = new Date(tramite.fechaRegistro);
         if (fechaRegistro < fechaDesde) {
           return false;
         }
       }

       if (this.filtros.hasta) {
         const fechaHasta = new Date(this.filtros.hasta);
         const fechaRegistro = new Date(tramite.fechaRegistro);
         if (fechaRegistro > fechaHasta) {
           return false;
         }
       }

       return true;
     });

     this.paginaActual = 1;
     this.totalItems = this.tramitesFiltrados.length;
     this.actualizarPaginacion();
   }

   limpiarFiltros(): void {
     this.filtros.estado = '';
     this.filtros.prioridad = '';
     this.filtros.search = '';
     this.filtros.tipoSolicitante = '';
     this.filtros.desde = '';
     this.filtros.hasta = '';
     this.tramitesFiltrados = [...this.tramites];
     this.totalItems = this.tramitesFiltrados.length;
     this.actualizarPaginacion();
   }

   // Paginación
   actualizarPaginacion(): void {
     const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
     const fin = inicio + this.itemsPorPagina;
     this.tramitesPaginados = this.tramitesFiltrados.slice(inicio, fin);
   }

  // 🎯 ACCIONES DE TRÁMITE

  puedeDerivar(tramite: TramiteEnriquecido): boolean {
    const estadosPermitidos = ['registrado', 'en_revision', 'revisado'];
    return estadosPermitidos.includes(tramite.estado);
  }

  puedeEditar(tramite: TramiteEnriquecido): boolean {
    const estadosNoEditables = ['finalizado', 'cancelado', 'rechazado'];
    return !estadosNoEditables.includes(tramite.estado);
  }

  abrirModalDerivar(tramite: TramiteEnriquecido): void {
    if (!this.puedeDerivar(tramite)) {
      this.notificationService.showWarning('Este trámite no puede ser derivado en su estado actual');
      return;
    }
    this.tramiteParaDerivar = tramite;
    this.mostrandoModalDerivacion = true;
  }

  derivarTramite(departamentoId: number, observaciones?: string): void {
    if (!this.tramiteParaDerivar) return;

    this.tramiteService.derivar(
      this.tramiteParaDerivar.id,
      departamentoId,
      observaciones || ''
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('Trámite derivado exitosamente');
        this.mostrandoModalDerivacion = false;
        this.tramiteParaDerivar = null;
        this.cargarTramites();
      },
      error: (err) => {
        this.notificationService.showError('Error al derivar trámite: ' + (err.message || 'Error desconocido'));
        console.error('Error derivando trámite:', err);
      }
    });
  }

  abrirModalEditar(tramite: TramiteEnriquecido): void {
    if (!this.puedeEditar(tramite)) {
      this.notificationService.showWarning('Este trámite no puede ser editado en su estado actual');
      return;
    }
    this.tramiteParaEditar = tramite;
    this.mostrarModalFormulario = true;
  }

  abrirModalCrear(): void {
    this.mostrarModalCrear = true;
  }

  crearTramite(): void {
    console.log('[Frontend] formCrear:', this.formCrear);
    console.log('[Frontend] solicitante:', this.formCrear.solicitante);

    if (!this.formCrear.tipoTramiteId || !this.formCrear.solicitante) {
      console.error('[Frontend] ERROR: Falta tipoTramiteId o solicitante');
      this.notificationService.showWarning('Debe seleccionar tipo de trámite y solicitante');
      return;
    }

    if (!this.formCrear.solicitante.id) {
      console.error('[Frontend] ERROR: Solicitante sin ID válido', this.formCrear.solicitante);
      this.notificationService.showWarning('El solicitante seleccionado no tiene un ID válido');
      return;
    }

    console.log('[Frontend] solicitante.id:', this.formCrear.solicitante.id);
    console.log('[Frontend] solicitante.tipoSolicitante:', this.formCrear.solicitante.tipoSolicitante);

    const tramiteData: TramiteCreateRequest = {
      tipoTramiteId: this.formCrear.tipoTramiteId,
      solicitanteId: this.formCrear.solicitante.id,
      tipoSolicitante: this.formCrear.solicitante.tipoSolicitante,
      prioridad: this.formCrear.prioridad || 'normal',
      observaciones: this.formCrear.observaciones || '',
      codigoRUT: this.formCrear.codigoRUT || ''
    };

    console.log('[Frontend] tramiteData a enviar:', tramiteData);

    this.tramiteService.crear(tramiteData).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Trámite creado exitosamente');
        this.mostrarModalCrear = false;
        this.resetFormCrear();
        this.cargarTramites();
      },
      error: (err) => {
        this.notificationService.showError('Error al crear trámite: ' + (err.message || 'Error desconocido'));
        console.error('Error creando trámite:', err);
      }
    });
  }

  resetFormCrear(): void {
    this.formCrear = {
      tipoTramiteId: null,
      solicitante: null,
      prioridad: '',
      observaciones: '',
      codigoRUT: ''
    };
    this.filtroTipoSolicitante = 'todos';
    this.textoBusquedaSolicitante = '';
    this.mostrarDropdown = false;
    // Restaurar lista completa de solicitantes
    this.solicitantes = [...this.solicitantesCompletos];
  }

  // 🎯 FILTRO DE SOLICITANTES
  filtrarSolicitantes(): void {
    if (!this.textoBusquedaSolicitante) {
      this.solicitantes = [...this.solicitantesCompletos]; // Restaurar lista completa
      this.mostrarDropdown = false;
      return;
    }

    const searchLower = this.textoBusquedaSolicitante.toLowerCase();
    this.solicitantes = this.solicitantesCompletos.filter(s => {
      const coincideNombre = s.nombre?.toLowerCase().includes(searchLower) || false;
      const coincideApellido = s.apellido?.toLowerCase().includes(searchLower) || false;
      const coincideRazon = s.razonSocial?.toLowerCase().includes(searchLower) || false;
      const coincideIdentificacion = s.identificacion?.toLowerCase().includes(searchLower) || false;
      const coincideTipo = s.tipoSolicitante?.toLowerCase().includes(searchLower) || false;
      return coincideNombre || coincideApellido || coincideRazon || coincideIdentificacion || coincideTipo;
    });
    this.mostrarDropdown = true;
  }

  seleccionarSolicitante(solicitante: any): void {
    console.log('[Frontend] Solicitante seleccionado:', solicitante);
    console.log('[Frontend] ID del solicitante:', solicitante?.id);
    console.log('[Frontend] Tipo del solicitante:', solicitante?.tipoSolicitante);

    if (!solicitante || !solicitante.id) {
      console.error('[Frontend] ERROR: Solicitante sin ID válido', solicitante);
      return;
    }

    this.formCrear.solicitante = solicitante;
    console.log('[Frontend] formCrear.solicitante asignado:', this.formCrear.solicitante);
    console.log('[Frontend] formCrear.solicitante.id:', this.formCrear.solicitante.id);

    // Mostrar el nombre completo del solicitante en el campo de búsqueda
    const nombreCompleto = [
      solicitante.nombre,
      solicitante.apellido,
      solicitante.razonSocial
    ].filter(Boolean).join(' ');

    this.textoBusquedaSolicitante = `${nombreCompleto} ${solicitante.identificacion || ''}`.trim();
    this.mostrarDropdown = false;
  }
  
  // 🎯 AUTOCOMPLETADO DE TIPO TRÁMITE POR CÓDIGO RUT
  /**
   * Busca el tipo de trámite asociado a un código RUT y autocompleta el select
   */
  buscarTipoTramitePorCodigoRUT(): void {
    const codigoRUT = this.formCrear.codigoRUT?.trim();
    
    if (!codigoRUT || codigoRUT.length < 2) {
      return; // No buscar si el código es muy corto
    }
    
    this.tramiteService.obtenerTipoTramitePorCodigoRUT(codigoRUT).subscribe({
      next: (data) => {
        if (data.tipoTramiteId) {
          // Autocompletar el tipo de trámite
          this.formCrear.tipoTramiteId = data.tipoTramiteId;
          
          // Mostrar notificación informativa
          this.notificationService.showInfo(
            `Tipo de trámite autocompletado: ${data.tipoTramiteDescripcion || data.tipoTramiteCodigo}`
          );
          
          console.log('✅ Tipo de trámite autocompletado:', data);
        } else {
          console.log('⚠️ No se encontró tipo de trámite para el código RUT:', codigoRUT);
        }
      },
      error: (err) => {
        // Si el trámite no existe o no tiene tipo asignado, no mostrar error
        if (err.status !== 404) {
          console.warn('No se pudo obtener tipo de trámite para código RUT:', codigoRUT, err);
        }
      }
    });
  }
  
  // 🎯 PERSONA NATURAL
  abrirModalPersonaNatural(): void {
    this.mostrarModalPersonaNatural = true;
  }

  /** Abrir modal de revisión de requisitos para un trámite */
  abrirModalRevisar(tramite: TramiteEnriquecido): void {
    // Solo se pueden revisar trámites en estado "registrado" o "en_revision"
    if (tramite.estado !== 'registrado' && tramite.estado !== 'en_revision') {
      this.notificationService.showWarning('Solo se pueden revisar trámites en estado "Registrado" o "En Revisión"');
      return;
    }

    if (tramite.estado === 'registrado') {
      // Cambiar estado a 'en_revision' sin motivo
      this.tramiteService.cambiarEstado(tramite.id, 'en_revision').subscribe({
        next: () => {
          this.notificationService.showSuccess('Trámite en revisión');
          // Actualizar el tramite localmente
          const tramiteActualizado = { ...tramite, estado: 'en_revision' as const };
          this.tramiteParaRevisar = tramiteActualizado;
          this.mostrarModalRequisitos = true;
          // Actualizar también en la lista
          const index = this.tramites.findIndex(t => t.id === tramite.id);
          if (index !== -1) {
            this.tramites[index] = tramiteActualizado;
          }
        },
        error: (err) => {
          this.notificationService.showError('Error al iniciar revisión');
        }
      });
    } else {
      // Ya está en revisión, abrir modal directamente
      this.tramiteParaRevisar = tramite;
      this.mostrarModalRequisitos = true;
    }
  }

  /** Cerrar modal de revisión */
  cerrarModalRevisar(): void {
    this.mostrarModalRequisitos = false;
    this.tramiteParaRevisar = null;
    // Recargar lista para reflejar cambios en estado de requisitos
    this.cargarTramites();
  }

  crearPersonaNatural(): void {
    if (!this.personaNaturalForm.nombres || !this.personaNaturalForm.apellidos || !this.personaNaturalForm.dni) {
      this.notificationService.showWarning('Complete todos los campos requeridos de la persona natural');
      return;
    }

    this.personaNaturalService.crear(this.personaNaturalForm).subscribe({
      next: (personaCreada) => {
        this.notificationService.showSuccess('Persona natural creada exitosamente');
        this.mostrarModalPersonaNatural = false;
        this.resetPersonaNaturalForm();
        this.cargarSolicitantesCombinados();
      },
      error: (err) => {
        this.notificationService.showError('Error al crear persona natural: ' + (err.message || 'Error desconocido'));
        console.error('Error creando persona natural:', err);
      }
    });
  }

  resetPersonaNaturalForm(): void {
    this.personaNaturalForm = {
      nombres: '',
      apellidos: '',
      dni: 0,
      genero: '',
      telefono: '',
      email: ''
    };
  }



  // 🎯 UTILIDADES
  getEstadosDisponibles(): string[] {
    return ['registrado', 'en_revision', 'derivado', 'aprobado', 'rechazado', 'observado', 'finalizado', 'cancelado'];
  }

  getPrioridadesDisponibles(): string[] {
    return ['urgente', 'alta', 'normal', 'baja'];
  }

  getColorEstado(estado: string): string {
    const estadoLower = (estado || '').toLowerCase();
    if (['aprobado', 'finalizado'].includes(estadoLower)) return 'success';
    if (['rechazado', 'cancelado'].includes(estadoLower)) return 'danger';
    if (['observado', 'pendiente'].includes(estadoLower)) return 'warning';
    if (['en_revision', 'derivado'].includes(estadoLower)) return 'info';
    if (estadoLower === 'registrado') return 'primary';
    return 'secondary';
  }

  escucharParametrosRuta(): void {
    this.route.queryParams.subscribe(params => {
      if (params['accion'] === 'crear') {
        this.abrirModalCrear();
      }
    });
  }

  exportarCSV(): void {
    const headers = ['Código RUT', 'Tipo Trámite', 'Solicitante', 'Estado', 'Prioridad', 'Departamento Actual', 'Responsable', 'Fecha Registro'];
    const rows = this.tramitesFiltrados.map(t => [
      t.codigoRUT || '',
      t.tipoTramiteDescripcion || '',
      t.solicitanteNombre || '',
      t.estado || '',
      t.prioridad || '',
      t.departamentoActualNombre || '',
      t.usuarioResponsableNombre || t.usuarioRegistraNombre || '',
      t.fechaRegistro || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tramites_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  // ========== MÉTODOS REQUERIDOS POR EL HTML ==========

  // Propiedad para solicitantes filtrados
  get solicitantesFiltrados(): any[] {
    let filtrados = this.solicitantes.filter(s => s.id != null && s.id !== undefined);

    if (this.textoBusquedaSolicitante && this.textoBusquedaSolicitante.trim()) {
      const searchTerm = this.textoBusquedaSolicitante.toLowerCase().trim();
      filtrados = filtrados.filter(s =>
        s.nombre?.toLowerCase().includes(searchTerm) ||
        s.apellido?.toLowerCase().includes(searchTerm) ||
        s.razonSocial?.toLowerCase().includes(searchTerm) ||
        s.identificacion?.toLowerCase().includes(searchTerm) ||
        s.tipoSolicitante?.toLowerCase().includes(searchTerm)
      );
    }

    return filtrados;
  }

  // Color de prioridad
  getColorPrioridad(prioridad: string): string {
    const p = (prioridad || '').toLowerCase();
    if (p === 'urgente') return 'danger';
    if (p === 'alta') return 'warning';
    if (p === 'normal') return 'primary';
    if (p === 'baja') return 'success';
    return 'secondary';
  }

  // Métodos de acción (mapeo a métodos existentes)
  editarTramite(tramite: TramiteEnriquecido): void {
    this.abrirModalEditar(tramite);
  }

  verDetalle(tramite: TramiteEnriquecido): void {
    this.tramiteSeleccionado = tramite;
    this.mostrarDetalle = true;
  }

  eliminarTramite(id: number): void {
    if (!confirm('¿Está seguro que desea eliminar este trámite?')) return;

    this.tramiteService.eliminar(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Trámite eliminado exitosamente');
        this.cargarTramites();
      },
      error: (err) => {
        this.notificationService.showError('Error al eliminar trámite: ' + (err.message || 'Error desconocido'));
        console.error('Error eliminando trámite:', err);
      }
    });
  }

  puedeEliminar(tramite: TramiteEnriquecido): boolean {
    const estadosNoEliminables = ['finalizado', 'cancelado', 'rechazado'];
    return !estadosNoEliminables.includes(tramite.estado);
  }

  // Permisos de acción (basado en roles/permisos del usuario)
  puedeVerAccion(accion: string): boolean {
    // Por ahora, permitir todas las acciones si el usuario está autenticado
    // En el futuro, se puede integrar con permisos específicos
    return true;
  }

  puedeAprobar(tramite: TramiteEnriquecido): boolean {
    const estadosAprobables = ['registrado', 'en_revision', 'derivado', 'observado'];
    return estadosAprobables.includes(tramite.estado);
  }

  puedeRechazar(tramite: TramiteEnriquecido): boolean {
    const estadosRechazables = ['registrado', 'en_revision', 'derivado', 'observado'];
    return estadosRechazables.includes(tramite.estado);
  }

   puedeObservar(tramite: TramiteEnriquecido): boolean {
     return this.puedeAprobar(tramite);
   }

    // ========== REVISIÓN DE REQUISITOS ==========

    ejecutarAccion(tramite: TramiteEnriquecido, accion: string): void {
      switch (accion) {
        case 'aprobar':
          if (this.puedeAprobar(tramite)) {
            this.tramiteService.aprobar(tramite.id).subscribe({
              next: () => {
                this.notificationService.showSuccess('Trámite aprobado exitosamente');
                this.cargarTramites();
              },
              error: (err) => {
                this.notificationService.showError('Error al aprobar el trámite');
              }
            });
          }
          break;
        case 'rechazar':
          if (this.puedeRechazar(tramite)) {
            const motivo = prompt('Ingrese el motivo del rechazo:');
            if (!motivo) return;
            this.tramiteService.rechazar(tramite.id, motivo).subscribe({
              next: () => {
                this.notificationService.showSuccess('Trámite rechazado');
                this.cargarTramites();
              },
              error: (err) => {
                this.notificationService.showError('Error al rechazar el trámite');
              }
            });
          }
          break;
        case 'observar':
          if (this.puedeObservar(tramite)) {
            const observaciones = prompt('Ingrese las observaciones para corrección:');
            if (!observaciones) return;
            this.tramiteService.observar(tramite.id, observaciones).subscribe({
              next: () => {
                this.notificationService.showSuccess('Trámite enviado a observación');
                this.cargarTramites();
              },
              error: (err) => {
                this.notificationService.showError('Error al observar el trámite');
              }
            });
          }
          break;
        case 'derivar':
          if (this.puedeDerivar(tramite)) {
            this.abrirModalDerivar(tramite);
          }
          break;
        default:
          console.warn(`Acción no reconocida: ${accion}`);
      }
    }

  // Paginación
  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  get paginasTotales(): number {
    return Math.ceil(this.tramitesFiltrados.length / this.itemsPorPagina);
  }

  // Cerrar detalle
  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.tramiteSeleccionado = null;
  }

  // Guardar observaciones desde modal de detalle
  guardarObservaciones(tramite: TramiteEnriquecido): void {
    // Esta funcionalidad ya está en el modal de formulario
    // Aquí podríamos abrir el modal de edición directamente
    this.abrirModalEditar(tramite);
  }

  // Cerrar modal crear
  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
    this.resetFormCrear();
  }

  // Guardar nuevo trámite (ya existe como crearTramite, pero el HTML lo llama guardarNuevoTramite)
  guardarNuevoTramite(): void {
    this.crearTramite();
  }

  // Cambiar filtro de tipo solicitante
  cambiarFiltroTipoSolicitante(tipo: string): void {
    this.filtroTipoSolicitante = tipo;
    this.textoBusquedaSolicitante = '';

    if (tipo === 'todos') {
      this.solicitantes = [...this.solicitantesCompletos];
    } else {
      this.solicitantes = this.solicitantesCompletos.filter(s => s.tipoSolicitante === tipo);
    }
    this.mostrarDropdown = true;
  }

  // Búsqueda de solicitante
  onBusquedaSolicitante(event: any): void {
    this.filtrarSolicitantes();
  }

  // Cerrar dropdown con delay (para permitir click en opciones)
  cerrarDropdownConDelay(): void {
    setTimeout(() => {
      this.mostrarDropdown = false;
    }, 200);
  }

  // Obtener solicitante por ID
  getSolicitanteById(id: number): any {
    return this.solicitantes.find(s => s.id === id);
  }

  // Cerrar modal persona natural
  cerrarModalPersonaNatural(): void {
    this.mostrarModalPersonaNatural = false;
    this.resetPersonaNaturalForm();
  }

  // Guardar persona natural (ya existe como crearPersonaNatural)
  guardarPersonaNatural(): void {
    this.crearPersonaNatural();
  }

  // Cerrar modal formulario
  cerrarModalFormulario(): void {
    this.mostrarModalFormulario = false;
    this.tramiteParaEditar = null;
  }

  // Tramite guardado (callback del modal)
  onTramiteGuardado(): void {
    this.cargarTramites();
    this.cerrarModalFormulario();
  }

  // Derivar desde modal
  onDerivarDesdeModal(departamentoId: number, observaciones?: string): void {
    this.derivarTramite(departamentoId, observaciones);
  }

  // Cerrar modal derivación
  cerrarModalDerivacion(): void {
    this.mostrandoModalDerivacion = false;
    this.tramiteParaDerivar = null;
  }
}