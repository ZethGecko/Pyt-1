import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DocumentoTramiteService } from '../services/documento-tramite.service';
import { DocumentoTramite } from '../models/documento-tramite.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pendientes-revision',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pendientes-revision.component.html',
  styleUrls: ['./pendientes-revision.component.scss']
})
export class PendientesRevisionComponent implements OnInit {
  
  documentos: DocumentoTramite[] = [];
  cargando = false;
  error: string | null = null;
  filtroEstado: string = '';
  
  constructor(
    private documentoService: DocumentoTramiteService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.cargarDocumentos();
  }
  
  cargarDocumentos(): void {
    this.cargando = true;
    this.error = null;
    
    this.documentoService.getDocumentosPendientes().subscribe({
      next: (docs: DocumentoTramite[]) => {
        this.documentos = docs;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Error al cargar documentos pendientes de revisión';
        this.cargando = false;
        console.error(err);
      }
    });
  }
  
  /** Aprobar documento */
  aprobarDocumento(id: number): void {
    this.documentoService.aprobarDocumento(id).subscribe({
      next: () => this.cargarDocumentos(),
      error: (err: HttpErrorResponse) => console.error('Error aprobando documento', err)
    });
  }
  
  /** Rechazar documento */
  rechazarDocumento(id: number): void {
    this.documentoService.rechazarDocumento(id).subscribe({
      next: () => this.cargarDocumentos(),
      error: (err: HttpErrorResponse) => console.error('Error rechazando documento', err)
    });
  }
  
  /** Ir al detalle del documento */
  verDetalle(id: number): void {
    this.router.navigate(['/tramites/detalle', id]);
  }
  
  /** Formatear estado para mostrar */
  formatearEstado(estado: string): string {
    const estados: Record<string, string> = {
      'PENDIENTE': 'Pendiente',
      'EN_REVISION': 'En Revisión',
      'RECHAZADO': 'Rechazado',
      'APROBADO': 'Aprobado'
    };
    return estados[estado] || estado;
  }
  
  /** Obtener clase CSS según estado */
  getColorEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
      case 'EN_REVISION':
        return 'bg-yellow-100 text-yellow-800';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800';
      case 'APROBADO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100';
    }
  }
  
  /** Limpiar filtros */
  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.cargarDocumentos();
  }
}