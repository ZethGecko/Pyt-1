import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as maplibregl from 'maplibre-gl';
import { BusquedaRutasService } from '../../services/busqueda-rutas.service';

export interface RutaBusqueda {
  id: number;
  nombre: string;
  distancia: number;
  duracion: number;
  empresa: {
    id: number;
    nombre: string;
    logo: string;
  };
  puntos: {
    latitud: number;
    longitud: number;
  }[];
}

export interface BusquedaRutasRequest {
  ubicacionActual?: {
    latitud: number;
    longitud: number;
  };
  rutaPartida?: {
    latitud: number;
    longitud: number;
  };
  destino?: {
    latitud: number;
    longitud: number;
  };
}

@Component({
  selector: 'app-busqueda-rutas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './busqueda-rutas.component.html',
  styleUrls: ['./busqueda-rutas.component.scss']
})
export class BusquedaRutasComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  map!: maplibregl.Map;
  isLoading = false;
  error: string | null = null;
  rutas: RutaBusqueda[] = [];
  empresas: any[] = [];
  puntosGeograficos: any[] = [];
  
  // Variables de búsqueda
  busquedaRequest: BusquedaRutasRequest = {};
  sugerenciasUbicacion: any[] = [];
  sugerenciasPartida: any[] = [];
  sugerenciasDestino: any[] = [];
  tipoBusqueda: 'rutaPartida' | 'destino' | null = null;

  // Variables de mapa
  markers: maplibregl.Marker[] = [];
  popup!: maplibregl.Popup;

  constructor(
    private busquedaRutasService: BusquedaRutasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.cargarDatosIniciales();
  }

  private inicializarMapa(): void {
    const mapboxAccessToken = 'pk.eyJ1IjoibXAzcnoiLCJhIjoiY2t1a2R6eTB5MDJ5bjJ2cDZ5eGZ6a2R6byJ9.7X9Z7X9Z7X9Z7X9Z7X9Z';
    
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-3.703790, 40.416775],
      zoom: 13
    });

    this.map.on('load', () => {
      this.agregarControlesMapa();
    });
  }

  private agregarControlesMapa(): void {
    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
    this.map.addControl(new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }), 'top-right');
  }

  private cargarDatosIniciales(): void {
    this.busquedaRutasService.obtenerEmpresas().subscribe({
      next: (data: any[]) => {
        this.empresas = data;
        this.cdr.detectChanges();
      }
    });

    this.busquedaRutasService.obtenerPuntosGeograficos().subscribe({
      next: (data: any[]) => {
        this.puntosGeograficos = data;
        this.cdr.detectChanges();
      }
    });
  }

  buscarRutas(): void {
    if (!this.validarBusqueda()) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.busquedaRutasService.buscarRutas(this.busquedaRequest).subscribe({
      next: (rutas: RutaBusqueda[]) => {
        this.rutas = rutas;
        this.isLoading = false;
        this.actualizarMapaConRutas(rutas);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Error al buscar rutas. Inténtelo de nuevo.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private validarBusqueda(): boolean {
    if (!this.busquedaRequest.ubicacionActual && 
        !this.busquedaRequest.rutaPartida && 
        !this.busquedaRequest.destino) {
      this.error = 'Debe proporcionar al menos una ubicación actual, ruta de partida o destino';
      return false;
    }
    return true;
  }

  private actualizarMapaConRutas(rutas: RutaBusqueda[]): void {
    this.limpiarMapa();
    
    rutas.forEach((ruta) => {
      this.dibujarRutaEnMapa(ruta);
    });
  }

  private limpiarMapa(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  }

  private dibujarRutaEnMapa(ruta: RutaBusqueda): void {
    const puntos = ruta.puntos;
    
    if (puntos.length < 2) return;

    const lineLayout = {
      'line-cap': 'round' as const,
      'line-join': 'round' as const
    };

    const linePaint = {
      'line-color': '#3b82f6' as const,
      'line-width': 3 as const,
      'line-opacity': 0.8 as const
    };

    const lineString = {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: puntos.map(punto => [punto.longitud, punto.latitud])
      },
      properties: {}
    };

    this.map.addSource(`route-${ruta.id}`, {
      type: 'geojson' as const,
      data: lineString
    });

    this.map.addLayer({
      id: `route-layer-${ruta.id}`,
      type: 'line' as const,
      source: `route-${ruta.id}`,
      layout: lineLayout,
      paint: linePaint
    });

    const markerInicio = new maplibregl.Marker({
      color: '#10b981'
    })
    .setLngLat([puntos[0].longitud, puntos[0].latitud] as maplibregl.LngLatLike)
    .addTo(this.map);

    this.markers.push(markerInicio);

    const markerFin = new maplibregl.Marker({
      color: '#ef4444'
    })
    .setLngLat([puntos[puntos.length - 1].longitud, puntos[puntos.length - 1].latitud] as maplibregl.LngLatLike)
    .addTo(this.map);

    this.markers.push(markerFin);

    const popupContent = `
      <div style="background: white; padding: 10px; border-radius: 5px; width: 200px;">
        <h4 style="margin: 0 0 10px 0; color: #1f2937;">${ruta.nombre}</h4>
        <p style="margin: 5px 0; color: #6b7280;">
          <strong>Distancia:</strong> ${ruta.distancia.toFixed(2)} km<br>
          <strong>Duración:</strong> ${ruta.duracion.toFixed(2)} min<br>
          <strong>Empresa:</strong> ${ruta.empresa.nombre}
        </p>
      </div>
    `;

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false
    })
    .setHTML(popupContent)
    .setMaxWidth('none');

    markerInicio.setPopup(popup);
  }

  usarUbicacionActual(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.busquedaRequest.ubicacionActual = {
            latitud: position.coords.latitude,
            longitud: position.coords.longitude
          };
          this.error = null;
          this.cdr.detectChanges();
        },
        (error) => {
          this.error = 'No se pudo obtener la ubicación actual';
          this.cdr.detectChanges();
        }
      );
    } else {
      this.error = 'La geolocalización no está disponible en este navegador';
    }
  }

  seleccionarPuntoGeografico(punto: any, tipo: 'ubicacionActual' | 'rutaPartida' | 'destino'): void {
    if (tipo === 'ubicacionActual') {
      this.busquedaRequest.ubicacionActual = {
        latitud: punto.latitud,
        longitud: punto.longitud
      };
    } else if (tipo === 'rutaPartida') {
      this.busquedaRequest.rutaPartida = {
        latitud: punto.latitud,
        longitud: punto.longitud
      };
    } else {
      this.busquedaRequest.destino = {
        latitud: punto.latitud,
        longitud: punto.longitud
      };
    }
    this.error = null;
    this.cdr.detectChanges();
  }

  limpiarBusqueda(): void {
    this.busquedaRequest = {};
    this.rutas = [];
    this.error = null;
    this.limpiarMapa();
    this.cdr.detectChanges();
  }

  formatearDistancia(distancia: number): string {
    return distancia.toFixed(2) + ' km';
  }

  formatearDuracion(duracion: number): string {
    return duracion.toFixed(2) + ' min';
  }

  abrirModalPuntosGeograficos(tipo: 'rutaPartida' | 'destino'): void {
    this.tipoBusqueda = tipo;
    this.error = null;
    this.cdr.detectChanges();
  }

  mostrarRutaEnMapa(ruta: RutaBusqueda): void {
    this.limpiarMapa();
    this.dibujarRutaEnMapa(ruta);
    this.cdr.detectChanges();
  }

  get ubicacionActualText(): string {
    if (this.busquedaRequest.ubicacionActual) {
      return `${this.busquedaRequest.ubicacionActual.latitud.toFixed(4)}, ${this.busquedaRequest.ubicacionActual.longitud.toFixed(4)}`;
    }
    return '';
  }

  get rutaPartidaText(): string {
    if (this.busquedaRequest.rutaPartida) {
      return `${this.busquedaRequest.rutaPartida.latitud.toFixed(4)}, ${this.busquedaRequest.rutaPartida.longitud.toFixed(4)}`;
    }
    return '';
  }

  get destinoText(): string {
    if (this.busquedaRequest.destino) {
      return `${this.busquedaRequest.destino.latitud.toFixed(4)}, ${this.busquedaRequest.destino.longitud.toFixed(4)}`;
    }
    return '';
  }
}
