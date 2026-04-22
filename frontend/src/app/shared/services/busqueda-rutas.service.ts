import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RutaService } from '../../modules/empresas/services/ruta.service';
import { PuntoGeograficoService } from '../../modules/empresas/services/punto-geografico.service';
import { EmpresaService } from '../../modules/empresas/services/empresa.service';
import { 
  Ubicacion, 
  ResultadoBusquedaRuta, 
  RutaCompleta,
  PuntoGeograficoRuta
} from '../models/busqueda-rutas.model';

@Injectable({
  providedIn: 'root'
})
export class BusquedaRutasService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private rutaService: RutaService,
    private puntoGeograficoService: PuntoGeograficoService,
    private empresaService: EmpresaService
  ) {}

  /**
   * Busca rutas cercanas a una ubicación específica
   */
  buscarRutasCercanas(
    ubicacion: Ubicacion,
    radioKm: number = 5
  ): Observable<ResultadoBusquedaRuta[]> {
    return this.puntoGeograficoService
      .getByCoordenadas(ubicacion.latitud, ubicacion.longitud, radioKm)
      .pipe(
        switchMap((puntos) => {
          // Extraer rutas únicas de los puntos
          const rutasIds = [...new Set(puntos.map((p) => p.rutaId).filter(Boolean))];
          
          if (rutasIds.length === 0) {
            return of([]);
          }

          // Obtener detalles de cada ruta
          const rutasRequests = rutasIds.map((id) =>
            this.rutaService.getById(id as number)
          );

          return forkJoin(rutasRequests).pipe(
            map((rutas) => {
              // Calcular distancia y score para cada ruta
              return rutas
                .filter(r => r && r.id)
                .map((ruta) => this.calcularResultadoRuta(ruta, ubicacion))
                .sort((a, b) => b.scoreRelevancia - a.scoreRelevancia);
            })
          );
        })
      );
  }

  /**
   * Encuentra la mejor empresa basada en partida y destino
   */
  encontrarMejoresEmpresas(
    partida: Ubicacion,
    destino: Ubicacion,
    radioKm: number = 3
  ): Observable<ResultadoBusquedaRuta[]> {
    return forkJoin([
      this.buscarRutasCercanas(partida, radioKm),
      this.buscarRutasCercanas(destino, radioKm)
    ]).pipe(
      map(([rutasPartida, rutasDestino]) => {
        // Crear set de IDs de rutas cercanas a ambos puntos
        const idsPartida = new Set(rutasPartida.map((r) => r.rutaId));
        const idsDestino = new Set(rutasDestino.map((r) => r.rutaId));

        // Encontrar rutas que pasan cerca de ambos puntos
        const rutasCercanasAAmbos = [...idsPartida].filter((id) =>
          idsDestino.has(id)
        );

        // Combinar todos los resultados
        const todosResultados = [...rutasPartida, ...rutasDestino];
        const resultadosMap = new Map<number, ResultadoBusquedaRuta>();

        todosResultados.forEach((r) => {
          if (!resultadosMap.has(r.rutaId)) {
            // Calcular score combinado
            const scoreCombinado = this.calcularScoreCombinado(r, partida, destino);
            resultadosMap.set(r.rutaId, {
              ...r,
              scoreRelevancia: scoreCombinado
            });
          }
        });

        // Ordenar por score de relevancia
        return Array.from(resultadosMap.values())
          .sort((a, b) => b.scoreRelevancia - a.scoreRelevancia);
      })
    );
  }

  /**
   * Obtiene una ruta completa con todos sus puntos geográficos
   */
  obtenerRutaCompleta(rutaId: number): Observable<RutaCompleta | null> {
    return this.rutaService.getById(rutaId).pipe(
      switchMap((ruta) => {
        if (!ruta) {
          return of(null);
        }

        // Obtener puntos geográficos de la ruta
        return this.puntoGeograficoService.getByRuta(rutaId).pipe(
          map((puntos) => {
            const puntosMapeados: PuntoGeograficoRuta[] = puntos.map((p) => ({
              latitud: p.latitud,
              longitud: p.longitud,
              nombre: p.nombreReferencia,
              orden: p.orden || 0,
              tipo: p.tipo
            }));

            return {
              id: ruta.id,
              empresaId: ruta.empresaId,
              nombreRuta: ruta.nombreRuta,
              codigoRuta: ruta.codigoRuta,
              tipoRuta: ruta.tipoRuta,
              colorRuta: ruta.colorRuta,
              puntosGeograficos: puntosMapeados,
              empresa: ruta.empresa ? {
                id: ruta.empresa.id,
                nombre: ruta.empresa.razonSocial || '',
                ruc: '',
                estadoOperativo: 'habilitada'
              } : undefined
            };
          })
        );
      })
    );
  }

  /**
   * Calcula la distancia entre dos puntos usando fórmula de Haversine
   */
  calcularDistanciaHaversine(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Calcula el resultado para una ruta específica
   */
  private calcularResultadoRuta(ruta: any, ubicacion: Ubicacion): ResultadoBusquedaRuta {
    let distanciaMinima = Infinity;

    // Calcular distancia mínima a cualquier punto de la ruta
    if (ruta.puntosGeograficos && ruta.puntosGeograficos.length > 0) {
      ruta.puntosGeograficos.forEach((p: any) => {
        const distancia = this.calcularDistanciaHaversine(
          ubicacion.latitud,
          ubicacion.longitud,
          p.latitud,
          p.longitud
        );
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
        }
      });
    } else {
      distanciaMinima = 0;
    }

    // Calcular score de relevancia (inversamente proporcional a la distancia)
    const scoreRelevancia = Math.max(0, 100 - distanciaMinima * 10);

    return {
      rutaId: ruta.id,
      nombreRuta: ruta.nombreRuta,
      codigoRuta: ruta.codigoRuta,
      empresaId: ruta.empresaId,
      nombreEmpresa: ruta.empresa?.razonSocial || 'Empresa no disponible',
      distanciaDesdePartida: distanciaMinima,
      distanciaAlDestino: 0,
      puntosGeograficos: ruta.puntosGeograficos || [],
      scoreRelevancia
    };
  }

  /**
   * Calcula el score combinado para partida y destino
   */
  private calcularScoreCombinado(
    resultado: ResultadoBusquedaRuta,
    partida: Ubicacion,
    destino: Ubicacion
  ): number {
    // Score basado en proximidad a ambos puntos
    const scorePartida = Math.max(0, 50 - resultado.distanciaDesdePartida * 5);
    const scoreDestino = Math.max(0, 50 - resultado.distanciaAlDestino * 5);
    
    return scorePartida + scoreDestino;
  }

  /**
   * Obtiene el centroide de una lista de puntos
   */
  obtenerCentroide(puntos: Ubicacion[]): Ubicacion {
    if (puntos.length === 0) {
      return { latitud: 0, longitud: 0 };
    }

    const sumLat = puntos.reduce((sum, p) => sum + p.latitud, 0);
    const sumLon = puntos.reduce((sum, p) => sum + p.longitud, 0);

    return {
      latitud: sumLat / puntos.length,
      longitud: sumLon / puntos.length
    };
  }
}
