import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InspeccionService, InspeccionPublicaDTO, VehiculoDTO } from '../../../modules/inspecciones/services/inspeccion.service';

@Component({
  selector: 'app-inspecciones-publicas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inspecciones-publicas.component.html',
  styleUrls: ['./inspecciones-publicas.component.scss']
})
export class InspeccionesPublicasComponent implements OnInit {
  filtrosForm: FormGroup;
  inspecciones: InspeccionPublicaDTO[] = [];
  vehiculos: VehiculoDTO[] = [];
  cargando: boolean = false;
  error: string | null = null;

  // Modal para vehículos
  mostrarModalVehiculos: boolean = false;
  inspeccionSeleccionada: InspeccionPublicaDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private inspeccionService: InspeccionService
  ) {
    this.filtrosForm = this.fb.group({
      fechaDesde: [''],
      fechaHasta: [''],
      empresa: ['']
    });
  }

  ngOnInit(): void {
    // Cargar todas las inspecciones por defecto
    this.buscar();
  }

  buscar(): void {
    this.cargando = true;
    this.error = null;
    this.inspecciones = [];

    const { fechaDesde, fechaHasta, empresa } = this.filtrosForm.value;

    this.inspeccionService.listarInspeccionesPublicas(
      fechaDesde || undefined,
      fechaHasta || undefined,
      empresa || undefined
    ).subscribe({
      next: (data: InspeccionPublicaDTO[]) => {
        this.inspecciones = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar inspecciones:', err);
        this.error = 'Error al cargar la lista de inspecciones';
        this.cargando = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.buscar();
  }

  verVehiculos(inspeccion: InspeccionPublicaDTO): void {
    this.inspeccionSeleccionada = inspeccion;
    this.vehiculos = [];
    this.mostrarModalVehiculos = true;

    this.inspeccionService.obtenerVehiculosPorInspeccion(inspeccion.idInspeccion).subscribe({
      next: (data: VehiculoDTO[]) => {
        this.vehiculos = data;
      },
      error: (err: any) => {
        console.error('Error al cargar vehículos:', err);
        this.error = 'Error al cargar vehículos';
        this.mostrarModalVehiculos = false;
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModalVehiculos = false;
    this.inspeccionSeleccionada = null;
    this.vehiculos = [];
  }

  formatFecha(fecha: string | Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
