package com.example.demo.service;

import com.example.demo.model.PuntoRuta;
import com.example.demo.model.Ruta;
import com.example.demo.model.Empresa;
import com.example.demo.model.Users;
import com.example.demo.repository.RutaRepository;
import com.example.demo.repository.PuntoRutaRepository;
import com.example.demo.repository.EmpresaRepository;
import org.springframework.stereotype.Service;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import java.io.IOException;
import java.io.StringReader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

        // getters
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
        return repo.findAll();
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

    public Ruta guardar(Ruta ruta) {
        if (ruta.getFechaRegistro() == null) {
            ruta.setFechaRegistro(LocalDateTime.now());
        }
        ruta.setFechaActualizacion(LocalDateTime.now());
        return repo.save(ruta);
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
        ruta.setCodigo("RUTA-" + System.currentTimeMillis());

        // Set empresa if provided
        if (empresaId != null) {
            Empresa empresa = empresaRepository.findById(empresaId.intValue()).orElse(null);
            if (empresa != null) {
                ruta.setEmpresa(empresa);
            }
        }

        // Save ruta first to get ID
        ruta = repo.save(ruta);

        // Create points from selected route
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
        ruta.setCodigo("RUTA-" + System.currentTimeMillis());

        // Set empresa if provided
        if (empresaId != null) {
            Empresa empresa = empresaRepository.findById(empresaId.intValue()).orElse(null);
            if (empresa != null) {
                ruta.setEmpresa(empresa);
            }
        }

        // Save ruta (without points)
        return repo.save(ruta);
    }

    public List<RoutePreview> parseKmlToRoutes(String kmlContent) {
        List<RoutePreview> routes = new ArrayList<>();

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(kmlContent)));

            // Get all Placemark elements regardless of namespace
            NodeList placemarkNodes = doc.getElementsByTagNameNS("*", "Placemark");
            System.out.println("Found " + placemarkNodes.getLength() + " Placemark elements");

            for (int i = 0; i < placemarkNodes.getLength(); i++) {
                Element placemark = (Element) placemarkNodes.item(i);

                // Only process placemarks that contain a LineString (actual routes)
                NodeList lineStringList = placemark.getElementsByTagNameNS("*", "LineString");
                if (lineStringList.getLength() == 0) {
                    continue; // Skip points, polygons, etc.
                }
                Element lineString = (Element) lineStringList.item(0);

                // Extract name
                String name = "Ruta " + (i + 1);
                NodeList nameList = placemark.getElementsByTagNameNS("*", "name");
                if (nameList.getLength() > 0) {
                    String rawName = nameList.item(0).getTextContent().trim();
                    if (!rawName.isEmpty()) {
                        name = rawName;
                    }
                }

                // Extract description
                String description = "";
                NodeList descList = placemark.getElementsByTagNameNS("*", "description");
                if (descList.getLength() > 0) {
                    description = descList.item(0).getTextContent().trim();
                }

                // Extract coordinates from LineString via <coordinates> element
                NodeList coordsNodeList = lineString.getElementsByTagNameNS("*", "coordinates");
                List<Point> points = new ArrayList<>();
                if (coordsNodeList.getLength() > 0) {
                    String coordsText = coordsNodeList.item(0).getTextContent().trim();
                    if (!coordsText.isEmpty()) {
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
                                    System.out.println("Skipping invalid coordinate: " + token);
                                }
                            }
                        }
                    }
                }

                if (!points.isEmpty()) {
                    routes.add(new RoutePreview(name, description, points));
                    System.out.println("Added route: " + name + " with " + points.size() + " points");
                }
            }
        } catch (ParserConfigurationException | SAXException | IOException e) {
            e.printStackTrace();
            System.err.println("Error parsing KML XML: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Unexpected error parsing KML: " + e.getMessage());
        }

        System.out.println("Total routes parsed: " + routes.size());
        return routes;
    }

    private List<PuntoRuta> parseKmlPoints(String kmlContent, Ruta ruta) {
        List<PuntoRuta> puntos = new ArrayList<>();

        // Simple parsing for Placemarks with Point coordinates
        String[] placemarks = kmlContent.split("<Placemark>");
        for (int i = 1; i < placemarks.length; i++) {
            String placemark = placemarks[i];

            // Extract name
            String name = "";
            if (placemark.contains("<name>")) {
                name = placemark.substring(placemark.indexOf("<name>") + 6, placemark.indexOf("</name>"));
            }

            // Extract coordinates
            if (placemark.contains("<coordinates>")) {
                String coordsStr = placemark.substring(placemark.indexOf("<coordinates>") + 13, placemark.indexOf("</coordinates>"));
                String[] coords = coordsStr.trim().split(",");
                if (coords.length >= 2) {
                    try {
                        Double lng = Double.parseDouble(coords[0].trim());
                        Double lat = Double.parseDouble(coords[1].trim());

                        PuntoRuta punto = new PuntoRuta();
                        punto.setNombre(name.isEmpty() ? "Punto " + i : name);
                        punto.setLatitud(lat);
                        punto.setLongitud(lng);
                        punto.setOrden(i);
                        punto.setTipo("PARADA");
                        punto.setEstado("ACTIVO");
                        punto.setRuta(ruta);
                        punto.setFechaRegistro(LocalDateTime.now());
                        punto.setFechaActualizacion(LocalDateTime.now());

                        puntos.add(punto);
                    } catch (NumberFormatException e) {
                        // Skip invalid coordinates
                    }
                }
            }
        }

        return puntos;
    }
}