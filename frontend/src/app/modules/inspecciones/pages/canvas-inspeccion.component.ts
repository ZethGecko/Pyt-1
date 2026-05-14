import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { FormsModule } from '@angular/forms';
import { FichaInspeccionService, FichaInspeccion, ParametroInspeccion } from '../services/ficha-inspeccion.service';
import { InspeccionService, InspeccionResponse } from '../services/inspeccion.service';
import { FormatoInspeccionService, FormatoInspeccion, CampoFormato } from '../services/formato-inspeccion.service';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { NotificationService } from '../../../shared/services/notification.service';
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
export class CanvasInspeccionComponent implements OnInit {
  inspeccionId: number = 0;
  modoEdicion: boolean = false;
  ficha: FichaInspeccion | null = null;
  inspeccion?: InspeccionResponse;
  parametrosFicha: ParametroFichaExtendido[] = [];
  errorCarga: boolean = false;
  mensajeError: string = '';
  cargandoFicha: boolean = false;
  modoDiseno: boolean = false;

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
    private notificationService: NotificationService
  ) {}

   ngOnInit(): void {
    const ruta = this.route.snapshot.routeConfig?.path || '';
    // Intentar obtener ID por diferentes nombres de parámetro
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
      // Ruta para editar formato (modo diseño)
      this.modoDiseno = true;
      this.cargarFormatoParaEdicion();
    } else if (ruta.includes('ficha')) {
      // Ruta para ver ficha (modo ejecución). El parámetro es fichaId.
      // Obtener la ficha para conocer el inspeccionId real.
      this.cargandoFicha = true;
      this.fichaInspeccionService.getById(idNum).subscribe({
        next: (ficha: FichaInspeccion) => {
          this.cargandoFicha = false;
          this.ficha = ficha;
          if (ficha.inspeccionId) {
            this.inspeccionId = ficha.inspeccionId;
            this.modoDiseno = false;
            this.cargarDatos();
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
    } else {
      // Ruta realizar/:id (inspeccionId directo)
      this.modoDiseno = false;
      this.cargarDatos();
    }
  }

   private cargarFormatoGlobal(): void {
     this.cargandoFicha = true;
     this.errorCarga = false;
     this.formatoInspeccionService.getGlobal().subscribe({
       next: (formato) => {
         this.cargandoFicha = false;
         if (formato) {
           this.ficha = this.construirFichaDesdeFormato(formato);
           this.sincronizarTitulosDesdeFormato(formato);
           this.construirParametrosFicha();
           this.rellenarDatosAutomaticos();
         } else {
           this.ficha = null;
           this.inicializarFichaVacia();
         }
       },
       error: (err: any) => {
         this.cargandoFicha = false;
         console.error('Error cargando formato global:', err);
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
       inspeccion: this.inspeccionService.obtener(this.inspeccionId),
       formato: this.formatoInspeccionService.getByInspeccion(this.inspeccionId)
     }).subscribe({
       next: ({ fichas, inspeccion, formato }) => {
         this.cargandoFicha = false;
         this.inspeccion = inspeccion;
         if (fichas && fichas.length > 0) {
           this.ficha = fichas.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
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
           } else if (formato && formato.campos && formato.campos.length > 0) {
             this.parametrosFicha = formato.campos.map(c => ({
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
           } else {
             this.inicializarFichaVacia();
           }

            this.clasificarPorSecciones();
            this.rellenarDatosAutomaticos();

            // Sincronizar títulos desde el formato cargado
            if (formato) {
              this.sincronizarTitulosDesdeFormato(formato);
            }
         } else {
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
        if (formato) {
          this.ficha = this.construirFichaDesdeFormato(formato);
          this.sincronizarTitulosDesdeFormato(formato);
          this.construirParametrosFicha();
          this.rellenarDatosAutomaticos();
        } else {
          this.ficha = null;
          this.inicializarFichaVacia();
        }
      },
      error: (err: any) => {
        this.cargandoFicha = false;
        console.error('Error cargando formato:', err);
        this.errorCarga = true;
        this.mensajeError = 'Error al cargar el formato de inspección.';
      }
    });
  }


  crearFichaManual(): void {
    if (!confirm('¿Desea crear una ficha de inspección vacía para esta inspección?\n\nNota: Se crearán los campos por defecto, pero puede editarlos luego.')) {
      return;
    }

    this.cargandoFicha = true;
    const currentUserId = this.authState.currentUser()?.id;
    this.fichaInspeccionService.create({
      inspeccionId: this.inspeccionId,
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
       parametros: formato.campos.map(c => ({
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
       const fecha = this.inspeccion.fechaProgramada;
       let day: string, month: string, year: string;
       if (fecha instanceof Date) {
         day = fecha.getDate().toString().padStart(2, '0');
         month = (fecha.getMonth() + 1).toString().padStart(2, '0');
         year = fecha.getFullYear().toString();
       } else {
         const parts = String(fecha).split('-');
         if (parts.length === 3) {
           year = parts[0];
           month = parts[1];
           day = parts[2];
         } else {
           const d = new Date(fecha);
           day = d.getDate().toString().padStart(2, '0');
           month = (d.getMonth() + 1).toString().padStart(2, '0');
           year = d.getFullYear().toString();
         }
       }
       mapping['Fecha:'] = `${day}/${month}/${year}`;
     }
     if (this.inspeccion.gerenteNombre) {
       mapping['Representante:'] = this.inspeccion.gerenteNombre;
     }
     if ((this.inspeccion as any).gerenteDni) {
       mapping['DNI:'] = (this.inspeccion as any).gerenteDni;
     }

     for (const param of this.parametrosFicha) {
       const key = param.parametro?.trim();
       if (key && mapping[key] !== undefined && (!param.valor || param.valor.trim() === '')) {
         param.valor = mapping[key];
       }
     }
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

  volverAtras(): void {
    this.router.navigate(['/inspecciones']);
  }

   guardarCertificado(): void {
     if (this.modoDiseno) {
       const currentUserId = this.authState.currentUser()?.id;
       if (!currentUserId) {
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

       // Solo incluir inspeccionId si es válido (>0)
       if (this.inspeccionId && this.inspeccionId > 0) {
         formatoDTO.inspeccionId = this.inspeccionId;
       }

       this.cargandoFicha = true;
       const existingFormatoId = this.ficha?.id;

       const request = existingFormatoId
         ? this.formatoInspeccionService.update(existingFormatoId, formatoDTO)
         : this.formatoInspeccionService.create(formatoDTO);

       request.subscribe({
         next: (formato) => {
           this.ficha = this.construirFichaDesdeFormato(formato);
           this.sincronizarTitulosDesdeFormato(formato);
           this.construirParametrosFicha();
           this.rellenarDatosAutomaticos();
           // Actualizar el ID del formato en la ficha para futuras ediciones
           this.ficha.id = formato.id;
           this.notificationService?.showSuccess('Formato guardado correctamente', 'Éxito', 2000);
           this.cargandoFicha = false;
         },
         error: (err: any) => {
           this.cargandoFicha = false;
           console.error('Error guardando formato:', err);
           alert('Error al guardar el formato.');
         }
       });
       return;
     }

     this.guardarCertificadoEjecucion();
   }

  private guardarCertificadoEjecucion(): void {
    if (this.ficha) {
      (this.ficha as any).firmaResponsable = this.firmaResponsable || null;
      (this.ficha as any).fechaFirma = this.fechaFirma || null;
      this.ficha.estado = this.ficha.estado || false;
      this.ficha.resultado = this.resultado || undefined;
    }

    const fichaDTO = {
      inspeccionId: this.inspeccionId,
      estado: this.ficha?.estado || false,
      usuarioInspector: this.authState.currentUser()?.id || null,
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

    this.cargandoFicha = true;
    if (this.ficha && this.ficha.id) {
      this.fichaInspeccionService.update(this.ficha.id, fichaDTO).subscribe({
        next: () => {
          this.notificationService?.showSuccess('Certificado guardado correctamente', 'Éxito', 2000);
          this.cargandoFicha = false;
          this.cargarDatos();
        },
        error: (err: any) => {
          this.cargandoFicha = false;
          console.error('Error actualizando certificado:', err);
          alert('Error al guardar el certificado.');
        }
      });
    } else {
      this.fichaInspeccionService.create(fichaDTO).subscribe({
        next: () => {
          this.notificationService?.showSuccess('Certificado guardado correctamente', 'Éxito', 2000);
          this.cargandoFicha = false;
          this.cargarDatos();
        },
        error: (err: any) => {
          this.cargandoFicha = false;
          console.error('Error creando certificado:', err);
          alert('Error al guardar el certificado.');
        }
      });
    }
  }

  toggleModoEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
  }

  imprimirCertificado(): void {
    window.print();
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
      this.notificationService?.showSuccess('Datos limpiados', 'Éxito', 2000);
    }
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
     if (param.valorOpcion === opcion) {
       param.valorOpcion = null;
       param.valor = '';
   } else {
       for (const param of this.parametrosFicha) {
         param.valor = '';
         param.observacion = '';
         param.valorOpcion = null;
       }
       this.notificationService?.showSuccess('Datos limpiados', 'Éxito', 2000);
     }
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

   puedeEditarFirma(): boolean {
     return !this.ficha?.estado;
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
    if (!this.firmaResponsable || !this.firmaResponsable.trim()) {
      alert('Debe ingresar el nombre del responsable para finalizar');
      return;
    }
    if (!this.fechaFirma) {
      alert('Debe seleccionar la fecha de firma');
      return;
    }
    this.ficha.estado = true;
    this.guardarCertificadoEjecucion();
  }

  private formatDateToInput(dateStr: string | Date): string {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
