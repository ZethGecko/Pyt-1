import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { SolicitanteService, Solicitante } from '../services/solicitante.service';

@Component({
  selector: 'app-gestion-solicitantes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  templateUrl: './gestion-solicitantes.component.html',
  styleUrls: ['./gestion-solicitantes.component.scss']
})
export class GestionSolicitantesComponent implements OnInit {
  private solicitanteService = inject(SolicitanteService);

  // Signals
  solicitantes = signal<Solicitante[]>([]);
  loading = signal<boolean>(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  
  // Filters
  filterTipo = signal<string>('todos');
  searchTerm = signal<string>('');

  // Pagination
  currentPage = signal<number>(0);
  pageSize = signal<number>(20);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  ngOnInit(): void {
    this.loadSolicitantes();
  }

  loadSolicitantes(): void {
    this.loading.set(true);
    this.solicitanteService.getSolicitantes(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.solicitantes.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading solicitantes:', err);
        this.loading.set(false);
        // Load demo data
        this.loadDemoData();
      }
    });
  }

  loadDemoData(): void {
    const demo: Solicitante[] = [
      {
        id: 1,
        tipoSolicitante: 'PersonaNatural',
        referencia: 1,
        email: 'juan.perez@email.com',
        telefono: '987654321',
        direccion: 'Av. Principal 123',
        fechaRegistro: new Date().toISOString(),
        activo: true,
        nombre: 'Juan Pérez González',
        identificacion: 'DNI: 12345678'
      },
      {
        id: 2,
        tipoSolicitante: 'Empresa',
        referencia: 1,
        email: 'contacto@empresa.com',
        telefono: '012345678',
        direccion: 'Jr. Commercial 456',
        fechaRegistro: new Date().toISOString(),
        activo: true,
        nombre: 'Empresa de Transporte S.A.C.',
        identificacion: 'RUC: 20123456789'
      },
      {
        id: 3,
        tipoSolicitante: 'Vehiculo',
        referencia: 1,
        email: null,
        telefono: '987654321',
        direccion: null,
        fechaRegistro: new Date().toISOString(),
        activo: false,
        nombre: 'Camión - ABC-123',
        identificacion: 'Placa: ABC-123'
      }
    ];
    this.solicitantes.set(demo);
    this.totalElements.set(demo.length);
  }

  // Filters
  setFilterTipo(tipo: string): void {
    this.filterTipo.set(tipo);
  }

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  clearFilters(): void {
    this.filterTipo.set('todos');
    this.searchTerm.set('');
  }

  get filteredSolicitantes(): Solicitante[] {
    let result = this.solicitantes();
    
    if (this.filterTipo() !== 'todos') {
      result = result.filter(s => s.tipoSolicitante === this.filterTipo());
    }
    
    const term = this.searchTerm().toLowerCase();
    if (term) {
      result = result.filter(s => 
        (s.nombre && s.nombre.toLowerCase().includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term)) ||
        (s.telefono && s.telefono.includes(term)) ||
        (s.identificacion && s.identificacion.toLowerCase().includes(term))
      );
    }
    
    return result;
  }

  // Actions
  activate(solicitante: Solicitante): void {
    this.solicitanteService.activate(solicitante.id).subscribe({
      next: () => {
        this.loadSolicitantes();
        this.success.set('Solicitante activado exitosamente');
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        console.error('Error activating:', err);
        this.error.set('Error al activar solicitante');
      }
    });
  }

  deactivate(solicitante: Solicitante): void {
    this.solicitanteService.deactivate(solicitante.id).subscribe({
      next: () => {
        this.loadSolicitantes();
        this.success.set('Solicitante desactivado exitosamente');
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        console.error('Error deactivating:', err);
        this.error.set('Error al desactivar solicitante');
      }
    });
  }

  delete(solicitante: Solicitante): void {
    if (!confirm(`¿Está seguro de eliminar el solicitante "${solicitante.nombre}"?`)) {
      return;
    }
    
    this.solicitanteService.delete(solicitante.id).subscribe({
      next: () => {
        this.loadSolicitantes();
        this.success.set('Solicitante eliminado exitosamente');
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        console.error('Error deleting:', err);
        this.error.set('Error al eliminar solicitante');
      }
    });
  }

  // Pagination
  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadSolicitantes();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadSolicitantes();
    }
  }

  // Helpers
  getTipoIcon(tipo: string | null): string {
    return this.solicitanteService.getTipoIcon(tipo);
  }

  getTipoLabel(tipo: string | null): string {
    return this.solicitanteService.getTipoLabel(tipo);
  }

  getEstadoClass(activo: boolean | null): string {
    return this.solicitanteService.getEstadoClass(activo);
  }

  getEstadoLabel(activo: boolean | null): string {
    return this.solicitanteService.getEstadoLabel(activo);
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getActivosCount(): number {
    return this.solicitantes()?.filter(s => s.activo).length || 0;
  }

  getInactivosCount(): number {
    return this.solicitantes()?.filter(s => !s.activo).length || 0;
  }
}
