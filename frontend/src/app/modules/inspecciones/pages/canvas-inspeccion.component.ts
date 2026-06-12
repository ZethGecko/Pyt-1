import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { FormsModule } from '@angular/forms';
import { FichaInspeccionService, FichaInspeccion, ParametroInspeccion } from '../services/ficha-inspeccion.service';
import { InspeccionService, InspeccionResponse } from '../services/inspeccion.service';
import { FormatoInspeccionService, FormatoInspeccion, CampoFormato } from '../services/formato-inspeccion.service';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { NotificationService } from '../../../shared/services/notification.service';
import { DraftInspeccionService } from '../services/draft-inspeccion.service';
import { forkJoin, of, catchError, throwError } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

type ParametroFichaExtendido = ParametroInspeccion & {
  valor: string;
  valorOpcion?: 'BIEN' | 'MAL' | null;
  _editando?: boolean;
  _valorTemp?: string;
  seccionAsignada?: string;
  orden?: number;
};

 @Component({
   selector: 'app-canvas-inspeccion',
   standalone: true,
   imports: [CommonModule, RouterLink, IconComponent, FormsModule],
   templateUrl: './canvas-inspeccion.component.html',
   styleUrls: ['./canvas-inspeccion.component.scss']
 })
  export class CanvasInspeccionComponent implements OnInit, OnDestroy {
    inspeccionId: number = 0;
    modoEdicion: boolean = false;
    ficha: FichaInspeccion | null = null;
    fichasDeInspeccion: FichaInspeccion[] = [];
    fichaSeleccionadaId: number | null = null;
    formatoId: number | null = null;
    inspeccion?: InspeccionResponse;
    parametrosFicha: ParametroFichaExtendido[] = [];
   errorCarga: boolean = false;
   mensajeError: string = '';
    cargandoFicha: boolean = false;
    modoDiseno: boolean = false;

    // Estado de conexión
    isOnline: boolean = navigator.onLine;
    draftGuardado: boolean = false;
    private isSaving: boolean = false;
    private finalizandoInspeccion: boolean = false;

   // Textos editables del encabezado
   tituloPrincipal: string = 'CERTIFICADO DE INSTRUCCIONES EQUIVALIDO COMPLEMENTARIA';
   subtituloPrincipal: string = 'CÁTEDRA DE LA EMPRESA';
   subtitulo2: string = ''; // Segundo subtítulo (corresponde a subtitulo2 en backend)
   editandoTituloPrincipal: boolean = false;
   editandoSubtituloPrincipal: boolean = false;
   editandoSubtitulo2: boolean = false;
   tituloPrincipalTemp: string = '';
   subtituloPrincipalTemp: string = '';
   subtitulo2Temp: string = '';

   secciones: { [key: string]: ParametroFichaExtendido[] } = {
     'DATOS GENERALES': [],
     'UNIDAD VEHICULAR': [],
     'PLACA': [],
     'PLAN LUNCA DE RODALE': [],
     'LABORATORIO': [],
     'OBSERVACIONES': []
   };

   // Variables para firma y resultado (modo ejecución)
   resultado: string = '';
   firmaResponsable: string = '';
   fechaFirma: string = '';

    // Debounce para autoguardado
    private autosaveTimeout: any = null;

    // Borrador: parametros en formato crudo (mapa) + flags de recuperación
    private _draftParametrosRaw: { idParametros: number; valor: string; orden: number; seccion: string }[] | null = null;
    private _borradorRecuperado: boolean = false;

  private seccionesMap: { [key: string]: string } = {
    'Nº de la empresa:': 'DATOS GENERALES',
    'Nombre del representante:': 'DATOS GENERALES',
    'Teléfono:': 'DATOS GENERALES',
    'Dirección:': 'DATOS GENERALES',
    'Localización:': 'DATOS GENERALES',
    'NUMERO DE PLACA:': 'PLACA',
    'MODELO DE LA PLACA:': 'PLACA',
    'AÑO DE LA PLACA:': 'PLACA',
    'PRIMEROS AUXILIOS:': 'PLAN LUNCA DE RODALE',
    'EXTINTORES DE INCENDIOS:': 'PLAN LUNCA DE RODALE',
    'ACCIDENTES:': 'PLAN LUNCA DE RODALE',
    'CARRETERA DE ACCESO:': 'PLAN LUNCA DE RODALE',
    'CARREO DE CIRCULACIÓN VIAL VIENTOS:': 'PLAN LUNCA DE RODALE',
    'SEÑALIZACIÓN DE OBRA:': 'PLAN LUNCA DE RODALE',
    'APLICABILIDAD MUNDIAL DE PLAZA:': 'LABORATORIO',
    'SELECCIÓN DE EMERGENCIA:': 'LABORATORIO',
    'A MUNDIAL DE PLAZA:': 'LABORATORIO',
    'CIRCULACIÓN VIARIA VIENTOS:': 'LABORATORIO',
    'SELECCIÓN DE PUNTO DE CONTACTO:': 'LABORATORIO',
    'APLICABILIDAD DE PLANTA:': 'LABORATORIO',
    'FECHA DE PROGRAMA:': 'LABORATORIO',
    'CARTA DE INDUCCIÓN:': 'LABORATORIO',
    'IMPLEMENTACION DE MANTENIMIENTO:': 'LABORATORIO',
    'CONSTRUCCIÓN DE CIUDAD:': 'LABORATORIO',
    'ESTRUCTURA DE PLAZA:': 'LABORATORIO',
    'COMPONENTE DE SEGURIDAD:': 'LABORATORIO'
  };

   // Títulos de secciones editables
   titulosSecciones: { [key: string]: string } = {
     'DATOS GENERALES': 'DATOS GENERALES',
     'UNIDAD VEHICULAR': 'UNIDAD VEHICULAR',
     'PLACA': 'PLACA',
     'PLAN LUNCA DE RODALE': 'PLAN LUNCA DE RODALE',
     'LABORATORIO': 'LABORATORIO',
     'OBSERVACIONES': 'OBSERVACIONES'
   };

   // Estados de edición de títulos
   editandoTitulo: { [key: string]: boolean } = {
     'DATOS GENERALES': false,
     'UNIDAD VEHICULAR': false,
     'PLACA': false,
     'PLAN LUNCA DE RODALE': false,
     'LABORATORIO': false,
     'OBSERVACIONES': false
   };

  tituloTemp: { [key: string]: string } = {};

   constructor(
     private route: ActivatedRoute,
     private router: Router,
     private fichaInspeccionService: FichaInspeccionService,
     private inspeccionService: InspeccionService,
     private formatoInspeccionService: FormatoInspeccionService,
     private authState: AuthStateService,
     private notificationService: NotificationService,
     private draftService: DraftInspeccionService
   ) {}

    ngOnInit(): void {
      console.log('[CanvasInspeccion] ngOnInit() - ruta:', this.route.snapshot.routeConfig?.path, 'idParam:', this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('inspeccionId') || this.route.snapshot.paramMap.get('fichaId'));
      // Detectar cambios de conexión
     window.addEventListener('online', () => this.handleOnline());
     window.addEventListener('offline', () => this.handleOffline());

     const ruta = this.route.snapshot.routeConfig?.path || '';
     let idParam = this.route.snapshot.paramMap.get('id') ||
                   this.route.snapshot.paramMap.get('inspeccionId') ||
                   this.route.snapshot.paramMap.get('fichaId');

     if (!idParam) {
       // Sin ID: cargar formato global (modo diseño)
       this.modoDiseno = true;
       this.cargarFormatoGlobal();
       return;
     }

     const idNum = Number(idParam);
     this.inspeccionId = idNum;

     if (ruta.includes('campos')) {
       // Ruta para editar formato (modo diseño) - no usar borrador
       this.modoDiseno = true;
       this.cargarFormatoParaEdicion();
       return;
     }

     if (ruta.includes('ficha')) {
       // Ruta para ver ficha (modo ejecución). El parámetro es fichaId.
       // No se usa sistema de borradores para fichas ya guardadas
       this.modoDiseno = false;
       this.cargandoFicha = true;
       this.fichaInspeccionService.getById(idNum).subscribe({
          next: (ficha: FichaInspeccion) => {
            this.cargandoFicha = false;
            this.ficha = ficha;
            this.normalizarFichaEditable(ficha);
            if (ficha.inspeccionId) {
              this.inspeccionId = ficha.inspeccionId;
              this.cargarDatos(); // carga normal
            } else {
              this.errorCarga = true;
              this.mensajeError = 'La ficha no está asociada a ninguna inspección.';
            }
          },

         error: (err) => {
           this.cargandoFicha = false;
           this.errorCarga = true;
           this.mensajeError = 'No se pudo cargar la ficha de inspección.';
         }
       });
       return;
     }

      // Ruta realizar/:id (inspeccionId directo) - modo ejecución
      this.modoDiseno = false;

      // Verificar si hay borrador guardado para esta inspección
      const draft = this.draftService.getDraft(this.inspeccionId);
      if (draft) {
        if (!confirm(`Se encontró un borrador guardado el ${new Date(draft.ultimaModificacion).toLocaleString('es-ES')}. ¿Desea recuperarlo?`)) {
          // Usuario rechazó el borrador: limpiar y continuar normalmente
          this.draftService.clearDraft(this.inspeccionId);
        }
        // Si aceptó, guardar datos crudos del borrador; si rechazó, no hay borrador → flag stays false
        if (draft) {
          this._draftParametrosRaw = (draft.parametrosFicha || []).map((p: any) => ({
            idParametros: p.idParametros,
            valor: p.valor || '',
            orden: p.orden ?? 0,
            seccion: p.seccionAsignada || p.seccion || 'LABORATORIO'
          }));
          this._borradorRecuperado = true;
          this.firmaResponsable = draft.firmaResponsable || '';
          this.fechaFirma = draft.fechaFirma || '';
          this.resultado = draft.resultado || '';
          this.tituloPrincipal = draft.tituloPrincipal || this.tituloPrincipal;
          this.subtituloPrincipal = draft.subtituloPrincipal || this.subtituloPrincipal;
          this.subtitulo2 = draft.subtitulo2 || '';
          this.titulosSecciones = draft.titulosSecciones || this.titulosSecciones;
          this.draftGuardado = true;
        }
      }

      // Cargar datos desde servidor (merge con borrador si corresponde se hace dentro)
      this.cargarDatos();
   }

   private cargarFormatoGlobal(): void {
     this.cargandoFicha = true;
     this.errorCarga = false;
     this.formatoInspeccionService.getGlobal().subscribe({
       next: (formato) => {
         this.cargandoFicha = false;
         if (formato) {
           this.formatoId = formato.id ?? null;
           this.ficha = this.construirFichaDesdeFormato(formato);
           this.sincronizarTitulosDesdeFormato(formato);
           this.construirParametrosFicha();
           this.rellenarDatosAutomaticos();
         } else {
           this.formatoId = null;
           this.ficha = null;
           this.inicializarFichaVacia();
         }
       },
       error: (err: any) => {
         this.cargandoFicha = false;
         console.error('Error cargando formato global:', err);
         this.formatoId = null;
         this.ficha = null;
         this.inicializarFichaVacia();
       }
     });
   }

    private cargarDatos(): void {
      this.cargandoFicha = true;
      this.errorCarga = false;

      forkJoin({
        fichas: this.fichaInspeccionService.getByInspeccion(this.inspeccionId),
        inspeccion: this.inspeccionService.obtener(this.inspeccionId).pipe(catchError(() => of(null))),
        formato: this.formatoInspeccionService.getByInspeccion(this.inspeccionId).pipe(catchError(() => of(null)))
      }).subscribe({
        next: ({ fichas, inspeccion, formato }) => {
          this.cargandoFicha = false;

          console.log('[CanvasInspeccion] cargarDatos():', {
            fichasCount: fichas?.length || 0,
            formatoId_recibido: formato?.id,
            formatoNombre: formato?.nombre,
            fichaId_actual: this.ficha?.id,
            formatoId_actual: this.formatoId
          });

          // Inspección no existe en BD (FK rota/stale): notificar y continuar con la ficha
          if (!inspeccion) {
            console.warn('[CanvasInspeccion] No se pudo cargar la Inspección ' + this.inspeccionId + ': fue eliminada o nunca existió.');
            this.notificationService?.showWarning(
              'La inspección asociada a esta ficha ya no existe. La ficha se muestra en modo recuperación.',
              'Inspección no encontrada',
              6000
            );
            this.inspeccion = undefined;
          } else {
            this.inspeccion = inspeccion;
          }

          if (fichas && fichas.length > 0) {
            this.fichasDeInspeccion = fichas;
            const fichaIdDesdeRuta = Number(this.route.snapshot.paramMap.get('fichaId') || 0);
            this.ficha = fichaIdDesdeRuta > 0
              ? (fichas.find(f => Number(f.id || f.idFichaInspeccion || 0) === fichaIdDesdeRuta) || fichas[0])
              : fichas.sort((a, b) => (Number(b.id || b.idFichaInspeccion || 0)) - (Number(a.id || a.idFichaInspeccion || 0)))[0];
            this.normalizarFichaEditable(this.ficha);
            this.fichaSeleccionadaId = Number(this.ficha.id || this.ficha.idFichaInspeccion || 0);
            // En modo EJECUCION, NUNCA sobrescribir formatoId con el id de la ficha
            // formatoId solo se modifica en modo DISENO
            console.log('[CanvasInspeccion] Ficha cargada:', {
              modo: this.modoDiseno ? 'DISENO' : 'EJECUCION',
              fichaId: this.ficha.id,
              formatoId_actual: this.formatoId,
              modoDiseno: this.modoDiseno
            });
            this.resultado = this.ficha.resultado || '';
            this.firmaResponsable = (this.ficha as any).firmaResponsable || '';
            this.fechaFirma = (this.ficha as any).fechaFirma ? this.formatDateToInput((this.ficha as any).fechaFirma) : '';

            const currentUserId = this.authState.currentUser()?.id;
           if (currentUserId && !this.ficha.usuarioInspector) {
             this.ficha.usuarioInspector = currentUserId;
             this.fichaInspeccionService.update(this.ficha.id!, this.ficha).subscribe();
           }

            if (this.ficha.parametros && this.ficha.parametros.length > 0) {
              this.construirParametrosFicha();
              this.agregarCamposFormatoFaltantes(formato);
              // Merge: preservar valores del borrador y añadir campos nuevos del formato actual
              if (this._borradorRecuperado && formato) {
                this.fusionarParametrosConFormato(formato);
              }
            } else if (formato && formato.campos && formato.campos.length > 0) {
              // Solo sobrescribir formatoId si estamos en modo diseno
              if (this.modoDiseno && formato.id) {
                this.formatoId = formato.id ?? null;
              }
              this.parametrosFicha = (formato.campos || []).map(c => ({
                idParametros: c.id,
                parametro: c.nombre,
                observacion: '',
                fichaInspeccionId: this.ficha!.id,
                valor: '',
                seccion: c.seccion,
                seccionAsignada: c.seccion,
                orden: c.orden
              })) as ParametroFichaExtendido[];
              this.ficha.parametros = this.parametrosFicha.map(p => ({
                idParametros: p.idParametros,
                parametro: p.parametro,
                observacion: p.valor,
                seccion: p.seccion
              })) as any[];
              this.agregarCamposFormatoFaltantes(formato);
              // Merge: preservar valores del borrador y añadir campos nuevos del formato actual
              if (this._borradorRecuperado && formato) {
                this.fusionarParametrosConFormato(formato);
              }
            } else {
             this.inicializarFichaVacia();
           }

            this.clasificarPorSecciones();

            // Limpiar flags de borrador después de realizar la fusión (si hubo una)
            if (this._borradorRecuperado) {
              this._draftParametrosRaw = null;
              this._borradorRecuperado = false;
            }
            this.rellenarDatosAutomaticos();

            // Sincronizar títulos desde el formato cargado
            if (formato) {
              this.sincronizarTitulosDesdeFormato(formato);
            }
         } else {
           this.fichasDeInspeccion = [];
           this.fichaSeleccionadaId = null;
           this.errorCarga = true;
           this.mensajeError = `
             <strong>No existe una ficha de inspección para esta inspección.</strong><br><br>
             <strong>Flujo correcto:</strong><br>
             1. Vaya a <a href="/inspecciones/campos">"Gestión de Campos de Inspección"</a> y cree los campos necesarios<br>
             2. Cree una nueva inspección en <a href="/inspecciones">"Gestión de Inspecciones"</a><br>
             3. Luego podrá completar la ficha aquí.
           `;
         }
       },
       error: (err: any) => {
         this.cargandoFicha = false;
         console.error('Error cargando datos:', err);
         this.errorCarga = true;
         this.mensajeError = 'Error al cargar la ficha de inspección. Verifique que la inspección exista.';
       }
     });
   }

    /**
     * Fusiona valores del borrador con el formato actual.
     * Para cada campo del formato:
     *  - Si ya existe en el borrador → conserva valor del borrador (respetando lo que el usuario escribió).
     *  - Si es nuevo (no estaba en el borrador) → lo agrega como vacío.
     */
    private fusionarParametrosConFormato(formato: FormatoInspeccion): void {
      if (!this._draftParametrosRaw) return;

      // Mapa de idParametros → valor del borrador
      const mapaDraft = new Map(this._draftParametrosRaw.map(p => [p.idParametros, p.valor]));

      // Mapa de campos existentes por idParametros (para detectar ausentes)
      const idsExistentes = new Set(this.parametrosFicha.map(p => p.idParametros).filter(Boolean));

      // Actualizar valores de campos que ya existen en la ficha (por idParametros)
      for (const param of this.parametrosFicha) {
        if (param.idParametros && mapaDraft.has(param.idParametros)) {
          param.valor = mapaDraft.get(param.idParametros)!;
        }
      }

      // Añadir campos que están en el formato pero NO existían en el borrador (nuevos campos)
      for (const campo of (formato.campos || [])) {
        if (campo.id === undefined) continue;
        if (!idsExistentes.has(campo.id)) {
          this.parametrosFicha.push({
            idParametros: campo.id,
            parametro: campo.nombre,
            observacion: '',
            fichaInspeccionId: this.ficha!.id,
            valor: '',
            seccion: campo.seccion,
            seccionAsignada: campo.seccion,
            orden: campo.orden
          } as ParametroFichaExtendido);
        }
      }
    }

    /**
     * Variante de fusionarParametrosConFormato que recibe directamente el
     * array de parámetros crudos del borrador (sin necesidad de que _draftParametrosRaw
     * esté poblado previamente).
     */
    private fusionarParametrosDesdeMapa(
      parametrosRaw: { idParametros: number; valor: string; orden: number; seccion: string }[],
      formato: FormatoInspeccion
    ): void {
      this._draftParametrosRaw = parametrosRaw;
      this.fusionarParametrosConFormato(formato);
    }

    private agregarCamposFormatoFaltantes(formato: FormatoInspeccion | null): void {
      if (!formato?.campos || !this.ficha?.id) return;

      const idsExistentes = new Set(this.parametrosFicha.map(p => p.idParametros).filter(Boolean));
      for (const campo of formato.campos) {
        if (campo.id === undefined) continue;
        if (!idsExistentes.has(campo.id)) {
          this.parametrosFicha.push({
            idParametros: campo.id,
            parametro: campo.nombre,
            observacion: '',
            fichaInspeccionId: this.ficha!.id,
            valor: '',
            seccion: campo.seccion,
            seccionAsignada: campo.seccion,
            orden: campo.orden
          } as ParametroFichaExtendido);
          idsExistentes.add(campo.id);
        }
      }
      this.clasificarPorSecciones();
    }

    private cargarFormatoParaEdicion(): void {
     this.cargandoFicha = true;
     this.errorCarga = false;

    forkJoin({
      inspeccion: this.inspeccionService.obtener(this.inspeccionId)
    }).pipe(
      switchMap(({ inspeccion }) => {
        return this.formatoInspeccionService.getByInspeccion(this.inspeccionId).pipe(
          catchError(err => err.status === 404 ? of(null) : throwError(err)),
          map(formato => ({ inspeccion, formato }))
        );
      })
    ).subscribe({
      next: ({ inspeccion, formato }) => {
        this.cargandoFicha = false;
        this.inspeccion = inspeccion;
        console.log('[CanvasInspeccion] Formato cargado desde BD:', {
          id: formato?.id,
          nombre: formato?.nombre,
          tituloPrincipal: formato?.tituloPrincipal,
          camposCount: formato?.campos?.length || 0,
          campos: formato?.campos?.map((c: any) => ({ id: c.id, nombre: c.nombre, seccion: c.seccion }))
        });
        if (formato) {
          this.formatoId = formato.id ?? null;
          this.ficha = this.construirFichaDesdeFormato(formato);
          this.sincronizarTitulosDesdeFormato(formato);
          this.construirParametrosFicha();
          this.rellenarDatosAutomaticos();
        } else {
          this.formatoId = null;
          this.ficha = null;
          this.inicializarFichaVacia();
        }
      },
      error: (err: any) => {
        this.cargandoFicha = false;
        console.error('[CanvasInspeccion] Error cargando formato:', err);
        this.errorCarga = true;
        this.mensajeError = 'Error al cargar el formato de inspección.';
      }
    });
  }


     private obtenerInstanciaTramiteIdParaFichaManual(): number | null {
       const fichaInstanciaId = Number((this.ficha as any)?.instanciaTramiteId || 0);
       if (fichaInstanciaId > 0) {
         return fichaInstanciaId;
       }

       const rutaInstanciaId = Number(
         this.route.snapshot.queryParamMap.get('instanciaTramiteId') ||
         this.route.snapshot.queryParamMap.get('instanciaId') ||
         0
       );
       if (rutaInstanciaId > 0) {
         return rutaInstanciaId;
       }

       const instancias = this.inspeccion?.instancias || [];
       return instancias.length === 1 ? instancias[0].idInstancia : null;
     }

     crearFichaManual(): void {
      if (!this.inspeccionId || this.inspeccionId <= 0) {
        alert('No es posible crear la ficha: la inspección no tiene un identificador válido. Recargue la página o navegue nuevamente a la inspección.');
        return;
      }
      if (!this.inspeccion) {
        alert('No es posible crear la ficha: la inspección asociada no existe o fue eliminada de la base de datos.');
        return;
      }
      if (!confirm('¿Desea crear una ficha de inspección vacía para esta inspección?\n\nNota: Se crearán los campos por defecto, pero puede editarlos luego.')) {
        return;
      }

      this.fichaInspeccionService.getByInspeccion(this.inspeccionId).subscribe({
        next: (fichas) => {
          if (fichas && fichas.length > 0) {
            const existente = fichas.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
            this.ficha = existente;
            this.notificationService?.showSuccess('Se utilizará la ficha existente #' + existente.id, 'Ficha encontrada', 2000);
            this.cargarDatos();
            return;
          }

       this.cargandoFicha = true;
       const currentUserId = this.authState.currentUser()?.id;
       const instanciaTramiteId = this.obtenerInstanciaTramiteIdParaFichaManual();
       if (!instanciaTramiteId) {
         this.cargandoFicha = false;
         alert('No se pudo determinar la instancia de trámite para crear la ficha. Seleccione una instancia antes de crear la ficha.');
         return;
       }
       this.fichaInspeccionService.create({
         inspeccionId: this.inspeccionId,
         instanciaTramiteId,
         estado: false,
         usuarioInspector: currentUserId
       }).subscribe({
        next: () => {
          this.cargarDatos();
          this.errorCarga = false;
          this.cargandoFicha = false;
          alert('Ficha creada correctamente. Ahora puede editar los campos.');
        },
        error: (err: any) => {
          console.error('Error creando ficha:', err);
          this.cargandoFicha = false;
          alert('Error al crear la ficha. Asegúrese de que la inspección exista y tenga los permisos necesarios.');
        }
      });
    },
    error: (err: any) => {
      console.error('Error verificando ficha existente:', err);
      this.cargandoFicha = false;
      alert('No se pudo verificar la ficha existente. Intente nuevamente.');
    }
  });
}

   private construirFichaDesdeFormato(formato: FormatoInspeccion): FichaInspeccion {
     return {
       id: formato.id,
       tituloPrincipal: formato.tituloPrincipal,
       subtituloPrincipal: formato.subtituloPrincipal,
       subtitulo2: formato.subtitulo2 || '',
       tituloSeccionDatosGenerales: formato.tituloSeccionDatosGenerales,
       tituloSeccionPlaca: formato.tituloSeccionPlaca,
       tituloSeccionPlanLunca: formato.tituloSeccionPlanLunca,
       tituloSeccionLaboratorio: formato.tituloSeccionLaboratorio,
        parametros: (formato.campos || []).map(c => ({
         idParametros: c.id,
         parametro: c.nombre,
         observacion: '',
         seccion: c.seccion,
         tipoEvaluacion: c.tipoEvaluacion,
         orden: c.orden,
         fichaInspeccionId: c.id
       } as any))
     } as FichaInspeccion;
   }

   private construirParametrosFicha(): void {
     if (!this.ficha?.parametros || this.ficha.parametros.length === 0) {
       this.inicializarFichaVacia();
       return;
     }

     this.parametrosFicha = this.ficha.parametros.map(param => ({
       ...param,
       valor: param.observacion || '',
       valorOpcion: (param.observacion === 'BIEN' || param.observacion === 'MAL') ? param.observacion : null
     })) as ParametroFichaExtendido[];

     this.clasificarPorSecciones();
   }

   private clasificarPorSecciones(): void {
     this.secciones = {
       'DATOS GENERALES': [],
       'UNIDAD VEHICULAR': [],
       'PLACA': [],
       'PLAN LUNCA DE RODALE': [],
       'LABORATORIO': [],
       'OBSERVACIONES': []
     };

     const paramsOrdenados = [...this.parametrosFicha].sort((a, b) => {
       const secA = a.seccionAsignada || a.seccion || '';
       const secB = b.seccionAsignada || b.seccion || '';
       if (secA !== secB) return secA.localeCompare(secB);
       return (a.orden || 0) - (b.orden || 0);
     });

     for (const param of paramsOrdenados) {
       const nombre = param.parametro?.trim() || '';
       let seccion = param.seccionAsignada || param.seccion || this.seccionesMap[nombre] || 'LABORATORIO';
       if (!this.secciones[seccion]) {
         seccion = 'LABORATORIO';
       }
       this.secciones[seccion].push(param);
     }
   }

   private sincronizarTitulosDesdeFormato(formato: FormatoInspeccion): void {
     this.tituloPrincipal = formato.tituloPrincipal || this.tituloPrincipal;
     this.subtituloPrincipal = formato.subtituloPrincipal || this.subtituloPrincipal;
     this.subtitulo2 = formato.subtitulo2 || '';
     this.titulosSecciones['DATOS GENERALES'] = formato.tituloSeccionDatosGenerales || 'DATOS GENERALES';
     this.titulosSecciones['PLACA'] = formato.tituloSeccionPlaca || 'PLACA';
     this.titulosSecciones['PLAN LUNCA DE RODALE'] = formato.tituloSeccionPlanLunca || 'PLAN LUNCA DE RODALE';
     this.titulosSecciones['LABORATORIO'] = formato.tituloSeccionLaboratorio || 'LABORATORIO';
   }

   private rellenarDatosAutomaticos(): void {
     if (!this.inspeccion || !this.parametrosFicha) return;

     const fechaInspeccion = this.formatearFechaParaFicha(this.inspeccion.fechaProgramada);
     const mapping: { [key: string]: string } = {};

     // Datos de la empresa
     if (this.inspeccion.empresaNombre) {
       mapping['Empresa:'] = this.inspeccion.empresaNombre;
     }
     if (this.inspeccion.empresaRuc) {
       mapping['RUC:'] = this.inspeccion.empresaRuc;
     }
     if (this.inspeccion.lugar) {
       mapping['Lugar:'] = this.inspeccion.lugar;
     }
     if (this.inspeccion.fechaProgramada) {
       mapping['Fecha:'] = fechaInspeccion;
     }
     if (this.inspeccion.gerenteNombre) {
       mapping['Representante:'] = this.inspeccion.gerenteNombre;
     }
     if ((this.inspeccion as any).gerenteDni) {
       mapping['DNI:'] = (this.inspeccion as any).gerenteDni;
     }

     for (const param of this.parametrosFicha) {
       const key = param.parametro?.trim();
       if (!key) continue;
       if (this.esCampoFecha(key)) {
         param.valor = fechaInspeccion;
         continue;
       }
       const mappedValue = mapping[key];
       if (mappedValue !== undefined && (!param.valor || param.valor.trim() === '')) {
         param.valor = mappedValue;
       }
     }
   }

   private formatearFechaParaFicha(fecha: Date | string | undefined): string {
     if (!fecha) return '';

     if (fecha instanceof Date) {
       if (Number.isNaN(fecha.getTime())) return '';
       return this.fechaConCeros(fecha.getDate(), fecha.getMonth() + 1, fecha.getFullYear());
     }

     const texto = String(fecha);
     const partesFecha = texto.split('-');
     if (partesFecha.length === 3 && /^\d{4}$/.test(partesFecha[0])) {
       return this.fechaConCeros(Number(partesFecha[2]), Number(partesFecha[1]), Number(partesFecha[0]));
     }

     const fechaParseada = new Date(texto);
     if (Number.isNaN(fechaParseada.getTime())) return '';
     return this.fechaConCeros(fechaParseada.getDate(), fechaParseada.getMonth() + 1, fechaParseada.getFullYear());
   }

   private fechaConCeros(day: number, month: number, year: number): string {
     return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
   }

   private esCampoFecha(parametro: string): boolean {
     const normalizado = this.normalizarTexto(parametro).replace(/:/g, '').trim();
     return [
       'fecha',
       'fecha de inspeccion',
       'fecha de programa',
       'fecha programada'
     ].includes(normalizado);
   }

   private normalizarTexto(valor: string): string {
     return valor
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '')
       .toLowerCase();
   }

   private validarResultadoFicha(resultado: string): boolean {
     return ['APROBADO', 'OBSERVADO', 'DESAPROBADO'].includes(resultado.trim().toUpperCase());
   }

   private inicializarFichaVacia(): void {
      this.parametrosFicha = [
        // DATOS GENERALES (campos 1-6)
        {
          idParametros: undefined,
          parametro: 'Empresa:',
          valor: '',
          seccion: 'DATOS GENERALES',
          tipoEvaluacion: 'TEXTO',
          orden: 1,
          _editando: false
        },
        {
          idParametros: undefined,
          parametro: 'RUC:',
          valor: '',
          seccion: 'DATOS GENERALES',
          tipoEvaluacion: 'TEXTO',
          orden: 2,
          _editando: false
        },
        {
          idParametros: undefined,
          parametro: 'Lugar:',
          valor: '',
          seccion: 'DATOS GENERALES',
          tipoEvaluacion: 'TEXTO',
          orden: 3,
          _editando: false
        },
        {
          idParametros: undefined,
          parametro: 'Fecha:',
          valor: '',
          seccion: 'DATOS GENERALES',
          tipoEvaluacion: 'TEXTO',
          orden: 4,
          _editando: false
        },
        {
          idParametros: undefined,
          parametro: 'Representante:',
          valor: '',
          seccion: 'DATOS GENERALES',
          tipoEvaluacion: 'TEXTO',
          orden: 5,
          _editando: false
        },
        {
          idParametros: undefined,
          parametro: 'DNI:',
          valor: '',
          seccion: 'DATOS GENERALES',
          tipoEvaluacion: 'TEXTO',
          orden: 6,
          _editando: false
        },
        // UNIDAD VEHICULAR (campos 7-12) - sin Codigo (se muestra en encabezado)
        {
          idParametros: undefined,
          parametro: 'Unidad vehicular:',
          valor: '',
          seccion: 'UNIDAD VEHICULAR',
          tipoEvaluacion: 'TEXTO',
          orden: 7,
          _editando: false
        },
        {
          idParametros: undefined,
          parametro: 'Placa:',
          valor: '',
          seccion: 'UNIDAD VEHICULAR',
          tipoEvaluacion: 'TEXTO',
          orden: 8,
          _editando: false
        },
        {
          idParametros: undefined,
          parametro: 'Propietario:',
          valor: '',
          seccion: 'UNIDAD VEHICULAR',
          tipoEvaluacion: 'TEXTO',
          orden: 9,
          _editando: false
        },
        {
          idParametros: undefined,
          parametro: 'Nombre del Conductor:',
          valor: '',
          seccion: 'UNIDAD VEHICULAR',
          tipoEvaluacion: 'TEXTO',
          orden: 10,
          _editando: false
        },
        {
          idParametros: undefined,
          parametro: 'Licencia:',
          valor: '',
          seccion: 'UNIDAD VEHICULAR',
          tipoEvaluacion: 'TEXTO',
          orden: 11,
          _editando: false
        },
        {
          idParametros: undefined,
          parametro: 'Categoria:',
          valor: '',
          seccion: 'UNIDAD VEHICULAR',
          tipoEvaluacion: 'TEXTO',
          orden: 12,
          _editando: false
        },
        // OBSERVACIONES (campo 14)
        {
          idParametros: undefined,
          parametro: 'Observaciones generales:',
          valor: '',
          seccion: 'OBSERVACIONES',
          tipoEvaluacion: 'TEXTO',
          orden: 14,
          _editando: false
        }
      ];
      this.clasificarPorSecciones();
    }

   seleccionarFicha(fichaId: number): void {
     if (!fichaId) return;
     this.router.navigate(['/inspecciones', 'ficha', fichaId]);
   }

   volverAtras(): void {
     this.prepararParaSalida();
     this.router.navigate(['/inspecciones']);
   }

     guardarCertificado(): void {
       if (!this.modoDiseno && !this.puedeGuardarFicha()) {
         alert('La inspección ya está finalizada o cancelada. No se permiten más cambios.');
         return;
       }

       if (this.modoDiseno) {
         if (this.isSaving) {
           console.log('[CanvasInspeccion] Guardado en progreso, ignorando clic duplicado');
           return;
         }
         this.isSaving = true;

         const currentUserId = this.authState.currentUser()?.id;
         if (!currentUserId) {
           this.isSaving = false;
           alert('No se pudo obtener el ID del usuario actual');
           return;
         }

         const formatoDTO: any = {
           nombre: 'Formato ' + (this.inspeccion?.codigo || 'Inspección ' + this.inspeccionId),
           descripcion: 'Formato editado',
           tituloPrincipal: this.tituloPrincipal,
           subtituloPrincipal: this.subtituloPrincipal,
           subtitulo2: this.subtitulo2 || '',
           tituloSeccionDatosGenerales: this.titulosSecciones['DATOS GENERALES'],
           tituloSeccionPlaca: this.titulosSecciones['PLACA'],
           tituloSeccionPlanLunca: this.titulosSecciones['PLAN LUNCA DE RODALE'],
           tituloSeccionLaboratorio: this.titulosSecciones['LABORATORIO'],
           campos: this.parametrosFicha.map(p => ({
             id: p.idParametros || undefined,
             nombre: p.parametro,
             seccion: p.seccionAsignada || p.seccion || 'LABORATORIO',
             orden: p.orden !== undefined ? p.orden : 0,
             tipoEvaluacion: 'TEXTO',
             obligatorio: false
           }))
         };

         if (this.inspeccionId && this.inspeccionId > 0) {
           formatoDTO.inspeccionId = this.inspeccionId;
         }

         const existingFormatoId = this.formatoId;

         console.log('[CanvasInspeccion] Guardando formato:', {
           modo: this.formatoId ? 'UPDATE' : 'CREATE',
           formatoId: this.formatoId || 'nuevo',
           inspeccionId: this.inspeccionId,
           tituloPrincipal: formatoDTO.tituloPrincipal,
           camposEnviados: formatoDTO.campos.length,
           camposDetalle: formatoDTO.campos.map((c: any) => ({ id: c.id, nombre: c.nombre, seccion: c.seccion }))
         });

         this.cargandoFicha = true;

         const request = this.formatoId
           ? this.formatoInspeccionService.update(this.formatoId, formatoDTO)
           : this.formatoInspeccionService.create(formatoDTO);

         request.subscribe({
           next: (formato) => {
             console.log('[CanvasInspeccion] Formato guardado OK:', {
               id: formato.id,
               tituloPrincipal: formato.tituloPrincipal,
               camposCount: formato.campos?.length || 0,
               campos: formato.campos?.map((c: any) => ({ id: c.id, nombre: c.nombre, seccion: c.seccion }))
             });
             this.formatoId = formato.id ?? null;
             this.ficha = this.construirFichaDesdeFormato(formato);
             this.sincronizarTitulosDesdeFormato(formato);
             this.construirParametrosFicha();
             this.rellenarDatosAutomaticos();
             this.notificationService?.showSuccess('Formato guardado correctamente', 'Éxito', 2000);
             this.cargandoFicha = false;
             this.isSaving = false;
           },
           error: (err: any) => {
             console.error('[CanvasInspeccion] Error guardando formato:', err);
             console.error('[CanvasInspeccion] Error body:', err.error);
             this.cargandoFicha = false;
             this.isSaving = false;
             alert('Error al guardar el formato: ' + (err.error?.message || err.message || 'desconocido'));
           }
         });
         return;
       }

      this.guardarCertificadoEjecucion();
    }

    private guardarCertificadoEjecucion(soloSync: boolean = false, finalizando: boolean = false): void {
      if (!this.ficha) {
        this.cargandoFicha = false;
        return;
      }

      const estadoFicha = finalizando || this.finalizandoInspeccion ? true : false;
      this.resultado = this.resultado ? this.resultado.trim().toUpperCase() : '';

      (this.ficha as any).firmaResponsable = this.firmaResponsable || null;
      (this.ficha as any).fechaFirma = this.fechaFirma || null;
      this.ficha.resultado = this.resultado || undefined;

      if (!finalizando && !this.finalizandoInspeccion && this.inspeccion && !this.inspeccionEnCurso()) {
        this.cargandoFicha = false;
        if (!soloSync) {
          alert('La inspección debe estar iniciada para editar o guardar la ficha.');
        }
        return;
      }
      if (!finalizando && !this.finalizandoInspeccion && this.inspeccionBloqueada()) {
        this.cargandoFicha = false;
        if (!soloSync) {
          alert('La inspección ya está finalizada o cancelada. No se permiten más cambios.');
        }
        return;
      }
      if (!finalizando && !this.finalizandoInspeccion && this.fichaBloqueada()) {
        this.cargandoFicha = false;
        if (!soloSync) {
          alert('La ficha ya fue finalizada. No se permiten más cambios.');
        }
        return;
      }

      // Si la inspeccion no existe en BD (FK rota), solo permitir UPDATE de fichas existentes.
      // Bloquear POST de creacion que enviaria inspeccionId nulo/invalido al servidor.
      if (!this.inspeccion) {
        if (this.ficha && this.ficha.id) {
          this.fichaInspeccionService.update(this.ficha.id, {
            estado: estadoFicha,
            usuarioInspector: this.authState.currentUser()?.id || null,
            parametros: this.parametrosFicha.map(p => ({
              idParametros: p.idParametros,
              parametro: p.parametro,
              observacion: p.valor || '',
              seccion: p.seccionAsignada || p.seccion || 'LABORATORIO'
            })),
            firmaResponsable: this.firmaResponsable || undefined,
            fechaFirma: this.fechaFirma || undefined,
            resultado: this.resultado || undefined,
            observaciones: this.ficha.observaciones
          }).subscribe({
            next: () => {
              this.cargandoFicha = false;
              if (!soloSync) {
                this.notificationService?.showSuccess('Certificado guardado correctamente', 'Éxito', 2000);
              }
            },
            error: (err: any) => {
              console.error('Error guardando ficha sin inspeccion:', err);
              this.cargandoFicha = false;
              if (!soloSync) {
                alert('La inspeccion ya no existe. No se pudo guardar los cambios.');
              }
            }
          });
        }
        return;
      }
      const instanciaTramiteId = (this.ficha as any)?.instanciaTramiteId || this.obtenerInstanciaTramiteIdParaFichaManual();
      const fichaDTO = {
        inspeccionId: this.inspeccionId,
        estado: estadoFicha,
        usuarioInspector: this.authState.currentUser()?.id || null,
        instanciaTramiteId,
        vehiculoId: this.inspeccion?.vehiculoId || null,
        parametros: this.parametrosFicha.map(p => ({
          idParametros: p.idParametros,
          parametro: p.parametro,
          observacion: p.valor || '',
          seccion: p.seccionAsignada || p.seccion || 'LABORATORIO'
        })),
        firmaResponsable: this.firmaResponsable || undefined,
        fechaFirma: this.fechaFirma || undefined,
        resultado: this.resultado || undefined
      };

      // Si no hay conexion y no es solo sync, guardar solo local y notificar
      if (!this.isOnline && !soloSync) {
        this.guardarBorradorAutomatico();
        alert('Sin conexion. Los datos se han guardado localmente. Se sincronizaran cuando se restablezca la conexion.');
        return;
      }

      this.cargandoFicha = true;
      const fichaId = (this.ficha?.id || this.ficha?.idFichaInspeccion)!;
      const request = fichaId
        ? this.fichaInspeccionService.update(fichaId, fichaDTO)
        : this.fichaInspeccionService.create(fichaDTO);

      request.subscribe({
        next: () => {
          this.notificationService?.showSuccess('Certificado guardado correctamente', 'Exito', 2000);
          this.cargandoFicha = false;
          // Limpiar borrador local tras guardar exitosamente en servidor
          this.limpiarBorrador();
          if (finalizando || this.finalizandoInspeccion) {
            this.finalizandoInspeccion = false;
              if (this.inspeccionId) {
                this.inspeccionService.terminar(this.inspeccionId, { resultadoGeneral: undefined }).subscribe({
                  next: () => this.cargarDatos(),
                  error: () => this.cargarDatos()
                });
              } else {

              this.cargarDatos();
            }
            return;
          }
          if (!soloSync) {
            this.cargarDatos();
          }
        },
        error: (err: any) => {
          this.cargandoFicha = false;
          console.error('Error guardando certificado:', err);
          if (soloSync) {
            console.log('[CanvasInspeccion] Fallo sincronizacion, se mantendra borrador local');
          } else {
            alert('Error al guardar el certificado. Los datos se han guardado localmente.');
            this.guardarBorradorAutomatico();
          }
         }
       });
      }
      // end if (!this.inspeccion) — update de ficha existente con inspeccion desaparecida

  toggleModoEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
  }

  imprimirCertificado(): void {
    window.print();
  }

  imprimirTodasLasFichas(): void {
    if (!this.inspeccionId) return;

    this.cargandoFicha = true;
    this.fichaInspeccionService.getByInspeccion(this.inspeccionId).subscribe({
      next: (fichas) => {
        this.cargandoFicha = false;
        if (!fichas?.length) {
          alert('No hay fichas registradas para esta inspección.');
          return;
        }

        const contenido = fichas
          .map((ficha, index) => this.construirHtmlFichaParaImpresion(ficha, index + 1))
          .join('<div class="page-break"></div>');
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
          alert('No se pudo abrir la ventana de impresión.');
          return;
        }

        printWindow.document.open();
        printWindow.document.write(this.construirDocumentoImpresion(contenido));
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      },
      error: (err: any) => {
        this.cargandoFicha = false;
        console.error('Error imprimiendo fichas:', err);
        alert('Error al cargar las fichas para impresión.');
      }
    });
  }

  private construirDocumentoImpresion(contenido: string): string {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Impresión de fichas - Inspección ${this.escaparHtml(String(this.inspeccionId))}</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body { font-family: Arial, sans-serif; color: #111827; }
    .page-break { page-break-after: always; }
    .certificado { border: 2px solid #111827; padding: 24px; min-height: 250mm; }
    .titulo { text-align: center; font-weight: 700; font-size: 18px; text-transform: uppercase; margin-bottom: 18px; }
    .subtitulo { text-align: center; font-weight: 600; margin-bottom: 18px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-bottom: 18px; }
    .meta div { border-bottom: 1px solid #374151; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #374151; padding: 7px; vertical-align: top; }
    th { background: #f3f4f6; }
    .seccion { margin-top: 16px; font-weight: 700; text-transform: uppercase; }
  </style>
</head>
<body>${contenido}</body>
</html>`;
  }

  private construirHtmlFichaParaImpresion(ficha: FichaInspeccion, indice: number): string {
    const codigo = String(ficha.id || ficha.idFichaInspeccion || indice).padStart(6, '0');
    const filas = (ficha.parametros || []).map(param => `
      <tr>
        <td style="width: 42%;">${this.escaparHtml(param.parametro)}</td>
        <td>${this.escaparHtml(param.valor || param.observacion || '')}</td>
      </tr>`).join('');
    const secciones = this.agruparParametrosPorSeccion(ficha.parametros || [])
      .map(seccion => `
        <div class="seccion">${this.escaparHtml(seccion.nombre)}</div>
        <table>
          <thead>
            <tr><th>Campo</th><th>Valor</th></tr>
          </thead>
          <tbody>${seccion.filas}</tbody>
        </table>`)
      .join('');

    return `<section class="certificado">
      <div class="titulo">Certificado de inspección</div>
      <div class="subtitulo">Ficha ${codigo}</div>
      <div class="meta">
        <div><strong>Inspección:</strong> ${this.escaparHtml(this.inspeccion?.codigo || String(this.inspeccionId))}</div>
        <div><strong>Resultado:</strong> ${this.escaparHtml(ficha.resultado || 'SIN RESULTADO')}</div>
        <div><strong>Vehículo ID:</strong> ${this.escaparHtml(String(ficha.vehiculoId || 'N/A'))}</div>
        <div><strong>Instancia ID:</strong> ${this.escaparHtml(String(ficha.instanciaTramiteId || 'N/A'))}</div>
      </div>
      ${secciones || `<p>No hay campos registrados en esta ficha.</p>`}
    </section>`;
  }

  private agruparParametrosPorSeccion(parametros: ParametroInspeccion[]): Array<{ nombre: string; filas: string }> {
    const orden = ['DATOS GENERALES', 'UNIDAD VEHICULAR', 'PLACA', 'PLAN LUNCA DE RODALE', 'LABORATORIO', 'OBSERVACIONES'];
    const agrupados = new Map<string, ParametroInspeccion[]>();

    for (const param of parametros) {
      const seccion = (param as any).seccionAsignada || param.seccion || 'SIN SECCIÓN';
      const lista = agrupados.get(seccion) || [];
      lista.push(param);
      agrupados.set(seccion, lista);
    }

    const ordenadas = [...agrupados.entries()].sort((a, b) => {
      const ia = orden.indexOf(a[0]);
      const ib = orden.indexOf(b[0]);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    return ordenadas.map(([nombre, items]) => ({
      nombre,
      filas: items.map(param => `
        <tr>
          <td style="width: 42%;">${this.escaparHtml(param.parametro)}</td>
          <td>${this.escaparHtml(param.valor || param.observacion || '')}</td>
        </tr>`).join('')
    }));
  }

  private escaparHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

   limpiarCampos(): void {
     if (this.modoDiseno) {
       if (!confirm('¿Está seguro de eliminar TODOS los campos del formato? Esta acción no se puede deshacer.')) {
         return;
       }
       this.parametrosFicha = [];
       this.clasificarPorSecciones();
       this.notificationService?.showSuccess('Todos los campos eliminados', 'Éxito', 2000);
     } else {
       if (!confirm('¿Está seguro de limpiar todos los datos ingresados?')) {
         return;
       }
       for (const param of this.parametrosFicha) {
         param.valor = '';
         param.observacion = '';
       }
       this.resultado = '';
       this.firmaResponsable = '';
       this.fechaFirma = '';
       this.notificationService?.showSuccess('Datos limpiados', 'Éxito', 2000);
     }
      // Actualizar borrador local
      this.guardarBorradorAutomatico();
    }

    replicarFormato(): void {
      if (!this.inspeccionId || !this.ficha?.id) {
        alert('No hay ficha cargada para replicar el formato');
        return;
      }

      if (!confirm('Esta acción remplazará todos los campos y datos de todas las fichas de esta inspección por el formato actual. ¿Continuar?')) {
        return;
      }

      const fichaOrigenId = this.ficha.id;
      this.cargandoFicha = true;

      this.inspeccionService.replicarFormatoEnInspeccion(this.inspeccionId, fichaOrigenId).subscribe({
        next: () => {
          this.cargandoFicha = false;
          this.notificationService?.showSuccess('Formato replicado en todas las fichas', 'Éxito', 3000);
          // Recargar para ver los cambios
          this.cargarDatos();
        },
        error: (err: any) => {
          this.cargandoFicha = false;
          console.error('Error replicando formato:', err);
          alert('Error al replicar el formato: ' + (err.error?.message || err.message));
        }
      });
    }

   agregarCampoSeccion(seccion: string): void {
    const nombre = prompt(`Ingrese el nombre del nuevo campo para la sección "${seccion}":`);
    if (!nombre || !nombre.trim()) {
      alert('Debe ingresar un nombre para el campo');
      return;
    }

    const camposEnSeccion = this.secciones[seccion] || [];
    const maxOrden = camposEnSeccion.length > 0
      ? Math.max(...camposEnSeccion.map(c => c.orden || 0))
      : 0;

     const nuevoParametro: ParametroFichaExtendido = {
       idParametros: undefined,
       parametro: nombre.trim(),
       observacion: '',
       fichaInspeccionId: this.ficha?.id,
       valor: '',
       valorOpcion: null,
       seccionAsignada: seccion,
       orden: maxOrden + 1
     };

    this.parametrosFicha.push(nuevoParametro);
    this.clasificarPorSecciones();
  }

  eliminarCampo(param: ParametroFichaExtendido): void {
    if (!confirm(`¿Está seguro de eliminar el campo "${param.parametro}"?`)) {
      return;
    }

    if (param.idParametros) {
      this.formatoInspeccionService.eliminarCampo(param.idParametros).subscribe({
        next: () => {
          this.parametrosFicha = this.parametrosFicha.filter(p => p !== param);
          this.clasificarPorSecciones();
        },
        error: (err: any) => {
          console.error('Error eliminando campo:', err);
          alert('Error al eliminar el campo');
        }
      });
    } else {
      this.parametrosFicha = this.parametrosFicha.filter(p => p !== param);
      this.clasificarPorSecciones();
    }
  }

  iniciarEdicionCampo(param: ParametroFichaExtendido): void {
    param._editando = true;
    param._valorTemp = param.parametro;
  }

  guardarEdicionCampo(param: ParametroFichaExtendido): void {
    if (!param._valorTemp || !param._valorTemp.trim()) {
      alert('El nombre del campo no puede estar vacío');
      return;
    }
    param.parametro = param._valorTemp.trim();
    param._editando = false;
    param._valorTemp = '';
  }

   cancelarEdicionCampo(param: ParametroFichaExtendido): void {
     param._editando = false;
     param._valorTemp = '';
   }

    seleccionarOpcion(param: ParametroFichaExtendido, opcion: 'BIEN' | 'MAL'): void {
      if (!this.puedeEditarCampo()) return;
      if (param.valorOpcion === opcion) {
        param.valorOpcion = null;
        param.valor = '';
      } else {
        param.valorOpcion = opcion;
        param.valor = opcion;
        param.observacion = '';
      }
      this.guardarBorradorAutomatico();
    }

   // ========== EDICIÓN DE TÍTULOS DE SECCIÓN ==========

  iniciarEdicionTitulo(seccion: string): void {
    this.editandoTitulo[seccion] = true;
    this.tituloTemp[seccion] = this.titulosSecciones[seccion];
  }

  guardarEdicionTitulo(seccion: string): void {
    const nuevoTitulo = this.tituloTemp[seccion]?.trim();
    if (!nuevoTitulo) {
      alert('El título de la sección no puede estar vacío');
      return;
    }
    this.titulosSecciones[seccion] = nuevoTitulo;
    this.editandoTitulo[seccion] = false;
    this.tituloTemp[seccion] = '';
  }

  cancelarEdicionTitulo(seccion: string): void {
    this.editandoTitulo[seccion] = false;
    this.tituloTemp[seccion] = '';
  }

  // ========== EDICIÓN DE ENCABEZADO ==========

  iniciarEdicionTituloPrincipal(): void {
    this.editandoTituloPrincipal = true;
    this.tituloPrincipalTemp = this.tituloPrincipal;
  }

  guardarEdicionTituloPrincipal(): void {
    const nuevoTitulo = this.tituloPrincipalTemp?.trim();
    if (!nuevoTitulo) {
      alert('El título no puede estar vacío');
      return;
    }
    this.tituloPrincipal = nuevoTitulo;
    this.editandoTituloPrincipal = false;
    this.tituloPrincipalTemp = '';
  }

  cancelarEdicionTituloPrincipal(): void {
    this.editandoTituloPrincipal = false;
    this.tituloPrincipalTemp = '';
  }

  iniciarEdicionSubtituloPrincipal(): void {
    this.editandoSubtituloPrincipal = true;
    this.subtituloPrincipalTemp = this.subtituloPrincipal;
  }

  guardarEdicionSubtituloPrincipal(): void {
    const nuevoSubtitulo = this.subtituloPrincipalTemp?.trim();
    if (!nuevoSubtitulo) {
      alert('El subtítulo no puede estar vacío');
      return;
    }
    this.subtituloPrincipal = nuevoSubtitulo;
    this.editandoSubtituloPrincipal = false;
    this.subtituloPrincipalTemp = '';
  }

   cancelarEdicionSubtituloPrincipal(): void {
     this.editandoSubtituloPrincipal = false;
     this.subtituloPrincipalTemp = '';
   }

   iniciarEdicionSubtitulo2(): void {
     this.editandoSubtitulo2 = true;
     this.subtitulo2Temp = this.subtitulo2;
   }

   guardarEdicionSubtitulo2(): void {
     const nuevoSubtitulo = this.subtitulo2Temp?.trim();
     if (!nuevoSubtitulo) {
       alert('El subtítulo no puede estar vacío');
       return;
     }
     this.subtitulo2 = nuevoSubtitulo;
     this.editandoSubtitulo2 = false;
     this.subtitulo2Temp = '';
   }

   cancelarEdicionSubtitulo2(): void {
     this.editandoSubtitulo2 = false;
     this.subtitulo2Temp = '';
   }

    inspeccionBloqueada(): boolean {
      const estado = this.inspeccion?.estado?.toUpperCase();
      return estado === 'FINALIZADA' || estado === 'CANCELADA';
    }

    inspeccionEnCurso(): boolean {
      const estado = this.inspeccion?.estado?.toUpperCase();
      return estado === 'EN_CURSO' || estado === 'INICIADA' || estado === 'EN_PROCESO';
    }

    private fichaBloqueada(): boolean {
      return this.fichaFinalizadaRealmente(this.ficha);
    }

    private esResultadoFinalizable(resultado?: string): boolean {
      const normalizado = (resultado || '').trim().toUpperCase();
      return normalizado === 'APROBADO' || normalizado === 'OBSERVADO' || normalizado === 'DESAPROBADO';
    }

    private fichaFinalizadaRealmente(ficha?: FichaInspeccion | null): boolean {
      return Boolean(ficha?.estado)
        && this.esResultadoFinalizable(ficha?.resultado)
        && Boolean(ficha?.firmaResponsable?.trim())
        && Boolean(ficha?.fechaFirma);
    }

    private normalizarFichaEditable(ficha?: FichaInspeccion | null): void {
      if (ficha && !this.fichaFinalizadaRealmente(ficha)) {
        ficha.estado = false;
      }
    }

    puedeEditarFirma(): boolean {
      return this.inspeccionEnCurso() && !this.fichaBloqueada() && !this.inspeccionBloqueada();
    }

    puedeEditarCampo(): boolean {
      return this.inspeccionEnCurso() && !this.modoDiseno && !this.fichaBloqueada() && !this.inspeccionBloqueada();
    }

    puedeGuardarFicha(): boolean {
      return this.finalizandoInspeccion || (this.inspeccionEnCurso() && !this.fichaBloqueada() && !this.inspeccionBloqueada());
    }

    getCodigoFicha(): string {
     if (!this.ficha?.id) return '---';
     return this.ficha.id.toString().padStart(6, '0');
   }

   finalizarInspeccion(): void {
    if (!this.ficha) {
      alert('No hay una ficha cargada');
      return;
    }
    if (!this.inspeccionEnCurso()) {
      alert('La inspección debe estar iniciada para finalizarla');
      return;
    }
    if (!this.resultado) {
      alert('Debe seleccionar el resultado de la ficha para finalizar');
      return;
    }
    if (!this.validarResultadoFicha(this.resultado)) {
      alert('Resultado inválido. Use APROBADO, OBSERVADO o DESAPROBADO');
      return;
    }
    if (!this.firmaResponsable || !this.firmaResponsable.trim()) {
      alert('Debe ingresar el nombre del responsable para finalizar');
      return;
    }
    if (!this.fechaFirma) {
      alert('Debe seleccionar la fecha de firma');
      return;
    }
    this.finalizandoInspeccion = true;
    this.guardarCertificadoEjecucion(false, true);
  }

   private formatDateToInput(dateStr: string | Date): string {
     const d = new Date(dateStr);
     const year = d.getFullYear();
     const month = (d.getMonth() + 1).toString().padStart(2, '0');
     const day = d.getDate().toString().padStart(2, '0');
     return `${year}-${month}-${day}`;
   }

   // ========== GESTIÓN DE BORRADORES LOCALES ==========

   /**
    * Pregunta al usuario si desea recuperar un borrador guardado
    */
   private preguntarRecuperarBorrador(draft: any): void {
     const fecha = new Date(draft.ultimaModificacion).toLocaleString('es-ES');
     if (confirm(`Se encontró un borrador guardado el ${fecha}. ¿Desea recuperarlo?`)) {
       this.aplicarBorrador(draft);
     } else {
       this.draftService.clearDraft(this.inspeccionId);
     }
   }

    /**
     * Aplica los datos del borrador — versión flag-only
     * (valores guardados en _draftParametrosRaw, fusión se hace en cargarDatos)
     */
    private aplicarBorrador(draft: any): void {
      // Extraer mapa de idParametros → valor desde borrador
      this._draftParametrosRaw = (draft.parametrosFicha || []).map((p: any) => ({
        idParametros: p.idParametros,
        valor: p.valor || '',
        orden: p.orden ?? 0,
        seccion: p.seccionAsignada || p.seccion || 'LABORATORIO'
      }));
      this._borradorRecuperado = true;
      this.firmaResponsable = draft.firmaResponsable || '';
      this.fechaFirma = draft.fechaFirma || '';
      this.resultado = draft.resultado || '';
      this.tituloPrincipal = draft.tituloPrincipal || this.tituloPrincipal;
      this.subtituloPrincipal = draft.subtituloPrincipal || this.subtituloPrincipal;
      this.subtitulo2 = draft.subtitulo2 || '';
      this.titulosSecciones = draft.titulosSecciones || this.titulosSecciones;
      this.draftGuardado = true;
      // No llamamos a clasificarPorSecciones ni construirParametrosFicha aquí:
      // la fusión con el formato se delega a cargarDatos()
    }

   /**
    * Guarda el estado actual como borrador (auto-guardado)
    */
   private guardarBorradorAutomatico(): void {
     if (this.modoDiseno || !this.inspeccionEnCurso() || this.fichaBloqueada() || this.inspeccionBloqueada()) return; // No guardar borradores en modo diseño ni fichas cerradas

     this.draftService.saveDraft(this.inspeccionId, {
       parametrosFicha: this.parametrosFicha,
       firmaResponsable: this.firmaResponsable,
       fechaFirma: this.fechaFirma,
       resultado: this.resultado,
       tituloPrincipal: this.tituloPrincipal,
       subtituloPrincipal: this.subtituloPrincipal,
       subtitulo2: this.subtitulo2,
       titulosSecciones: this.titulosSecciones
     });
     this.draftGuardado = true;
   }

   /**
    * Guarda borrador al navegar away o cerrar
    */
   private prepararParaSalida(): void {
      if (this.modoDiseno || !this.inspeccionEnCurso() || this.fichaBloqueada() || this.inspeccionBloqueada()) return;

     // Solo guardar si hay datos
     const tieneDatos = this.parametrosFicha.some(p => p.valor && p.valor.trim() !== '') ||
                       this.firmaResponsable.trim() !== '' ||
                       this.fechaFirma !== '' ||
                       this.resultado.trim() !== '';
     if (tieneDatos) {
       this.guardarBorradorAutomatico();
       console.log('[CanvasInspeccion] Borrador guardado antes de salir');
     }
   }

   /**
    * Limpia el borrador local (cuando se guarda exitosamente en servidor)
    */
   private limpiarBorrador(): void {
     this.draftService.clearDraft(this.inspeccionId);
     this.draftGuardado = false;
   }

   // ========== MANEJO DE CONEXIÓN ==========

   @HostListener('window:online', ['$event'])
   onWindowOnline(): void {
     this.isOnline = true;
     console.log('[CanvasInspeccion] Conexión restablecida');
     this.notificationService?.showSuccess('Conexión restablecida. Los datos se sincronizarán automáticamente.', 'En línea', 3000);
     // Intentar sincronizar borrador si hay uno pendiente
     this.intentarSincronizarBorrador();
   }

   @HostListener('window:offline', ['$event'])
   onWindowOffline(): void {
     this.isOnline = false;
     console.log('[CanvasInspeccion] Conexión perdida');
     this.notificationService?.showWarning('Sin conexión. Los datos se guardarán localmente.', 'Desconectado', 3000);
   }

   private handleOnline(): void {
     this.isOnline = true;
   }

   private handleOffline(): void {
     this.isOnline = false;
   }

   /**
    * Intenta subir el borrador local al servidor si hay conexión
    */
   private intentarSincronizarBorrador(): void {
     if (!this.isOnline) return;

     const draft = this.draftService.getDraft(this.inspeccionId);
     if (draft) {
       console.log('[CanvasInspeccion] Intentando sincronizar borrador con servidor...');
       // Auto-guardar en servidor
       this.guardarCertificadoEjecucion(true); // true = solo sync, no alert
     }
    }

    onInputChange(): void {
     if (this.fichaBloqueada() || this.inspeccionBloqueada()) return;
     if (this.autosaveTimeout) {
       clearTimeout(this.autosaveTimeout);
     }
     this.autosaveTimeout = setTimeout(() => {
       this.guardarBorradorAutomatico();
     }, 1000); // Guardar 1 segundo después de la última modificación
   }

   /**
    * Llamado cuando cambian valores de opciones (BIEN/MAL)
    */
    onOpcionChange(): void {
     if (this.fichaBloqueada() || this.inspeccionBloqueada()) return;
     if (this.autosaveTimeout) {
       clearTimeout(this.autosaveTimeout);
     }
     this.autosaveTimeout = setTimeout(() => {
       this.guardarBorradorAutomatico();
      }, 1000);
    }

  public ngOnDestroy(): void {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      this.prepararParaSalida();

      if (this.autosaveTimeout) {
        clearTimeout(this.autosaveTimeout);
      }
    }
  }
