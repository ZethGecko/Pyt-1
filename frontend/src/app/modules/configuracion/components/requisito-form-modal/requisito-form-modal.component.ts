import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormatoService } from '../../services/formato.service';
import { RequisitoTUPACService } from '../../services/requisito-tupac.service';
import { TUPACService } from '../../services/tupac.service';
import { RequisitoTUPAC, TIPOS_DOCUMENTO, TipoDocumento, RequisitoTUPACCreateRequest, RequisitoTUPACUpdateRequest } from '../../models/requisito-tupac.model';
import { Formato } from '../../models/formato.model';
import { TUPAC } from '../../models/tupac.model';

@Component({
  selector: 'app-requisito-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './requisito-form-modal.component.html',
  styleUrls: ['./requisito-form-modal.component.scss']
})
export class RequisitoFormModalComponent implements OnInit, OnChanges {
  @Input() tupac: TUPAC | null = null;
  @Input() requisito: RequisitoTUPAC | null = null;
  @Input() mostrar = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  modoEditar = false;
  form!: FormGroup;

  formatos: Formato[] = [];
  archivoSeleccionado: File | null = null;
  cargando = false;
  cargandoTupacs = false;
  error: string | null = null;
  success: string | null = null;
  tupacs: TUPAC[] = [];
  
  // Exponer TIPOS_DOCUMENTO para la plantilla
  readonly TIPOS_DOCUMENTO = TIPOS_DOCUMENTO;

  // Getter para el ID del TUPAC (lee desde el formulario)
  get tupacId(): number | null {
    return this.form.get('tupacId')?.value ?? null;
  }

  get tupacNombre(): string | null {
    return this.tupac?.descripcion ?? null;
  }

  constructor(
    private fb: FormBuilder,
    private formatoService: FormatoService,
    private requisitoService: RequisitoTUPACService,
    private tupacService: TUPACService
  ) {}

  ngOnInit(): void {
    // Inicializar formulario con tupac si está disponible
    this.inicializarFormulario();
    
    this.cargarFormatos();
    // Si no hay tupac pre-seleccionado, cargar la lista de TUPACs
    if (!this.tupac) {
      this.cargarTupacs();
    }
  }
  
  private inicializarFormulario(): void {
    this.form = this.fb.group({
      tupacId: [this.tupac?.id ?? null, Validators.required],
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.required]],
      tipoDocumento: ['', Validators.required],
      obligatorio: [true],
      esExamen: [false],
      diasValidez: [null as number | null],
      formatoId: [null as number | null],
      modoFormato: ['subir' as 'subir' | 'seleccionar']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Actualizar tupacId cuando cambie el input tupac
    if (changes['tupac'] && this.tupac) {
      if (this.form) {
        this.form.get('tupacId')?.setValue(this.tupac.id);
      }
    }
    if (changes['requisito'] && this.requisito) {
      this.cargarDatosRequisito();
    }
  }

  private cargarDatosRequisito(): void {
    this.modoEditar = true;
    // Determinar modo de formato basado en si ya tiene formato
    const tieneFormato = this.requisito!.formato && this.requisito!.formato.id ? true : false;
    // Usar tupacId del requisito o del tupacSeleccionado como respaldo
    const tupacId = this.requisito!.tupac?.id ?? this.tupac?.id;
    this.form.patchValue({
      tupacId: tupacId,
      codigo: this.requisito!.codigo,
      descripcion: this.requisito!.descripcion,
      tipoDocumento: this.requisito!.tipoDocumento,
      obligatorio: this.requisito!.obligatorio,
      esExamen: this.requisito!.esExamen,
      diasValidez: this.requisito!.diasValidez || null,
      formatoId: tieneFormato ? this.requisito!.formato!.id : null,
      modoFormato: tieneFormato ? 'seleccionar' : 'subir'
    });
  }

  cargarTupacs(): void {
    this.cargandoTupacs = true;
    this.tupacService.listarTodos().subscribe({
      next: (tupacs) => {
        this.tupacs = tupacs;
        this.cargandoTupacs = false;
      },
      error: (err) => {
        console.error('Error cargando TUPACs:', err);
        this.cargandoTupacs = false;
      }
    });
  }

  cargarFormatos(): void {
    this.cargando = true;
    this.formatoService.listarTodos().subscribe({
      next: (formatos) => {
        this.formatos = formatos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando formatos:', err);
        this.cargando = false;
      }
    });
  }

  onArchivoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  onModoFormatoChange(): void {
    const modo = this.form.get('modoFormato')?.value;
    if (modo === 'seleccionar') {
      this.archivoSeleccionado = null; // Limpiar archivo porque se usará selector
      this.form.get('formatoId')?.setValue(null);
      // Cargar formatos solo cuando se necesita seleccionar
      if (this.formatos.length === 0) {
        this.cargarFormatos();
      }
    } else if (modo === 'ninguno') {
      this.archivoSeleccionado = null;
      this.form.get('formatoId')?.setValue(null);
    }
    // En modo 'subir' NO limpiar archivoSeleccionado para permitir subir el archivo seleccionado
  }

  validarFormulario(): boolean {
    this.error = null;

    if (!this.form.valid) {
      this.error = 'Por favor complete todos los campos requeridos';
      return false;
    }

    if (!this.tupacId) {
      this.error = 'No hay TUPAC seleccionado';
      return false;
    }

    // El formato es opcional, no se valida aquí

    return true;
  }

  async guardar(): Promise<void> {
    if (!this.validarFormulario()) {
      return;
    }

    this.cargando = true;
    this.error = null;
    this.success = null;

    try {
      let formatoIdParaRequisito: number | null = null;

      const esExamen = this.form.get('esExamen')?.value;
      if (!esExamen) {
        const modoFormato = this.form.get('modoFormato')?.value;
        if (modoFormato === 'subir' && this.archivoSeleccionado) {
          formatoIdParaRequisito = await this.subirFormato();
        } else if (modoFormato === 'seleccionar') {
          formatoIdParaRequisito = this.form.get('formatoId')?.value || null;
        } else if (modoFormato === 'ninguno') {
          formatoIdParaRequisito = null; // Explicitamente sin formato
        }
      }

      const requisitoData: any = {
        tupac: { id: this.tupacId! },
        codigo: this.form.get('codigo')?.value.trim(),
        descripcion: this.form.get('descripcion')?.value.trim(),
        tipoDocumento: this.form.get('tipoDocumento')?.value,
        obligatorio: this.form.get('obligatorio')?.value,
        esExamen: this.form.get('esExamen')?.value,
        diasValidez: this.form.get('diasValidez')?.value || undefined,
        formatoId: formatoIdParaRequisito
      };
      
      // LOG DE DEPURACIÓN
      console.log('📤 [DEBUG] Enviando actualización - formatoId:', formatoIdParaRequisito, '- Archivo:', this.archivoSeleccionado?.name, '- Modo:', this.form.get('modoFormato')?.value);

      if (this.modoEditar && this.requisito) {
        await this.actualizarRequisito(this.requisito.id!, requisitoData);
      } else {
        await this.crearRequisito(requisitoData);
      }

      this.success = this.modoEditar ? 'Requisito actualizado correctamente' : 'Requisito creado correctamente';
      this.guardado.emit();
      setTimeout(() => this.cerrar.emit(), 1000);

    } catch (err: any) {
      console.error('Error guardando requisito:', err);
      this.error = err.error?.message || 'Error al guardar el requisito';
      this.cargando = false;
    }
  }

  private subirFormato(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.archivoSeleccionado) {
        reject(new Error('No hay archivo seleccionado'));
        return;
      }

      // Enviar cadena vacía para que el backend use el nombre original del archivo
      this.formatoService.upload(this.archivoSeleccionado, '').subscribe({
        next: (formato) => {
          resolve(formato.id!);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  private crearRequisito(data: RequisitoTUPACCreateRequest): Promise<RequisitoTUPAC> {
    return new Promise((resolve, reject) => {
      this.requisitoService.crear(data).subscribe({
        next: (result) => {
          this.cargando = false;
          resolve(result);
        },
        error: (err) => {
          this.cargando = false;
          reject(err);
        }
      });
    });
  }

  private actualizarRequisito(id: number, data: RequisitoTUPACUpdateRequest): Promise<RequisitoTUPAC> {
    return new Promise((resolve, reject) => {
      this.requisitoService.actualizar(id, data).subscribe({
        next: (result) => {
          this.cargando = false;
          resolve(result);
        },
        error: (err) => {
          this.cargando = false;
          reject(err);
        }
      });
    });
  }

  cerrarModal(): void {
    this.cerrar.emit();
    // Reset form when closing
    this.form.reset({
      tupacId: this.tupac?.id ?? null,
      codigo: '',
      descripcion: '',
      tipoDocumento: '',
      obligatorio: true,
      esExamen: false,
      diasValidez: null,
      formatoId: null,
      modoFormato: 'subir'
    });
    this.modoEditar = false;
    this.archivoSeleccionado = null;
    this.error = null;
    this.success = null;
  }
}
