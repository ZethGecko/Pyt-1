package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.BusquedaRutaRequestDTO;
import com.example.demo.dto.PuntoCoordenadaDTO;
import com.example.demo.dto.RutaBusquedaResultadoDTO;
import com.example.demo.model.Empresa;
import com.example.demo.model.PuntoRuta;
import com.example.demo.model.Ruta;
import com.example.demo.model.Users;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.PuntoRutaRepository;
import com.example.demo.repository.RutaRepository;

 @Service
 public class RutaService {

     public static class RoutePreview {
         private String name;
         private String description;
         private List<Point> points;

         public RoutePreview(String name, String description, List<Point> points) {
             this.name = name;
             this.description = description;
             this.points = points;
         }

         public String getName() { return name; }
         public String getDescription() { return description; }
         public List<Point> getPoints() { return points; }
     }

     public static class Point {
         private double lat;
         private double lng;

         public Point(double lat, double lng) {
             this.lat = lat;
             this.lng = lng;
         }

         public double getLat() { return lat; }
         public double getLng() { return lng; }
     }

     /**
      * Clase interna para llevar métricas durante la búsqueda de rutas.
      */
     private static class ResultadoCalculado {
         Ruta ruta;
         List<PuntoCoordenadaDTO> tramo;
         double distancia;
         int idxOrigen, idxDestino, meetIdx;
         double cobertura; // max(dOrigen_meet, dDestino_meet) en km, solo para OPTIMO
         boolean esOptimo;

         ResultadoCalculado(Ruta ruta, List<PuntoCoordenadaDTO> tramo, double distancia,
                            int idxOrigen, int idxDestino, int meetIdx, double cobertura, boolean esOptimo) {
             this.ruta = ruta;
             this.tramo = tramo;
             this.distancia = distancia;
             this.idxOrigen = idxOrigen;
             this.idxDestino = idxDestino;
             this.meetIdx = meetIdx;
             this.cobertura = cobertura;
             this.esOptimo = esOptimo;
         }
     }

     private final RutaRepository repo;
    private final PuntoRutaRepository puntoRutaRepository;
    private final EmpresaRepository empresaRepository;

    public RutaService(RutaRepository repo, PuntoRutaRepository puntoRutaRepository, EmpresaRepository empresaRepository) {
        this.repo = repo;
        this.puntoRutaRepository = puntoRutaRepository;
        this.empresaRepository = empresaRepository;
    }

    public List<Ruta> listarTodos() {
        return repo.findAllWithPuntosRuta();
    }

    public org.springframework.data.domain.Page<Ruta> listarTodosPaginado(org.springframework.data.domain.Pageable pageable) {
        return repo.findAllWithPuntosRuta(pageable);
    }

    public org.springframework.data.domain.Page<Ruta> buscarPaginado(String termino, org.springframework.data.domain.Pageable pageable) {
        return repo.buscarPorTerminoPaginado(termino, pageable);
    }

    public Optional<Ruta> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public Optional<Ruta> buscarPorIdConPuntosRuta(Long id) {
        return repo.findByIdWithPuntosRuta(id);
    }

    public Optional<Ruta> buscarPorCodigo(String codigo) {
        return repo.findByCodigo(codigo);
    }

    public List<Ruta> listarActivos() {
        return repo.findAllActivos();
    }

    public List<Ruta> buscarPorTermino(String termino) {
        return repo.buscarPorTermino(termino);
    }

    public List<Ruta> listarPorEmpresa(Long empresaId) {
        return repo.findByEmpresaIdEmpresa(empresaId);
    }

    public List<Ruta> listarPorTipo(String tipo) {
        return repo.findByTipo(tipo);
    }

    public List<Ruta> listarPorGerente(Long gerenteId) {
        return repo.findByGerenteResponsableIdGerente(gerenteId);
    }

    // Genera un código único de hasta 20 caracteres: RUTA-<timestamp 9 dígitos>-<random 5 dígitos>
    private String generarCodigoUnico() {
        long timestampSec = System.currentTimeMillis() / 1000;
        int random = ThreadLocalRandom.current().nextInt(10000, 100000); // 5 dígitos
        long timestampCorto = timestampSec % 1000000000L; // últimos 9 dígitos
        return "RUTA-" + timestampCorto + "-" + random;
    }

    @Transactional
    public Ruta guardar(Ruta ruta) {
        if (ruta.getFechaRegistro() == null) {
            ruta.setFechaRegistro(LocalDateTime.now());
        }
        ruta.setFechaActualizacion(LocalDateTime.now());

        // Generar código automáticamente si no se proporciona
        if (ruta.getCodigo() == null || ruta.getCodigo().trim().isEmpty()) {
            ruta.setCodigo(generarCodigoUnico());
        }

        // Preparar los puntos de ruta antes de guardar (para que cascade los persista con todos los campos obligatorios)
        List<PuntoRuta> puntos = ruta.getPuntosRuta();
        if (puntos != null && !puntos.isEmpty()) {
            for (int i = 0; i < puntos.size(); i++) {
                PuntoRuta punto = puntos.get(i);
                // Establecer la relación bidireccional (owning side)
                punto.setRuta(ruta);
                // Asignar nombre por defecto si está vacío
                if (punto.getNombre() == null || punto.getNombre().trim().isEmpty()) {
                    punto.setNombre("Punto " + (i + 1));
                }
                // Asignar estado por defecto si es null
                if (punto.getEstado() == null) {
                    punto.setEstado("ACTIVO");
                }
                // Asignar fecha de registro si es null (NOT NULL constraint)
                if (punto.getFechaRegistro() == null) {
                    punto.setFechaRegistro(LocalDateTime.now());
                }
                // Asignar fecha de actualización
                punto.setFechaActualizacion(LocalDateTime.now());
                // Asignar el usuario registra (NOT NULL) desde la ruta
                if (ruta.getUsuarioRegistra() != null) {
                    punto.setUsuarioRegistra(ruta.getUsuarioRegistra());
                }
            }
        }

        // Guardar la ruta (cascade persistirá los puntos con los campos ya configurados)
        Ruta savedRuta = repo.save(ruta);

        return savedRuta;
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public boolean existePorCodigo(String codigo, Long idExcluir) {
        Optional<Ruta> ruta = repo.findByCodigo(codigo);
        return ruta.isPresent() && !ruta.get().getIdRuta().equals(idExcluir);
    }

    public Long contarPorEmpresa(Long empresaId) {
        return repo.countByEmpresaId(empresaId);
    }

    public long countTotal() {
        return repo.count();
    }

    public long countActivos() {
        return repo.countByEstado("ACTIVO");
    }

    public long countAsignadas() {
        return repo.countByEmpresaIsNotNull();
    }

    public long countSinAsignar() {
        return repo.countByEmpresaIsNull();
    }

    public Ruta crearDesdeKml(String kmlContent, int routeIndex, String nombre, String descripcion, Long empresaId, Users usuarioRegistra) {
        List<RoutePreview> routes = parseKmlToRoutes(kmlContent);
        if (routeIndex < 0 || routeIndex >= routes.size()) {
            throw new IllegalArgumentException("Invalid route index");
        }
        RoutePreview selectedRoute = routes.get(routeIndex);

        Ruta ruta = new Ruta();
        ruta.setNombre(nombre.isEmpty() ? selectedRoute.getName() : nombre);
        ruta.setDescripcion(descripcion.isEmpty() ? selectedRoute.getDescription() : descripcion);
        ruta.setKmlContent(kmlContent);
        ruta.setEstado("ACTIVO");
        ruta.setTipo("IMPORTADA");
        ruta.setFechaRegistro(LocalDateTime.now());
        ruta.setFechaActualizacion(LocalDateTime.now());
        ruta.setUsuarioRegistra(usuarioRegistra);
        ruta.setCodigo(generarCodigoUnico());

        if (empresaId != null) {
            Empresa empresa = empresaRepository.findById(empresaId.intValue()).orElse(null);
            if (empresa != null) {
                ruta.setEmpresa(empresa);
            }
        }

        ruta = repo.save(ruta);

        List<PuntoRuta> puntos = new ArrayList<>();
        for (int i = 0; i < selectedRoute.getPoints().size(); i++) {
            Point point = selectedRoute.getPoints().get(i);
            PuntoRuta punt = new PuntoRuta();
            punt.setNombre("Punto " + (i + 1));
            punt.setLatitud(point.getLat());
            punt.setLongitud(point.getLng());
            punt.setOrden(i + 1);
            punt.setTipo("PARADA");
            punt.setEstado("ACTIVO");
            punt.setRuta(ruta);
            punt.setFechaRegistro(LocalDateTime.now());
            punt.setFechaActualizacion(LocalDateTime.now());
            punt.setUsuarioRegistra(usuarioRegistra);
            puntos.add(punt);
        }
        puntoRutaRepository.saveAll(puntos);

        return ruta;
    }

    public Ruta guardarDesdeKml(String kmlContent, int routeIndex, String nombre, String descripcion, Long empresaId, Users usuarioRegistra) {
        List<RoutePreview> routes = parseKmlToRoutes(kmlContent);
        if (routeIndex < 0 || routeIndex >= routes.size()) {
            throw new IllegalArgumentException("Invalid route index");
        }
        RoutePreview selectedRoute = routes.get(routeIndex);

        Ruta ruta = new Ruta();
        ruta.setNombre(nombre.isEmpty() ? selectedRoute.getName() : nombre);
        ruta.setDescripcion(descripcion.isEmpty() ? selectedRoute.getDescription() : descripcion);
        ruta.setKmlContent(kmlContent);
        ruta.setEstado("ACTIVO");
        ruta.setTipo("IMPORTADA");
        ruta.setFechaRegistro(LocalDateTime.now());
        ruta.setFechaActualizacion(LocalDateTime.now());
        ruta.setUsuarioRegistra(usuarioRegistra);
        ruta.setCodigo(generarCodigoUnico());

        if (empresaId != null) {
            Empresa empresa = empresaRepository.findById(empresaId.intValue()).orElse(null);
            if (empresa != null) {
                ruta.setEmpresa(empresa);
            }
        }

        return repo.save(ruta);
    }

    public List<RoutePreview> parseKmlToRoutes(String kmlContent) {
        List<RoutePreview> routes = new ArrayList<>();

        try {
            // Enfoque basado en texto para evitar problemas de namespace
            String[] placemarks = kmlContent.split("<Placemark");
            for (int i = 1; i < placemarks.length; i++) {
                String placemark = placemarks[i];

                // Extraer nombre
                String name = "Ruta " + i;
                int nameStart = placemark.indexOf("<name>");
                if (nameStart >= 0) {
                    int nameEnd = placemark.indexOf("</name>", nameStart);
                    if (nameEnd > nameStart) {
                        name = placemark.substring(nameStart + 6, nameEnd).trim();
                        if (name.isEmpty()) name = "Ruta " + i;
                    }
                }

                // Extraer descripción
                String description = "";
                int descStart = placemark.indexOf("<description>");
                if (descStart >= 0) {
                    int descEnd = placemark.indexOf("</description>", descStart);
                    if (descEnd > descStart) {
                        description = placemark.substring(descStart + 13, descEnd).trim();
                    }
                }

                // Extraer coordenadas de cualquier elemento (LineString, Polygon, etc.)
                List<Point> points = new ArrayList<>();
                int coordsStart = placemark.indexOf("<coordinates>");
                if (coordsStart >= 0) {
                    int coordsEnd = placemark.indexOf("</coordinates>", coordsStart);
                    if (coordsEnd > coordsStart) {
                        String coordsText = placemark.substring(coordsStart + 13, coordsEnd).trim();
                        // Dividir por espacios (incluye newlines, tabs)
                        String[] tokens = coordsText.split("\\s+");
                        for (String token : tokens) {
                            if (token.isEmpty()) continue;
                            String[] parts = token.split(",");
                            if (parts.length >= 2) {
                                try {
                                    double lng = Double.parseDouble(parts[0].trim());
                                    double lat = Double.parseDouble(parts[1].trim());
                                    if (!Double.isNaN(lat) && !Double.isNaN(lng)) {
                                        points.add(new Point(lat, lng));
                                    }
                                } catch (NumberFormatException e) {
                                    // Ignorar coordenadas inválidas
                                }
                            }
                        }
                    }
                }

                if (points.size() > 1) {
                    routes.add(new RoutePreview(name, description, points));
                    System.out.println("Added route: " + name + " with " + points.size() + " points");
                } else if (points.size() == 1) {
                    // Si solo hay un punto, lo agregamos igual (ruta puede ser un solo punto)
                    routes.add(new RoutePreview(name, description, points));
                    System.out.println("Added route: " + name + " with " + points.size() + " point (single)");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error parsing KML: " + e.getMessage());
        }

        System.out.println("Total routes parsed: " + routes.size());
        return routes;
    }

    // ========== BÚSQUEDA DE MEJOR RUTA ==========

    /**
     * Busca las mejores rutas que conectan un origen y destino.
     * Calcula la distancia total del viaje incluyendo los accesos desde/hasta
     * los puntos de la ruta más cercanos al origen y destino.
     * Devuelve rutas ordenadas por distancia total ascendentemente.
     *
     * @param request origen y destino
     * @return Lista de rutas ordenadas por distancia total calculada.
     */
    public List<RutaBusquedaResultadoDTO> buscarMejorRuta(BusquedaRutaRequestDTO request) {
        double origLat = request.getOrigenLatitud();
        double origLng = request.getOrigenLongitud();
        double destLat = request.getDestinoLatitud();
        double destLng = request.getDestinoLongitud();

        final double UMBRAL_PROXIMIDAD_KM = 50.0;   // punto más cercano debe estar a <50 km
        final double UMBRAL_COBERTURA_KM = 25.0;    // punto de encuentro debe estar a <25 km de ambos
        final double MAX_DISTANCIA_TOTAL_KM = 500.0; // descartar rutas con más de 500 km
        final int MAX_RESULTADOS = 10;

        List<Ruta> rutas = repo.findAllActivosConPuntosRuta();
        List<ResultadoCalculado> resultados = new ArrayList<>();

        for (Ruta ruta : rutas) {
            List<PuntoRuta> puntos = ruta.getPuntosRuta();
            if (puntos == null || puntos.size() < 2) continue;

            int n = puntos.size();

            // 1) Calcular distancias acumuladas a lo largo de la ruta
            double[] cumulativeDist = new double[n];
            cumulativeDist[0] = 0.0;
            for (int i = 1; i < n; i++) {
                PuntoRuta prev = puntos.get(i-1);
                PuntoRuta curr = puntos.get(i);
                cumulativeDist[i] = cumulativeDist[i-1] + haversine(prev.getLatitud(), prev.getLongitud(), curr.getLatitud(), curr.getLongitud());
            }

            // 2) Encontrar los puntos más cercanos a origen y destino
            int idxOrigen = -1, idxDestino = -1;
            double minOrigen = Double.MAX_VALUE, minDestino = Double.MAX_VALUE;
            for (int i = 0; i < n; i++) {
                PuntoRuta p = puntos.get(i);
                double dOrigen = haversine(origLat, origLng, p.getLatitud(), p.getLongitud());
                double dDestino = haversine(destLat, destLng, p.getLatitud(), p.getLongitud());
                if (dOrigen < minOrigen) { minOrigen = dOrigen; idxOrigen = i; }
                if (dDestino < minDestino) { minDestino = dDestino; idxDestino = i; }
            }

            // Filtro de proximidad: ambos puntos deben estar dentro del umbral
            if (minOrigen > UMBRAL_PROXIMIDAD_KM || minDestino > UMBRAL_PROXIMIDAD_KM) continue;
            if (idxOrigen == idxDestino) continue;

            // 3) Calcular distancias a lo largo de la ruta entre idxOrigen e idxDestino
            double distanciaRuta = Math.abs(cumulativeDist[idxDestino] - cumulativeDist[idxOrigen]);

            // 4) Calcular distancia total del viaje:
            //    origen → punto_origen + distancia_ruta + punto_destino → destino
            PuntoRuta puntoOrigen = puntos.get(idxOrigen);
            PuntoRuta puntoDestino = puntos.get(idxDestino);
            double distOrigenAPunto = haversine(origLat, origLng, puntoOrigen.getLatitud(), puntoOrigen.getLongitud());
            double distPuntoADestino = haversine(puntoDestino.getLatitud(), puntoDestino.getLongitud(), destLat, destLng);
            double distanciaTotal = distOrigenAPunto + distanciaRuta + distPuntoADestino;

            // Descartar si la distancia total excede el máximo
            if (distanciaTotal > MAX_DISTANCIA_TOTAL_KM) continue;

            // 5) Construir el tramo completo de la ruta (puntos que se recorren en la ruta)
            List<PuntoCoordenadaDTO> tramo = new ArrayList<>();
            int start = Math.min(idxOrigen, idxDestino);
            int end = Math.max(idxOrigen, idxDestino);
            for (int i = start; i <= end; i++) {
                PuntoRuta p = puntos.get(i);
                tramo.add(new PuntoCoordenadaDTO(p.getLatitud(), p.getLongitud()));
            }

            // Si idxOrigen > idxDestino, invertir para que el tramo vaya de origen a destino
            if (idxOrigen > idxDestino) {
                Collections.reverse(tramo);
            }

            // 6) Calcular cobertura (máxima distancia desde origen/destino a sus puntos en la ruta)
            double cobertura = Math.max(distOrigenAPunto, distPuntoADestino);

            // 7) Determinar si es óptimo (ambos puntos dentro del umbral de cobertura)
            boolean esOptimo = (distOrigenAPunto <= UMBRAL_COBERTURA_KM && distPuntoADestino <= UMBRAL_COBERTURA_KM);

            resultados.add(new ResultadoCalculado(ruta, tramo, distanciaTotal, idxOrigen, idxDestino, -1, cobertura, esOptimo));
        }

        // Ordenar por distancia total ascendente, luego por número de puntos
        Comparator<ResultadoCalculado> comparator = Comparator
                .comparingDouble((ResultadoCalculado rc) -> rc.distancia)
                .thenComparingInt(rc -> rc.tramo != null ? rc.tramo.size() : 0);

        resultados.sort(comparator);

        // Tomar los mejores resultados
        int limit = Math.min(MAX_RESULTADOS, resultados.size());
        List<ResultadoCalculado> resultadosSeleccionados = resultados.subList(0, limit);

        // Convertir a DTOs
        List<RutaBusquedaResultadoDTO> dtos = new ArrayList<>();
        for (ResultadoCalculado rc : resultadosSeleccionados) {
            Ruta ruta = rc.ruta;
            RutaBusquedaResultadoDTO dto = new RutaBusquedaResultadoDTO();
            dto.setIdRuta(ruta.getIdRuta());
            dto.setCodigo(ruta.getCodigo());
            dto.setNombre(ruta.getNombre());
            dto.setDescripcion(ruta.getDescripcion());
            dto.setDistanciaCalculada(rc.distancia);
            dto.setTiempoEstimadoMinutos(ruta.getTiempoEstimadoMinutos());
            dto.setEstado(ruta.getEstado());
            dto.setTipo(ruta.getTipo());
            if (ruta.getEmpresa() != null) {
                dto.setEmpresaId(ruta.getEmpresa().getIdEmpresa());
                dto.setEmpresaNombre(ruta.getEmpresa().getNombre());
                dto.setEmpresaRuc(ruta.getEmpresa().getRuc());
            }
            dto.setPuntosTramo(rc.tramo);
            dto.setTipoResultado(rc.esOptimo ? "OPTIMO" : "FALLBACK");
            dto.setDistanciaCobertura(rc.cobertura);
            dtos.add(dto);
        }

        return dtos;
    }

    /**
     * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine (en km)
     */
    public double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radio de la Tierra en kilómetros
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
