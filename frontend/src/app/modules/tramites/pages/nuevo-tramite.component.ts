import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TramiteService, TipoTramiteOption, SolicitanteOption, TramiteCreateRequest } from '../services/tramite.service';
import { TipoTramiteSolicitanteService } from '../../configuracion/services/tipo-tramite-solicitante.service';
import { ReglaTipoTramitePermisoService } from '../../configuracion/services/regla-tipo-tramite-permiso.service';
import { PersonaNaturalService } from '../../personas-naturales/services/persona-natural.service';
import { EmpresaService } from '../../empresas/services/empresa.service';
import { VehiculoService } from '../../vehiculos/services/vehiculo.service';
import { NotificationService } from 'src/app/shared/services/notification.service';

interface RequisitoDocumento {
  id: number;
  codigo: string;
  descripcion: string;
  tipoDocumento: string;
  obligatorio: boolean;
  esExamen: boolean;
  diasValidez?: number;
  archivo?: File;
  estado?: 'PENDIENTE' | 'PRESENTADO' | 'EN_REVISION' | 'APROBADO' | 'REPROBADO' | 'OBSERVADO';
  fechaPresentacion?: Date;
  observaciones?: string;
}

interface SolicitanteData {
  id: number;
  tipo: 'PersonaNatural' | 'Empresa' | 'Vehiculo';
  datos: any;
}

@Component({
  selector: 'app-nuevo-tramite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-tramite.component.html',
  styleUrls: ['./nuevo-tramite.component.scss']
})
export class NuevoTramiteComponent implements OnInit {
  // Datos del formulario
  datosTramite: TramiteCreateRequest = {
    tipoTramiteId: 0,
    solicitanteId: 0,
    codigoRUT: '',
    prioridad: 'normal',
    observaciones: ''
  };

  // Opciones para selects
  tiposTramite: TipoTramiteOption[] = [];
  solicitantes: SolicitanteOption[] = [];

  // Datos cargados
  tipoTramiteSeleccionado: TipoTramiteOption | null = null;
  tipoSolicitanteSeleccionado: 'PersonaNatural' | 'Empresa' | 'Vehiculo' | null = null;
  solicitanteSeleccionado: SolicitanteOption | null = null;
  solicitanteDataCompleto: SolicitanteData | null = null;

  // Permisos y reglas
  reglaPermiso: any = null;
  permisoSolicitante: boolean = false;
  validacionesRegla: {
    cumpleEdad?: boolean;
    cumpleAntiguedad?: boolean;
    empresaActiva?: boolean;
    licenciaValida?: boolean;
    mensajes: string[];
  } = { mensajes: [] };

  // Requisitos y documentos
  requisitos: RequisitoDocumento[] = [];
  documentosSubiendo: Map<number, boolean> = new Map();

  // Estados
  cargando = false;
  validando = false;

  // Modal de búsqueda de solicitantes
  mostrarModalSolicitante = false;
  terminoBusquedaSolicitante = '';
  resultadosBusquedaSolicitante: SolicitanteOption[] = [];
  buscandoSolicitante = false;

  // Modal de creación de persona natural
  mostrarFormularioPersonaNatural = false;
  personaNaturalForm: any = {
    dni: '',
    nombres: '',
    apellidos: '',
    genero: '',
    telefono: '',
    email: ''
  };

