import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/ui/icon.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-canvas-inspeccion',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, FormsModule],
  templateUrl: './canvas-inspeccion.component.html',
  styleUrls: ['./canvas-inspeccion.component.scss']
})
export class CanvasInspeccionComponent implements OnInit {
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
    this.inicializarDatos();
  }

  private inicializarDatos(): void {
    // Inicializar arrays para la tabla de certificación agrícola
    this.datosCertificado = {
      numEmpresa: '',
      nombreRepresentante: '',
      telefono: '',
      direccion: '',
      localizacion: '',
      agricolaNombres: ['', '', ''],
      agricolaApellidos: ['', '', ''],
      carreoVial: '',
      carreteraAcceso: '',
      senalizacionObra: '',
      numPlaca: '',
      modeloPlaca: '',
      anioPlaca: '',
      seguridadPropiedad: '',
      securityVision: '',
      procedimientosSeguridad: '',
      primerosAuxiliosSeguridad: '',
      extintoresSeguridad: '',
      seguroAccidentes: '',
      primerosAuxiliosLunca: '',
      extintoresLunca: '',
      accidentesLunca: '',
      carreteraAccesoLunca: '',
      carreoVialLunca: '',
      senalizacionObraLunca: '',
      aplicabilidadMundialPlaza: '',
      seleccionEmergencia: '',
      aMundialPlaza: '',
      circulacionViariaVientos: '',
      seleccionPuntoContacto: '',
      aplicabilidadPlanta: '',
      fechaPrograma: '',
      cartaInduccion: '',
      implementacionMantenimiento: '',
      construccionCiudad: '',
      estructuraPlaza: '',
      componenteSeguridad: ''
    };
  }

  volverAtras(): void {
    this.router.navigate(['/inspecciones']);
  }

  guardarCertificado(): void {
    // Aquí se implementaría la lógica de guardado
    console.log('Datos del certificado:', this.datosCertificado);
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
      this.inicializarDatos();
    }
  }
}
