import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentoTramiteService } from '../services/documento-tramite.service';
import { RequisitoTUPACService } from '../services/requisito-tupac.service';
import { DocumentoTramite } from '../models/documento-tramite.model';
import { RequisitoTUPAC } from '../models/requisito-tupac.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mis-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-documentos.component.html',
  styleUrls: ['./mis-documentos.component.scss']
})
export class MisDocumentosComponent implements OnInit {
  
  documentos: DocumentoTramite[] = [];
  requisitosMap: Map<number, RequisitoTUPAC> = new Map();
  cargando = false;
  error: string | null = null;
  
  // Filtros
  filtroEstado: string = '';
  filtroTipo: string = '';
  tiposDocumento: string[] = [];
  
  constructor(
    private documentoService: DocumentoTramiteService,
    private requisitoService: RequisitoTUPACService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.cargarDocumentos();
    this.cargarTiposDocumento();
  }
  
  cargarDocumentos(): void {
    this.cargando = true;
    this.error = null;
    
    this.documentoService.getMisDocumentos().subscribe({
      next: (docs) => {
        this.documentos = docs;
        this.cargarRequisitosParaDocumentos();
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar documentos asignados';
        this.cargando = false;
        console.error(err);
      }
    });
  }
  
  /** Cargar requisitos para poder filtrar por tipo */
  cargarRequisitosParaDocumentos(): void {
    const requisitoIds = [...new Set(this.documentos.map(doc => doc.requisitoId).filter(id => id != null))];
    
    if (requisitoIds.length === 0) return;
    
    // Cargar todos los requisitos activos para mapear
    this.requisitoService.listarActivos().subscribe({
      next: (requisitos) => {
        requisitos.forEach(req => {
          this.requisitosMap.set(req.id, req);
        });
        // Extraer tipos únicos
        this.tiposDocumento = [...new Set(requisitos.map(r => r.tipoDocumento))].filter(t => t);
      },
      error: (err) => {
        console.error('Error cargando requisitos:', err);
      }
    });
  }
  
  /** Cargar tipos de documento para el filtro */
  cargarTiposDocumento(): void {
    this.requisitoService.obtenerTiposDocumentoUnicos().subscribe({
      next: (tipos) => {
        this.tiposDocumento = tipos;
      },
      error: (err) => {
        console.error('Error cargando tipos de documento:', err);
      }
    });
  }
  
  /** Obtener requisito por ID */
  getRequisitoPorId(id: number): RequisitoTUPAC | undefined {
    return this.requisitosMap.get(id);
  }
  
  /** Documentos filtrados por estado */
  get documentosFiltrados(): DocumentoTramite[] {
    return this.documentos.filter(doc => {
      if (this.filtroEstado && doc.estado !== this.filtroEstado) {
        return false;
      }
      if (this.filtroTipo) {
        const req = this.requisitosMap.get(doc.requisitoId || 0);
        if (!req || req.tipoDocumento !== this.filtroTipo) {
          return false;
        }
      }
      return true;
    });
  }
  
  /** Descargar documento */
  descargarDocumento(documentoId: number): void {
    this.documentoService.download(documentoId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documento-${documentoId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        alert('Error al descargar el documento');
      }
    });
  }
  
  /** Presentar documento (subir archivo) */
  presentarDocumento(documentoId: number): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.documentoService.presentar(documentoId, file).subscribe({
          next: () => {
            alert('Documento presentado exitosamente');
            this.cargarDocumentos();
          },
          error: (err) => {
            alert('Error al presentar el documento');
          }
        });
      }
    };
    fileInput.click();
  }
  
  /** Ver detalle del trámite asociado */
  verDetalleTramite(tramiteId: number): void {
    this.router.navigate(['/tramites', 'detalle', tramiteId]);
  }
  
  /** Obtener color del estado */
  getColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'PRESENTADO': 'bg-blue-100 text-blue-800',
      'APROBADO': 'bg-green-100 text-green-800',
      'RECHAZADO': 'bg-red-100 text-red-800',
      'OBSERVADO': 'bg-orange-100 text-orange-800',
      'EN_REVISION': 'bg-purple-100 text-purple-800'
    };
    return colores[estado.toUpperCase()] || 'bg-gray-100 text-gray-800';
  }
  
  /** Formatear fecha */
  formatearFecha(fecha?: Date | string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  /** Limpiar filtros */
  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroTipo = '';
  }
  
  /** Verificar si documento puede presentarse */
  puedePresentar(documento: DocumentoTramite): boolean {
    return documento.estado === 'PENDIENTE' || documento.estado === 'OBSERVADO';
  }
}
