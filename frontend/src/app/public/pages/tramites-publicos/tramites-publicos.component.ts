import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface RequisitoTUPCDTO {
  id: number;
  codigo: string;
  descripcion: string;
  tipoDocumento: string;
  obligatorio: boolean;
  esExamen: boolean;
  formatoArchivo?: string;
  // Computed properties (optional)
  tipoClase?: string;
  badgeObligatorioClase?: string;
  badgeExamenClase?: string;
  tipoDocumentoFormateado?: string;
}

export interface TipoTramitePublicoDTO {
  id: number;
  codigo: string;
  descripcion: string;
  tupacCodigo: string;
  tupacDescripcion: string;
  requisitos: RequisitoTUPCDTO[];
  // Computed
  obligatoriosCount?: number;
}

@Component({
  selector: 'app-tramites-publicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tramites-publicos.component.html',
  styleUrls: ['./tramites-publicos.component.scss']
})
export class TramitesPublicosComponent implements OnInit {
  tiposTramite: TipoTramitePublicoDTO[] = [];
  cargando = false;
  error: string | null = null;
  tipoSeleccionado: TipoTramitePublicoDTO | null = null;
  mostrarModal = false;

  private tipoDocumentoMap: { [key: string]: string } = {
    'archivo': 'Archivo adjunto',
    'examen_presencial': 'Examen presencial',
    'formato': 'Formato oficial',
    'Otro': 'Otro'
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarTiposTramite();
  }

  private cargarTiposTramite(): void {
    this.cargando = true;
    this.error = null;

    this.http.get<TipoTramitePublicoDTO[]>(`${environment.apiUrl}/tipos-tramite/publico`).subscribe({
      next: (data) => {
        this.tiposTramite = data.map(tipo => {
          const obligatoriosCount = tipo.requisitos.filter(r => r.obligatorio).length;
          const requisitos = tipo.requisitos.map(req => ({
            ...req,
            tipoClase: 'tipo-' + (req.tipoDocumento ? req.tipoDocumento.toLowerCase() : ''),
            badgeObligatorioClase: req.obligatorio ? 'badge-success' : 'badge-secondary',
            badgeExamenClase: req.esExamen ? 'badge-primary' : 'badge-secondary',
            tipoDocumentoFormateado: this.tipoDocumentoMap[req.tipoDocumento] || req.tipoDocumento
          }));
          return {
            ...tipo,
            obligatoriosCount,
            requisitos
          };
        }) as TipoTramitePublicoDTO[];

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los tipos de trámite. Intente más tarde.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  verRequisitos(tipo: TipoTramitePublicoDTO): void {
    this.tipoSeleccionado = tipo;
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.tipoSeleccionado = null;
    this.cdr.detectChanges();
  }

  clearError(): void {
    this.error = null;
    this.cdr.detectChanges();
  }
}
