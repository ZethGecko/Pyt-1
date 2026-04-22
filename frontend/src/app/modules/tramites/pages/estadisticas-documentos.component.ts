import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentoTramiteService } from '../services/documento-tramite.service';
import { DocumentoTramite } from '../models/documento-tramite.model';

@Component({
  selector: 'app-estadisticas-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estadisticas-documentos.component.html',
  styleUrls: ['./estadisticas-documentos.component.scss']
})
export class EstadisticasDocumentosComponent implements OnInit {
  
  totalDocumentos = 0;
  aprobados = 0;
  enRevision = 0;
  rechazados = 0;
  cargando = false;
  error: string | null = null;
  
  constructor(
    private documentoService: DocumentoTramiteService
  ) {}
  
  ngOnInit(): void {
    this.cargarEstadisticas();
  }
  
  cargarEstadisticas(): void {
    this.cargando = true;
    this.error = null;
    
    // Obtener todos los documentos
    this.documentoService.obtenerDocumentos().subscribe({
      next: (docs: DocumentoTramite[]) => {
        this.totalDocumentos = docs.length;
        this.aprobados = docs.filter(d => d.estado === 'APROBADO').length;
        this.enRevision = docs.filter(d => d.estado === 'EN_REVISION' || d.estado === 'PENDIENTE').length;
        this.rechazados = docs.filter(d => d.estado === 'RECHAZADO').length;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Error al cargar estadísticas';
        this.cargando = false;
        console.error(err);
      }
    });
  }
  
  /** Formatear número con color según estado */
  getColorEstado(conteo: number, estado: string): string {
    const colores = {
      'APROBADO': 'text-green-600',
      'EN_REVISION': 'text-yellow-600',
      'RECHAZADO': 'text-red-600',
      'PENDIENTE': 'text-blue-600'
    };
    // @ts-ignore
    return (colores as any)[estado] + ' font-medium';
  }
}