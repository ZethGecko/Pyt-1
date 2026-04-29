import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-realizar-inspeccion',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, FormsModule],
  templateUrl: './realizar-inspeccion.component.html',
  styleUrls: ['./realizar-inspeccion.component.scss']
})
export class RealizarInspeccionComponent implements OnInit {
  inspeccionId: number = 0;
  modoEdicion: boolean = false;
  datosCertificado: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inspeccionId = Number(this.route.snapshot.paramMap.get('id'));
    // El certificado es un diseño estático editable
  }

  volverAtras(): void {
    this.router.navigate(['/inspecciones']);
  }

  guardarCertificado(): void {
    // Aquí se implementaría la lógica de guardado
    alert('Certificado guardado correctamente (simulado)');
  }

  toggleModoEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
  }

  imprimirCertificado(): void {
    window.print();
  }

  limpiarCampos(): void {
    if (confirm('¿Está seguro de limpiar todos los campos del certificado?')) {
      this.datosCertificado = {};
      // Limpiar todos los inputs del formulario
      const inputs = document.querySelectorAll('input[type="text"]');
      inputs.forEach(input => (input as HTMLInputElement).value = '');
    }
  }
}
