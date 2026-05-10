import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-instancias-disponibles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-instancias-disponibles.component.html',
  styleUrls: ['./modal-instancias-disponibles.component.scss']
})
export class ModalInstanciasDisponiblesComponent {
  @Input() mostrando: boolean = false;
  @Input() instancias: any[] = [];
  @Input() inspeccionId: number | undefined;
  @Input() cargando: boolean = false;
  
  @Output() cerrar = new EventEmitter<void>();
  @Output() instanciaAgregada = new EventEmitter<number>(); // emits instance id
  
  getBadgeClass(estado: string | undefined): string {
    if (!estado) return 'secondary';
    switch (estado.toUpperCase()) {
      case 'PENDIENTE': return 'info';
      case 'EN_REVISION': return 'warning';
      case 'APROBADO': return 'success';
      case 'OBSERVADO': return 'warning';
      case 'CERRADO': return 'secondary';
      case 'INSPECCIONADO': return 'success';
      default: return 'secondary';
    }
  }
  
  agregarInstancia(instancia: any): void {
    this.instanciaAgregada.emit(instancia.idInstancia);
  }
}