  // Prioridades
  prioridades = [
    { value: 'baja', label: 'Baja' },
    { value: 'normal', label: 'Normal' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' }
  ];

  // Getters para usar en el template (evitar filter en template)
  getRequisitosObligatoriosCount(): number {
    return this.requisitos ? this.requisitos.filter(r => r.obligatorio).length : 0;
  }

  getRequisitosSubidosCount(): number {
    return this.requisitos ? this.requisitos.filter(r => r.obligatorio && r.archivo).length : 0;
  }

  constructor(
    private tramiteService: TramiteService,
    private tipoTramiteSolicitanteService: TipoTramiteSolicitanteService,
    private reglaService: ReglaTipoTramitePermisoService,
    private personaNaturalService: PersonaNaturalService,
    private empresaService: EmpresaService,
    private vehiculoService: VehiculoService,
    private notificationService: NotificationService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  // ✅ CARGAR DATOS INICIALES CON forkJoin
  cargarDatosIniciales(): void {
    this.cargando = true;

    forkJoin({
      tipos: this.tramiteService.listarTiposTramite(),
      solicitantes: this.tramiteService.listarSolicitantes(),
      permisos: this.tipoTramiteSolicitanteService.getAll(0, 1000),
      reglas: this.reglaService.listarTodos()
    }).subscribe({
      next: (resultado) => {
        this.tiposTramite = resultado.tipos;
        this.solicitantes = resultado.solicitantes;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.error('Error al cargar datos iniciales', 'Error');
        console.error('Error cargando datos iniciales:', err);
      }
    });
  }

  // 🎯 SELECCIÓN DE TIPO DE TRÁMITE
  onTipoTramiteSeleccionado(tipo: TipoTramiteOption | null): void {
    this.tipoTramiteSeleccionado = tipo;
    this.datosTramite.tipoTramiteId = tipo?.id || 0;

    // Limpiar datos anteriores
    this.solicitanteSeleccionado = null;
    this.datosTramite.solicitanteId = 0;
    this.solicitanteDataCompleto = null;
    this.reglaPermiso = null;
    this.permisoSolicitante = false;
    this.validacionesRegla = { mensajes: [] };
    this.requisitos = [];

    // Cargar datos del tipo de trámite
    if (tipo && tipo.id > 0) {
      this.cargarDatosTipoTramite(tipo.id);
    }
  }

  // 🎯 SELECCIÓN DE TIPO DE SOLICITANTE
  onTipoSolicitanteSeleccionado(tipo: 'PersonaNatural' | 'Empresa' | 'Vehiculo' | null): void {
    this.tipoSolicitanteSeleccionado = tipo;
    
    // Limpiar solicitante anterior
    this.solicitanteSeleccionado = null;
    this.datosTramite.solicitanteId = 0;
    this.solicitanteDataCompleto = null;
    this.terminoBusquedaSolicitante = '';
    this.resultadosBusquedaSolicitante = [];
    
    // Limpiar validaciones
    this.permisoSolicitante = false;
    this.validacionesRegla = { mensajes: [] };
  }

  // 🎯 SELECCIÓN DE SOLICITANTE
  onSolicitanteSeleccionado(solicitante: SolicitanteOption | null): void {
    this.solicitanteSeleccionado = solicitante;
    this.datosTramite.solicitanteId = solicitante?.id || 0;

    if (solicitante && this.tipoTramiteSeleccionado) {
      this.cargarDatosSolicitanteCompleto(solicitante);
      this.validarPermisosYReglas();
    }
  }

  // 🎯 CARGAR DATOS DEL TIPO DE TRÁMITE
  cargarDatosTipoTramite(tipoTramiteId: number): void {
    this.cargando = true;

    forkJoin({
      regla: this.reglaService.obtenerPorTipoTramiteId(tipoTramiteId).pipe(
        catchError(() => of(null))
      ),
      permisos: this.tipoTramiteSolicitanteService.getByTipoTramite(tipoTramiteId)
    }).subscribe({
      next: (resultado) => {
        this.reglaPermiso = resultado.regla;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.error('Error al cargar datos del tipo de trámite', 'Error');
        console.error('Error:', err);
      }
    });
  }

  // 🎯 CARGAR DATOS COMPLETOS DEL SOLICITANTE
  cargarDatosSolicitanteCompleto(solicitante: SolicitanteOption): void {
    const tipo = solicitante.tipo?.toUpperCase() || '';

    if (tipo === 'PERSONANATURAL') {
      this.personaNaturalService.obtener(solicitante.id).subscribe({
        next: (persona) => {
          this.solicitanteDataCompleto = {
            id: persona.id,
            tipo: 'PersonaNatural',
            datos: persona
          };
          this.cargarRequisitosPorTipoTramite();
        },
        error: (err) => {
          console.error('Error cargando persona natural:', err);
          this.solicitanteDataCompleto = null;
        }
      });
    } else if (tipo === 'EMPRESA') {
      this.empresaService.obtener(solicitante.id).subscribe({
        next: (empresa) => {
          this.solicitanteDataCompleto = {
            id: empresa.id,
            tipo: 'Empresa',
            datos: empresa
          };
          this.cargarRequisitosPorTipoTramite();
        },
        error: (err) => {
          console.error('Error cargando empresa:', err);
          this.solicitanteDataCompleto = null;
        }
      });
    } else if (tipo === 'VEHICULO') {
      this.vehiculoService.obtener(solicitante.id).subscribe({
        next: (vehiculo) => {
          this.solicitanteDataCompleto = {
            id: vehiculo.id,
            tipo: 'Vehiculo',
            datos: vehiculo
          };
          this.cargarRequisitosPorTipoTramite();
        },
        error: (err) => {
          console.error('Error cargando vehículo:', err);
          this.solicitanteDataCompleto = null;
        }
      });
    }
  }

  // 🎯 CARGAR REQUISITOS POR TIPO DE TRÁMITE
  cargarRequisitosPorTipoTramite(): void {
    if (!this.tipoTramiteSeleccionado) return;

    this.tramiteService.listarRequisitosPorTipoTramite(this.tipoTramiteSeleccionado.codigo).subscribe({
      next: (requisitos) => {
        this.requisitos = requisitos.map((r: any) => ({
          id: r.id,
          codigo: r.codigo,
          descripcion: r.descripcion,
          tipoDocumento: r.tipoDocumento,
          obligatorio: r.obligatorio,
          esExamen: r.esExamen,
          diasValidez: r.diasValidez,
          archivo: undefined,
          estado: 'PENDIENTE' as const
        }));
      },
      error: (err) => {
        console.error('Error cargando requisitos:', err);
        this.requisitos = [];
      }
    });
  }

  // 🎯 VALIDAR PERMISOS Y REGLAS
  validarPermisosYReglas(): void {
    if (!this.tipoTramiteSeleccionado || !this.solicitanteSeleccionado || !this.reglaPermiso) {
      this.permisoSolicitante = false;
      this.validacionesRegla = { mensajes: [] };
      return;
    }

    const tipoSolicitante = this.solicitanteSeleccionado.tipo?.toUpperCase() || '';
    const regla = this.reglaPermiso;

    // 1. Verificar si el tipo de solicitante está permitido
    this.permisoSolicitante = this.reglaService.esValidoParaSolicitante(regla, tipoSolicitante);

    // 2. Validar reglas específicas
    this.validacionesRegla = { mensajes: [] };

    if (tipoSolicitante === 'EMPRESA' && regla.requiereEmpresaActiva) {
      const empresa = this.solicitanteDataCompleto?.datos;
      if (empresa) {
        const puedeOperar = empresa.puedeOperar || false;
        this.validacionesRegla.empresaActiva = puedeOperar;
        if (!puedeOperar) {
          this.validacionesRegla.mensajes.push('❌ La empresa debe estar activa y habilitada para operar');
        }
      }
    }

    if (tipoSolicitante === 'PERSONANATURAL' && regla.requiereLicenciaConductor) {
      this.validacionesRegla.licenciaValida = true; // Temporal
    }

    if (regla.edadMinima && tipoSolicitante === 'PERSONANATURAL') {
      const persona = this.solicitanteDataCompleto?.datos;
      if (persona && persona.fechaNacimiento) {
        const edad = this.calcularEdad(new Date(persona.fechaNacimiento));
        this.validacionesRegla.cumpleEdad = edad >= regla.edadMinima;
        if (edad < regla.edadMinima) {
          this.validacionesRegla.mensajes.push(`❌ Edad mínima requerida: ${regla.edadMinima} años (actual: ${edad})`);
        }
      }
    }

    if (regla.antiguedadMaximaVehiculo && tipoSolicitante === 'VEHICULO') {
      const vehiculo = this.solicitanteDataCompleto?.datos;
      if (vehiculo && vehiculo.fechaFabricacion) {
        const antiguedad = new Date().getFullYear() - vehiculo.fechaFabricacion;
        this.validacionesRegla.cumpleAntiguedad = antiguedad <= regla.antiguedadMaximaVehiculo;
        if (antiguedad > regla.antiguedadMaximaVehiculo) {
          this.validacionesRegla.mensajes.push(`❌ Antigüedad máxima del vehículo: ${regla.antiguedadMaximaVehiculo} años (actual: ${antiguedad})`);
        }
      }
    }

    // Mensajes informativos
    if (regla.requiereEmpresaActiva && tipoSolicitante === 'EMPRESA') {
      this.validacionesRegla.mensajes.push('ℹ️ Requiere empresa activa y habilitada');
    }
    if (regla.requiereLicenciaConductor) {
      this.validacionesRegla.mensajes.push('ℹ️ Requiere licencia de conductor válida');
    }
    if (regla.edadMinima) {
      this.validacionesRegla.mensajes.push(`ℹ️ Edad mínima requerida: ${regla.edadMinima} años`);
    }
    if (regla.antiguedadMaximaVehiculo) {
      this.validacionesRegla.mensajes.push(`ℹ️ Antigüedad máxima del vehículo: ${regla.antiguedadMaximaVehiculo} años`);
    }
    if (regla.requiereInspeccionTecnica) {
      this.validacionesRegla.mensajes.push('ℹ️ Requiere inspección técnica vehicular');
    }
    if (regla.requiereHabilitacionAnterior) {
      this.validacionesRegla.mensajes.push('ℹ️ Requiere habilitación anterior');
    }
    if (regla.diasValidezDocumentos) {
      this.validacionesRegla.mensajes.push(`ℹ️ Validez de documentos: ${regla.diasValidezDocumentos} días`);
    }
    if (regla.plazoMaximoSolicitudDias) {
      this.validacionesRegla.mensajes.push(`ℹ️ Plazo máximo para solicitar: ${regla.plazoMaximoSolicitudDias} días`);
    }
  }

  calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  // 🎯 VALIDACIÓN DEL FORMULARIO
  esFormularioValido(): boolean {
    const tipoValido = this.datosTramite.tipoTramiteId > 0;
    const solicitanteValido = this.datosTramite.solicitanteId > 0;

    if (!tipoValido || !solicitanteValido) {
      return false;
    }

    // Validar permisos
    if (!this.permisoSolicitante) {
      return false;
    }

    // Validar reglas de negocio
    if (this.validacionesRegla.cumpleEdad === false ||
        this.validacionesRegla.cumpleAntiguedad === false ||
        this.validacionesRegla.empresaActiva === false) {
      return false;
    }

    // Validar documentos obligatorios
    const documentosFaltantes = this.requisitos.filter(
      r => r.obligatorio && !r.archivo && r.estado === 'PENDIENTE'
    );
    if (documentosFaltantes.length > 0) {
      return false;
    }

    return true;
  }

  // 🎯 CREACIÓN DE TRÁMITE
  crearTramite(): void {
    if (!this.esFormularioValido()) {
      this.notificationService.error('Complete todos los campos requeridos y cumpla las reglas de validación', 'Validación');
      return;
    }

    this.validando = true;

    this.tramiteService.crear(this.datosTramite).subscribe({
      next: (tramiteCreado) => {
        this.validando = false;
        this.notificationService.success('Trámite creado exitosamente', 'Trámite creado');
        this.limpiarFormulario();
      },
      error: (err) => {
        this.validando = false;
        this.notificationService.error(err.error?.message || 'Error al crear el trámite', 'Error');
        console.error('Error creando trámite:', err);
      }
    });
  }

  // 🎯 SUBIDA DE DOCUMENTOS
  onArchivoSeleccionado(event: any, requisitoId: number): void {
    const file = event.target.files[0];
    if (!file) return;

    const requisito = this.requisitos.find(r => r.id === requisitoId);
    if (requisito) {
      requisito.archivo = file;
      this.documentosSubiendo.set(requisitoId, true);
    }
  }

  // 🎯 BÚSQUEDA DE SOLICITANTES
  buscarSolicitantes(termino: string): void {
    if (!termino || termino.length < 2 || !this.tipoSolicitanteSeleccionado) {
      this.resultadosBusquedaSolicitante = [];
      return;
    }

    this.buscandoSolicitante = true;
    
    // Filtrar por tipo de solicitante
    const tipoFiltrado = this.tipoSolicitanteSeleccionado === 'Vehiculo' ? 'GERENTE' : this.tipoSolicitanteSeleccionado.toUpperCase();
    
    this.tramiteService.buscarSolicitantes(termino).subscribe({
      next: (resultados) => {
        // Filtrar resultados por tipo de solicitante seleccionado
        this.resultadosBusquedaSolicitante = resultados.filter(r => {
          const tipoBackend = r.tipo as 'PersonaNatural' | 'Empresa' | 'GERENTE';
          const tipoFrontend = tipoBackend === 'GERENTE' ? 'Vehiculo' : tipoBackend;
          return tipoFrontend === this.tipoSolicitanteSeleccionado;
        });
        this.buscandoSolicitante = false;
      },
      error: (err) => {
        this.buscandoSolicitante = false;
        this.resultadosBusquedaSolicitante = [];
        console.error('Error buscando solicitantes:', err);
      }
    });
  }

  // 🎯 CREACIÓN RÁPIDA DE PERSONA NATURAL
  crearPersonaNatural(): void {
    if (!this.personaNaturalForm.dni || !this.personaNaturalForm.nombres || !this.personaNaturalForm.apellidos) {
      this.notificationService.error('Código RUT, nombres y apellidos son obligatorios', 'Validación');
      return;
    }

    this.cargando = true;

    this.personaNaturalService.crear({
      dni: this.personaNaturalForm.dni,
      nombres: this.personaNaturalForm.nombres.trim(),
      apellidos: this.personaNaturalForm.apellidos.trim(),
      genero: this.personaNaturalForm.genero || null,
      telefono: this.personaNaturalForm.telefono?.trim() || null,
      email: this.personaNaturalForm.email?.trim() || null
    }).subscribe({
      next: (persona) => {
        this.cargando = false;
        this.mostrarFormularioPersonaNatural = false;
        this.personaNaturalForm = { dni: '', nombres: '', apellidos: '', genero: '', telefono: '', email: '' };
        this.notificationService.success('Persona natural creada exitosamente', 'Éxito');
        this.cargarDatosIniciales();
        // Auto-seleccionar la persona creada
        setTimeout(() => {
          const nuevaPersona = this.solicitantes.find(s => s.id === persona.id && s.tipo === 'PersonaNatural');
          if (nuevaPersona) {
            this.onSolicitanteSeleccionado(nuevaPersona);
          }
        }, 100);
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.error(err.error?.message || 'Error al crear persona natural', 'Error');
        console.error('Error creando persona natural:', err);
      }
    });
  }

  // 🎯 ABRIR MODAL DE NUEVA PERSONA
  abrirModalNuevaPersona(): void {
    this.mostrarFormularioPersonaNatural = true;
    this.personaNaturalForm = { dni: '', nombres: '', apellidos: '', genero: '', telefono: '', email: '' };
  }

  // 🎯 LIMPIAR FORMULARIO
  limpiarFormulario(): void {
    this.datosTramite = { tipoTramiteId: 0, solicitanteId: 0, codigoRUT: '', prioridad: 'normal', observaciones: '' };
    this.tipoTramiteSeleccionado = null;
    this.solicitanteSeleccionado = null;
    this.solicitanteDataCompleto = null;
    this.reglaPermiso = null;
    this.permisoSolicitante = false;
    this.validacionesRegla = { mensajes: [] };
    this.requisitos = [];
    this.documentosSubiendo.clear();
  }

  // Helper methods for template
  getIconoTipoSolicitante(tipo: string): string {
    switch (tipo?.toUpperCase()) {
      case 'PERSONANATURAL': return 'person';
      case 'EMPRESA': return 'building';
      case 'VEHICULO': return 'car-front';
      default: return 'question-circle';
    }
  }

  formatTipoSolicitante(tipo: string): string {
    switch (tipo?.toUpperCase()) {
      case 'PERSONANATURAL': return 'Persona Natural';
      case 'EMPRESA': return 'Empresa';
      case 'VEHICULO': return 'Vehículo';
      default: return tipo;
    }
  }

  getLabelEstadoDocumento(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'PRESENTADO': return 'Presentado';
      case 'EN_REVISION': return 'En Revisión';
      case 'APROBADO': return 'Aprobado';
      case 'REPROBADO': return 'Reprobado';
      case 'OBSERVADO': return 'Observado';
      default: return estado;
    }
  }
}
