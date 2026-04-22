import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TramiteService } from '../../services/tramite.service';

@Component({
  selector: 'app-consulta-publica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-publica.component.html',
  styleUrls: ['./consulta-publica.component.scss']
})
export class ConsultaPublicaComponent implements OnInit {
  codigoRUT: string = '';
  tramite: any = null;
  loading: boolean = false;
  error: string = '';
  notFound: boolean = false;
  codigoRUTBusqueda: string = '';

  constructor(
    private tramiteService: TramiteService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  buscar(): void {
    if (!this.codigoRUT || this.codigoRUT.trim().length < 6) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.notFound = false;
    this.tramite = null;
    this.codigoRUTBusqueda = this.codigoRUT.trim();

    this.tramiteService.obtenerSeguimientoPublico(this.codigoRUTBusqueda).subscribe({
      next: (data: any) => {
        this.loading = false;
        // Combinar tramite con historial y documentos
        this.tramite = {
          ...data.tramite,
          historial: data.historial || [],
          documentos: data.documentos || []
        };
        this.notFound = !data.tramite;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'No se pudo encontrar el trámite. Verifique el Código RUT e intente nuevamente.';
        this.tramite = null;
        this.notFound = true;
        this.cd.detectChanges();
      }
    });
  }

  getPrioridadClass(prioridad: string): string {
    const classes: { [key: string]: string } = {
      'ALTA': 'danger',
      'MEDIA': 'warning',
      'BAJA': 'success',
      'URGENTE': 'danger'
    };
    return classes[prioridad?.toUpperCase()] || 'secondary';
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'PENDIENTE': 'warning',
      'EN_REVISION': 'info',
      'APROBADO': 'success',
      'RECHAZADO': 'danger',
      'FINALIZADO': 'success',
      'OBSERVADO': 'warning'
    };
    return classes[estado?.toUpperCase()] || 'secondary';
  }
}
