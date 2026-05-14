import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PublicNavbarComponent } from 'src/app/public/components/public-navbar/public-navbar.component';

export interface InspeccionPublica {
  idInspeccion: number;
  codigo: string;
  fechaProgramada: string; // YYYY-MM-DD
  hora: string;
  lugar: string;
  empresaNombre: string;
  numeroUnidades: number;
}

export interface VehiculoInspeccion {
  identificador: string;
  placa: string;
}

@Component({
  selector: 'app-inspecciones-publicas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule, PublicNavbarComponent],
  templateUrl: './inspecciones-publicas.component.html',
  styleUrls: ['./inspecciones-publicas.component.scss']
})
export class InspeccionesPublicasComponent implements OnInit {
  inspecciones: InspeccionPublica[] = [];
  filteredInspecciones: InspeccionPublica[] = [];

  // Filtros
  fechaDesde: string = '';
  fechaHasta: string = '';
  empresaFiltro: string = '';

  cargando: boolean = false;
  error: string | null = null;

  // Modal de vehículos
  mostrarModalVehiculos: boolean = false;
  inspeccionSeleccionada: InspeccionPublica | null = null;
  vehiculos: VehiculoInspeccion[] = [];
  cargandoVehiculos: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.cargarInspecciones();
  }

  cargarInspecciones(): void {
    this.cargando = true;
    this.error = null;

    let params = new HttpParams();
    if (this.fechaDesde) params = params.set('fechaDesde', this.fechaDesde);
    if (this.fechaHasta) params = params.set('fechaHasta', this.fechaHasta);
    if (this.empresaFiltro) params = params.set('empresa', this.empresaFiltro);

    this.http.get<InspeccionPublica[]>(`${environment.apiUrl}/api/inspecciones/publico`, { params })
      .subscribe({
        next: (data) => {
          this.inspecciones = data;
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al cargar inspecciones';
          this.cargando = false;
          console.error(err);
        }
      });
  }

  aplicarFiltros(): void {
    this.filteredInspecciones = this.inspecciones.filter(ins => {
      // Filtro por empresa (ya se aplica en backend, pero por si acaso)
      if (this.empresaFiltro && !ins.empresaNombre.toLowerCase().includes(this.empresaFiltro.toLowerCase())) {
        return false;
      }
      // Filtro por fecha (ya se aplica en backend)
      return true;
    });
  }

  // Manejo de cambios en filtros
  onFechaDesdeChange(): void {
    this.cargarInspecciones();
  }

  onFechaHastaChange(): void {
    this.cargarInspecciones();
  }

  onEmpresaChange(): void {
    this.cargarInspecciones();
  }

  limpiarFiltros(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.empresaFiltro = '';
    this.cargarInspecciones();
  }

  // Formatear fecha para mostrar
  formatoFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Modal de vehículos
  verVehiculos(inspeccion: InspeccionPublica): void {
    this.inspeccionSeleccionada = inspeccion;
    this.mostrarModalVehiculos = true;
    this.cargarVehiculos(inspeccion.idInspeccion);
  }

  cargarVehiculos(inspeccionId: number): void {
    this.cargandoVehiculos = true;
    this.vehiculos = [];

    this.http.get<any[]>(`${environment.apiUrl}/api/inspecciones/${inspeccionId}/vehiculos`)
      .subscribe({
        next: (data) => {
          this.vehiculos = data.map((v: any) => ({
            identificador: v.identificador || '',
            placa: v.placa || ''
          }));
          this.cargandoVehiculos = false;
        },
        error: (err) => {
          console.error('Error cargando vehículos:', err);
          this.vehiculos = [];
          this.cargandoVehiculos = false;
        }
      });
  }

  cerrarModalVehiculos(): void {
    this.mostrarModalVehiculos = false;
    this.inspeccionSeleccionada = null;
    this.vehiculos = [];
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

