import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { FormsModule } from '@angular/forms';
import { FichaInspeccionService, FichaInspeccion, ParametroInspeccion } from '../services/ficha-inspeccion.service';
import { InspeccionService, InspeccionResponse } from '../services/inspeccion.service';
import { AuthStateService } from '../../../core/auth/state/auth.state';
import { forkJoin } from 'rxjs';

type ParametroFichaExtendido = ParametroInspeccion & {
  valor: string;
  _editando?: boolean;
  _valorTemp?: string;
  seccionAsignada?: string;
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
  editandoTituloPrincipal: boolean = false;
  editandoSubtituloPrincipal: boolean = false;
  tituloPrincipalTemp: string = '';
  subtituloPrincipalTemp: string = '';

  secciones: { [key: string]: ParametroFichaExtendido[] } = {
    'DATOS GENERALES': [],
    'PLACA': [],
    'PLAN LUNCA DE RODALE': [],
    'LABORATORIO': []
  };

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
    'PLACA': 'PLACA',
    'PLAN LUNCA DE RODALE': 'PLAN LUNCA DE RODALE',
    'LABORATORIO': 'LABORATORIO'
  };

  // Estados de edición de títulos
  editandoTitulo: { [key: string]: boolean } = {
    'DATOS GENERALES': false,
    'PLACA': false,
    'PLAN LUNCA DE RODALE': false,
    'LABORATORIO': false
  };

  tituloTemp: { [key: string]: string } = {};

  private camposPorDefecto: string[] = [
    'Nº de la empresa:',
    'Nombre del representante:',
    'Teléfono:',
    'Dirección:',
    'Localización:',
    'NUMERO DE PLACA:',
    'MODELO DE LA PLACA:',
    'AÑO DE LA PLACA:',
    'PRIMEROS AUXILIOS:',
    'EXTINTORES DE INCENDIOS:',
    'ACCIDENTES:',
    'CARRETERA DE ACCESO:',
    'CARREO DE CIRCULACIÓN VIAL VIENTOS:',
    'SEÑALIZACIÓN DE OBRA:',
    'APLICABILIDAD MUNDIAL DE PLAZA:',
    'SELECCIÓN DE EMERGENCIA:',
    'A MUNDIAL DE PLAZA:',
    'CIRCULACIÓN VIARIA VIENTOS:',
    'SELECCIÓN DE PUNTO DE CONTACTO:',
    'APLICABILIDAD DE PLANTA:',
    'FECHA DE PROGRAMA:',
    'CARTA DE INDUCCIÓN:',
    'IMPLEMENTACION DE MANTENIMIENTO:',
    'CONSTRUCCIÓN DE CIUDAD:',
    'ESTRUCTURA DE PLAZA:',
    'COMPONENTE DE SEGURIDAD:'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fichaInspeccionService: FichaInspeccionService,
    private inspeccionService: InspeccionService,
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.inspeccionId = idParam ? Number(idParam) : 0;

    if (!this.inspeccionId || this.inspeccionId <= 0) {
      this.modoDiseno = true;
      this.inicializarFichaVacia();
    } else {
      this.modoDiseno = false;
      this.cargarDatos();
    }
  }

   private cargarDatos(): void {
      this.cargandoFicha = true;
      this.errorCarga = false;
      
      forkJoin({
        fichas: this.fichaInspeccionService.getByInspeccion(this.inspeccionId),
        inspeccion: this.inspeccionService.obtener(this.inspeccionId)
      }).subscribe({
        next: ({ fichas, inspeccion }) => {
          this.cargandoFicha = false;
          this.inspeccion = inspeccion;
          if (fichas && fichas.length > 0) {
            this.ficha = fichas[0];
            // Asignar inspector automáticamente si no tiene
            const currentUserId = this.authState.currentUser()?.id;
            if (currentUserId && !this.ficha.usuarioInspector) {
              this.ficha.usuarioInspector = currentUserId;
              this.fichaInspeccionService.update(this.ficha.id!, this.ficha).subscribe({
                next: () => {
                  // Inspector asignado
                },
                error: (err) => console.error('Error asignando inspector:', err)
              });
            }
            this.construirParametrosFicha();
            this.clasificarPorSecciones();
            this.rellenarDatosAutomaticos();
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

   crearFichaManual(): void {
     if (!confirm('¿Desea crear una ficha de inspección vacía para esta inspección?\n\nNota: Se crearán los campos por defecto, pero puede editarlos luego.')) {
       return;
     }

     this.cargandoFicha = true;
     const currentUserId = this.authState.currentUser()?.id;
     this.fichaInspeccionService.create({
       inspeccionId: this.inspeccionId,
       estado: 'PENDIENTE',
       usuarioInspector: currentUserId
     }).subscribe({
       next: (nuevaFicha) => {
         this.ficha = nuevaFicha;
         this.inicializarFichaVacia();
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

  private construirParametrosFicha(): void {
    if (!this.ficha?.parametros || this.ficha.parametros.length === 0) {
      this.inicializarFichaVacia();
      return;
    }

    this.parametrosFicha = this.ficha.parametros.map(param => ({
      ...param,
      valor: param.observacion || ''
    })) as ParametroFichaExtendido[];

    this.clasificarPorSecciones();
  }

   private clasificarPorSecciones(): void {
      this.secciones = {
        'DATOS GENERALES': [],
        'PLACA': [],
        'PLAN LUNCA DE RODALE': [],
        'LABORATORIO': []
      };

      for (const param of this.parametrosFicha) {
        const nombre = param.parametro?.trim() || '';
        // Use seccionAsignada if present (custom fields), else map by name
        let seccion = param.seccionAsignada || this.seccionesMap[nombre] || 'LABORATORIO';
        // Ensure the section exists in our sections object
        if (!this.secciones[seccion]) {
          seccion = 'LABORATORIO';
        }
        this.secciones[seccion].push(param);
      }
    }

    private rellenarDatosAutomaticos(): void {
      if (!this.inspeccion || !this.parametrosFicha) return;

      const mapping: { [key: string]: string } = {};

      // Nº de la empresa: usar RUC si existe, sino nombre
      if (this.inspeccion.empresaRuc) {
        mapping['Nº de la empresa:'] = this.inspeccion.empresaRuc;
      } else if (this.inspeccion.empresaNombre) {
        mapping['Nº de la empresa:'] = this.inspeccion.empresaNombre;
      }

      // Nombre del representante: gerente o empresa
      if (this.inspeccion.gerenteNombre) {
        mapping['Nombre del representante:'] = this.inspeccion.gerenteNombre;
      } else if (this.inspeccion.empresaNombre) {
        mapping['Nombre del representante:'] = this.inspeccion.empresaNombre;
      }

      // Teléfono
      if (this.inspeccion.empresaTelefono) {
        mapping['Teléfono:'] = this.inspeccion.empresaTelefono;
      }

      // Dirección
      if (this.inspeccion.empresaDireccion) {
        mapping['Dirección:'] = this.inspeccion.empresaDireccion;
      }

      // Localización: lugar de la inspección
      if (this.inspeccion.lugar) {
        mapping['Localización:'] = this.inspeccion.lugar;
      }

      // FECHA DE PROGRAMA:
      if (this.inspeccion.fechaProgramada) {
        const fecha = this.inspeccion.fechaProgramada;
        let day: string, month: string, year: string;
        if (fecha instanceof Date) {
          day = fecha.getDate().toString().padStart(2, '0');
          month = (fecha.getMonth() + 1).toString().padStart(2, '0');
          year = fecha.getFullYear().toString();
        } else {
          // asumir string yyyy-MM-dd
          const parts = String(fecha).split('-');
          if (parts.length === 3) {
            year = parts[0];
            month = parts[1];
            day = parts[2];
          } else {
            // fallback
            const d = new Date(fecha);
            day = d.getDate().toString().padStart(2, '0');
            month = (d.getMonth() + 1).toString().padStart(2, '0');
            year = d.getFullYear().toString();
          }
        }
        mapping['FECHA DE PROGRAMA:'] = `${day}/${month}/${year}`;
      }

      // Asignar a parámetros que existan y estén vacíos
      for (const param of this.parametrosFicha) {
        const key = param.parametro?.trim();
        if (key && mapping[key] !== undefined && (!param.valor || param.valor.trim() === '')) {
          param.valor = mapping[key];
        }
      }
    }

  private inicializarFichaVacia(): void {
    this.parametrosFicha = this.camposPorDefecto.map(nombre => ({
      idParametros: undefined,
      parametro: nombre,
      observacion: '',
      fichaInspeccionId: this.ficha?.id,
      valor: ''
    })) as ParametroFichaExtendido[];
    this.clasificarPorSecciones();
  }

  volverAtras(): void {
    this.router.navigate(['/inspecciones']);
  }

  guardarCertificado(): void {
    if (this.modoDiseno) {
      alert('Modo diseño: Los cambios no se guardan. Cree una inspección primero para poder guardar.');
      return;
    }

    const updates = this.parametrosFicha
      .filter(p => p.idParametros !== undefined)
      .map(p => {
        return this.inspeccionService.actualizarParametro(p.idParametros!, {
          parametro: p.parametro,
          observacion: p.valor || ''
        });
      });

    const creates = this.parametrosFicha
      .filter(p => p.idParametros === undefined)
      .map(p => {
        return this.inspeccionService.crearParametro(this.ficha?.id || this.inspeccionId, {
          parametro: p.parametro,
          observacion: p.valor || '',
          tipoEvaluacion: 'TEXTO'
        });
      });

    const allOps = [...updates, ...creates];

    if (allOps.length === 0) {
      alert('No hay cambios para guardar');
      return;
    }

    import('rxjs').then(({ forkJoin }) => {
      forkJoin(allOps).subscribe({
        next: () => {
          alert('Certificado guardado correctamente');
          this.cargarDatos();
        },
        error: (err: any) => {
          console.error('Error guardando parámetros:', err);
          alert('Error al guardar los datos');
        }
      });
    });
  }

  toggleModoEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
  }

  imprimirCertificado(): void {
    window.print();
  }

  limpiarCampos(): void {
    if (confirm('¿Está seguro de limpiar todos los campos del certificado?')) {
      for (const param of this.parametrosFicha) {
        param.valor = '';
        param.observacion = '';
      }
    }
  }

   agregarCampoSeccion(seccion: string): void {
     const nombre = prompt(`Ingrese el nombre del nuevo campo para la sección "${seccion}":`);
     if (!nombre || !nombre.trim()) {
       alert('Debe ingresar un nombre para el campo');
       return;
     }

     const nuevoParametro: ParametroFichaExtendido = {
       idParametros: undefined,
       parametro: nombre.trim(),
       observacion: '',
       fichaInspeccionId: this.ficha?.id,
       valor: '',
       seccionAsignada: seccion
     };

     this.parametrosFicha.push(nuevoParametro);
     this.clasificarPorSecciones();
   }

  eliminarCampo(param: ParametroFichaExtendido): void {
    if (!confirm(`¿Está seguro de eliminar el campo "${param.parametro}"?`)) {
      return;
    }

    if (param.idParametros) {
      this.inspeccionService.eliminarParametro(param.idParametros).subscribe({
        next: () => {
          this.parametrosFicha = this.parametrosFicha.filter(p => p !== param);
          this.clasificarPorSecciones();
        },
        error: (err: any) => {
          console.error('Error eliminando parámetro:', err);
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

   // ========== HELPER ==========

   puedeEditar(): boolean {
     return this.modoEdicion || this.modoDiseno;
   }
 }
