import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ImagenSitioService, ImagenSitio } from '../../../shared/services/imagen-sitio.service';
import { PublicNavbarComponent } from '../../../public/components/public-navbar/public-navbar.component';

export interface RequisitoTUPCDTO {
  id: number;
  codigo: string;
  descripcion: string;
  tipoDocumento: string;
  obligatorio: boolean;
  esExamen: boolean;
  formatoArchivo?: string;
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
  obligatoriosCount?: number;
}

@Component({
  selector: 'app-tramites-publicos',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicNavbarComponent],
  templateUrl: './tramites-publicos.component.html',
  styleUrls: ['./tramites-publicos.component.scss']
})
export class TramitesPublicosComponent implements OnInit {
  tiposTramite: TipoTramitePublicoDTO[] = [];
  cargando = false;
  error: string | null = null;
  tipoSeleccionado: TipoTramitePublicoDTO | null = null;
  mostrarModal = false;
  
  imagenes: Map<string, ImagenSitio> = new Map();

  private tipoDocumentoMap: { [key: string]: string } = {
    'archivo': 'Archivo adjunto',
    'examen_presencial': 'Examen presencial',
    'formato': 'Formato oficial',
    'Otro': 'Otro'
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private imagenSitioService: ImagenSitioService) {}

  ngOnInit(): void {
    this.cargarTiposTramite();
    const apiBase = environment.apiUrl;
    this.imagenSitioService.listarTodas().subscribe({
      next: (data) => {
        this.imagenes.clear();
        data.forEach(img => {
          const downloadUrl = `${apiBase}/imagenes-sitio/${img.id}/download`;
          this.imagenes.set(img.ubicacion, { ...img, url: downloadUrl });
        });
      },
      error: (err) => console.error('Error cargando imágenes:', err)
    });
  }

  private cargarTiposTramite(): void {
    this.cargando = true;
    this.error = null;

    this.http.get<TipoTramitePublicoDTO[]>(`${environment.apiUrl}/tipos-tramite/publico`).subscribe({
      next: (data) => {
        this.tiposTramite = data.map(tipo => {
          const requisitosList: RequisitoTUPCDTO[] = tipo.requisitos || [];
          const obligatoriosCount = requisitosList.filter((r: RequisitoTUPCDTO) => r.obligatorio).length;
          const requisitos = requisitosList.map((req: RequisitoTUPCDTO) => ({
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
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando tipos de trámite:', err);
        this.error = 'Error al cargar los tipos de trámite';
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
   
   // ========== IMÁGENES DEL SITIO ==========
   
   getImagenUrl(ubicacion: string): string | null {
     return this.imagenes.get(ubicacion)?.url || null;
   }
   
   tieneImagen(ubicacion: string): boolean {
     return !!this.imagenes.get(ubicacion);
   }
 }
