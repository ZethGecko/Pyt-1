package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // No es necesario guardar explícitamente los puntos; el cascade se encarga.
        // La ruta devuelta ya contiene los puntos en su colección.

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
}