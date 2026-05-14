import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface InspeccionDraft {
  inspeccionId: number;
  parametrosFicha: any[];
  firmaResponsable: string;
  fechaFirma: string;
  resultado: string;
  tituloPrincipal: string;
  subtituloPrincipal: string;
  subtitulo2: string;
  titulosSecciones: { [key: string]: string };
  ultimaModificacion: number;
}

@Injectable({
  providedIn: 'root'
})
export class DraftInspeccionService {
  private readonly DRAFT_PREFIX = 'inspeccion_draft_';

  constructor() {}

  getKey(inspeccionId: number): string {
    return `${this.DRAFT_PREFIX}${inspeccionId}`;
  }

  saveDraft(inspeccionId: number, data: Partial<InspeccionDraft>): void {
    try {
      const draft: InspeccionDraft = {
        inspeccionId,
        parametrosFicha: data.parametrosFicha || [],
        firmaResponsable: data.firmaResponsable || '',
        fechaFirma: data.fechaFirma || '',
        resultado: data.resultado || '',
        tituloPrincipal: data.tituloPrincipal || '',
        subtituloPrincipal: data.subtituloPrincipal || '',
        subtitulo2: data.subtitulo2 || '',
        titulosSecciones: data.titulosSecciones || {},
        ultimaModificacion: Date.now()
      };
      localStorage.setItem(this.getKey(inspeccionId), JSON.stringify(draft));
      console.log('[DraftService] Borrador guardado para inspección', inspeccionId);
    } catch (e) {
      console.error('[DraftService] Error guardando borrador:', e);
    }
  }

  getDraft(inspeccionId: number): InspeccionDraft | null {
    try {
      const key = this.getKey(inspeccionId);
      const data = localStorage.getItem(key);
      if (data) {
        const draft = JSON.parse(data) as InspeccionDraft;
        console.log('[DraftService] Borrador recuperado para inspección', inspeccionId);
        return draft;
      }
    } catch (e) {
      console.error('[DraftService] Error leyendo borrador:', e);
    }
    return null;
  }

  clearDraft(inspeccionId: number): void {
    try {
      localStorage.removeItem(this.getKey(inspeccionId));
      console.log('[DraftService] Borrador eliminado para inspección', inspeccionId);
    } catch (e) {
      console.error('[DraftService] Error eliminando borrador:', e);
    }
  }

  hasDraft(inspeccionId: number): boolean {
    return localStorage.getItem(this.getKey(inspeccionId)) !== null;
  }

  listAllDrafts(): { inspeccionId: number; ultimaModificacion: number }[] {
    const drafts = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.DRAFT_PREFIX)) {
        const inspeccionId = parseInt(key.replace(this.DRAFT_PREFIX, ''), 10);
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          drafts.push({
            inspeccionId,
            ultimaModificacion: data.ultimaModificacion || Date.now()
          });
        } catch (e) {
          // ignore
        }
      }
    }
    return drafts.sort((a, b) => b.ultimaModificacion - a.ultimaModificacion);
  }
}
