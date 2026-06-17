package com.example.demo.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.FichaInspeccionCreateRequestDTO;
import com.example.demo.dto.FichaInspeccionResponseDTO;
import com.example.demo.dto.FichaInspeccionUpdateRequestDTO;
import com.example.demo.dto.ParametroInspeccionDTO;
import com.example.demo.dto.ParametroInspeccionResponseDTO;
 import com.example.demo.model.CampoFormato;
 import com.example.demo.model.FichaInspeccion;
 import com.example.demo.model.FormatoInspeccion;
 import com.example.demo.model.Inspeccion;
 import com.example.demo.model.ValorCampo;
 import com.example.demo.model.Vehiculo;
 import com.example.demo.model.VehiculoApto;
import com.example.demo.repository.CampoFormatoRepository;
import com.example.demo.repository.FichaInspeccionRepository;
import com.example.demo.repository.FormatoInspeccionRepository;
import com.example.demo.repository.InspeccionInstanciaRepository;
import com.example.demo.repository.InspeccionRepository;
import com.example.demo.repository.ValorCampoRepository;
import com.example.demo.repository.VehiculoRepository;

@Service
public class FichaInspeccionService {

    public static final String FORMATO_GLOBAL_NOMBRE = "FORMATO_GLOBAL_REUTILIZABLE";

    private static final float MARGEN_X = 45f;
    private static final float ANCHO_CONTENIDO = 510f;
    private static final float Y_INICIO = 805f;
    private static final Color COLOR_DARK = new Color(30, 41, 59);
    private static final Color COLOR_PRIMARY = new Color(37, 99, 235);
    private static final Color COLOR_SUCCESS = new Color(22, 163, 74);
    private static final Color COLOR_WARNING = new Color(245, 158, 11);
    private static final Color COLOR_DANGER = new Color(220, 38, 38);
    private static final Color COLOR_PANEL = new Color(248, 250, 252);
    private static final Color COLOR_ROW = new Color(241, 245, 249);
    private static final Color COLOR_BORDER = new Color(203, 213, 225);
    private static final Color COLOR_TEXT = new Color(15, 23, 42);
    private static final Color COLOR_MUTED = new Color(100, 116, 139);
    private static final Color COLOR_WHITE = new Color(255, 255, 255);
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final FichaInspeccionRepository fichaRepository;
    private final VehiculoRepository vehiculoRepository;
    private final InspeccionRepository inspeccionRepository;
    private final InspeccionInstanciaRepository inspeccionInstanciaRepository;
    private final FormatoInspeccionRepository formatoRepository;
    private final CampoFormatoRepository campoRepository;
    private final ValorCampoRepository valorRepository;

    public FichaInspeccionService(FichaInspeccionRepository fichaRepository,
                                   VehiculoRepository vehiculoRepository,
                                   InspeccionRepository inspeccionRepository,
                                   InspeccionInstanciaRepository inspeccionInstanciaRepository,
                                   FormatoInspeccionRepository formatoRepository,
                                   CampoFormatoRepository campoRepository,
                                   ValorCampoRepository valorRepository) {
        this.fichaRepository = fichaRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.inspeccionRepository = inspeccionRepository;
        this.inspeccionInstanciaRepository = inspeccionInstanciaRepository;
        this.formatoRepository = formatoRepository;
        this.campoRepository = campoRepository;
        this.valorRepository = valorRepository;
    }

    /**
     * Lista todas las fichas con paginación.
     */
    @Transactional(readOnly = true)
    public Page<FichaInspeccionResponseDTO> listarTodas(Pageable pageable) {
        return fichaRepository.findAllWithAssociations(pageable).map(this::convertToResponseDTO);
    }

    /**
     * @deprecated Usar {@link #listarTodas(Pageable)} en su lugar.
     */
    @Deprecated
    public List<FichaInspeccionResponseDTO> listarTodas() {
        return fichaRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista las fichas asociadas a un trámite
     */
    public List<FichaInspeccionResponseDTO> listarPorTramite(Long tramiteId) {
        return fichaRepository.findByVehiculoApto_Tramite_IdTramite(tramiteId).stream()
                .map(this::convertToDetailDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista las fichas asociadas a una inspección
     */
    public List<FichaInspeccionResponseDTO> listarPorInspeccion(Long inspeccionId) {
        return fichaRepository.findByInspeccion(inspeccionId).stream()
                .map(this::convertToDetailDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public byte[] generarPdfPorInspeccion(Long inspeccionId, String estado) {
        List<FichaInspeccionResponseDTO> fichas = listarPorInspeccion(inspeccionId);
        String estadoFiltro = estado == null || estado.isBlank() || "TODAS".equalsIgnoreCase(estado)
                ? null
                : estado.trim().toUpperCase();
        if (estadoFiltro != null && !List.of("APROBADO", "DESAPROBADO", "OBSERVADO").contains(estadoFiltro)) {
            throw new IllegalArgumentException("Estado inválido. Use TODAS, APROBADO, DESAPROBADO u OBSERVADO");
        }

        List<FichaInspeccionResponseDTO> fichasFiltradas = fichas.stream()
                .filter(ficha -> estadoFiltro == null || estadoFiltro.equals(normalizarResultado(ficha.getResultado())))
                .collect(Collectors.toList());

        Inspeccion inspeccion = inspeccionRepository.findById(inspeccionId).orElse(null);
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PDFont font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDFont bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            float margenX = 45;
            float y = 805;

            for (FichaInspeccionResponseDTO ficha : fichasFiltradas) {
                y = nuevaPagina(document, bold, font, margenX, 805, inspeccion, estadoFiltro);
                y = dibujirFicha(document, font, bold, margenX, y, ficha, inspeccion, estadoFiltro);
            }
            if (fichasFiltradas.isEmpty()) {
                y = nuevaPagina(document, bold, font, margenX, 805, inspeccion, estadoFiltro);
                y = dibujirTexto(document, font, margenX, Math.max(y - 18, 760), 500, 11, "No hay fichas con el filtro seleccionado.", inspeccion, estadoFiltro);
            }
            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo generar el PDF de fichas", e);
        }
    }

    private float nuevaPagina(PDDocument document, PDFont bold, PDFont font, float margenX, float y, Inspeccion inspeccion, String estadoFiltro) throws IOException {
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);
        PDPageContentStream content = new PDPageContentStream(document, page, AppendMode.APPEND, true);

        rellenarRectangulo(content, margenX, 795, ANCHO_CONTENIDO, 82, COLOR_DARK, COLOR_DARK);
        dibujarTextoEnStream(content, bold, 15f, margenX + 12, 770, "FICHA DE INSPECCIÓN VEHICULAR", COLOR_WHITE);
        dibujarTextoEnStream(content, font, 8.5f, margenX + 12, 753,
                "Inspección: " + codigoInspeccion(inspeccion) + " | Empresa: " + empresaInspeccion(inspeccion), COLOR_WHITE);
        dibujarTextoEnStream(content, font, 8.5f, margenX + 12, 739,
                "Fecha: " + fechaInspeccion(inspeccion) + " | Estado del filtro: " + (estadoFiltro != null ? estadoFiltro : "TODAS"), COLOR_WHITE);
        dibujarTextoEnStream(content, font, 8f, margenX + 12, 42,
                "Documento generado por sistema de inspección | Página " + document.getNumberOfPages(), COLOR_MUTED);
        content.close();
        return 685;
    }

    private float dibujirFicha(PDDocument document, PDFont font, PDFont bold, float margenX, float y, FichaInspeccionResponseDTO ficha, Inspeccion inspeccion, String estadoFiltro) throws IOException {
        y = dibujarEncabezadoFicha(document, font, bold, margenX, y, ficha);
        y = dibujarPanel(document, font, bold, margenX, y, ANCHO_CONTENIDO, "DATOS GENERALES");
        y = dibujarFilaDoble(document, font, bold, margenX, y, ANCHO_CONTENIDO, "Empresa", valorO(ficha.getEmpresaNombre(), "Sin registrar"), "Resultado", valorO(ficha.getResultado(), "Sin resultado"));
        y = dibujarFilaDoble(document, font, bold, margenX, y, ANCHO_CONTENIDO, "Fecha inspección", fechaFicha(ficha), "Estado ficha", ficha.getEstado() != null ? (ficha.getEstado() ? "Finalizada" : "Pendiente") : "Sin estado");
        if (ficha.getInstanciaTramiteId() != null) {
            y = dibujarFila(document, font, bold, margenX, y, ANCHO_CONTENIDO, "Instancia trámite", String.valueOf(ficha.getInstanciaTramiteId()));
        }
        if (ficha.getFirmaResponsable() != null && !ficha.getFirmaResponsable().isBlank()) {
            y = dibujarFila(document, font, bold, margenX, y, ANCHO_CONTENIDO, "Responsable", ficha.getFirmaResponsable());
        }
        if (ficha.getFechaFirma() != null && !ficha.getFechaFirma().isBlank()) {
            y = dibujarFila(document, font, bold, margenX, y, ANCHO_CONTENIDO, "Fecha firma", ficha.getFechaFirma());
        }

        y = dibujarPanel(document, font, bold, margenX, y, ANCHO_CONTENIDO, "UNIDAD VEHICULAR");
        y = dibujarFilaDoble(document, font, bold, margenX, y, ANCHO_CONTENIDO, "Placa", valorO(ficha.getVehiculoPlaca(), "Sin placa"), "Marca / modelo", valorO(ficha.getVehiculoMarca(), "") + " " + valorO(ficha.getVehiculoModelo(), ""));
        y -= 6;

        if (ficha.getObservaciones() != null && !ficha.getObservaciones().isBlank()) {
            y = dibujarPanel(document, font, bold, margenX, y, ANCHO_CONTENIDO, "OBSERVACIONES GENERALES");
            int lineasObservacion = dividirTexto(font, 9, ficha.getObservaciones(), ANCHO_CONTENIDO - 40).size();
            float alturaObservacion = Math.min(130f, Math.max(70f, 48f + lineasObservacion * 16f));
            if (y < alturaObservacion + 90) {
                y = nuevaPagina(document, bold, font, margenX, y, inspeccion, estadoFiltro);
                y = dibujarPanel(document, font, bold, margenX, y, ANCHO_CONTENIDO, "OBSERVACIONES GENERALES");
            }
            y = dibujarObservaciones(document, font, bold, margenX, y, ANCHO_CONTENIDO, ficha.getObservaciones(), alturaObservacion);
            y -= 8;
        }

        if (ficha.getParametros() == null || ficha.getParametros().isEmpty()) {
            y = dibujarPanel(document, font, bold, margenX, y, ANCHO_CONTENIDO, "DETALLE DE INSPECCIÓN");
            y = dibujirTexto(document, font, margenX + 10, y - 12, ANCHO_CONTENIDO - 20, 9, "Sin campos registrados para esta ficha.", inspeccion, estadoFiltro);
            return y - 18;
        }

        Map<String, List<ParametroInspeccionResponseDTO>> parametrosPorSeccion = ficha.getParametros().stream()
                .collect(Collectors.groupingBy(parametro -> parametro.getSeccion() != null && !parametro.getSeccion().isBlank() ? parametro.getSeccion() : "DETALLE DE INSPECCIÓN", LinkedHashMap::new, Collectors.toList()));

        for (Map.Entry<String, List<ParametroInspeccionResponseDTO>> entry : parametrosPorSeccion.entrySet()) {
            if (y < 130) {
                y = nuevaPagina(document, bold, font, margenX, y, inspeccion, estadoFiltro);
            }
            y = dibujarPanel(document, font, bold, margenX, y, ANCHO_CONTENIDO, entry.getKey());
            List<ParametroInspeccionResponseDTO> parametros = entry.getValue();
            for (int i = 0; i < parametros.size(); i += 2) {
                ParametroInspeccionResponseDTO izquierda = parametros.get(i);
                ParametroInspeccionResponseDTO derecha = i + 1 < parametros.size() ? parametros.get(i + 1) : null;
                y = dibujarFilaParametroDoble(document, font, bold, margenX, y, ANCHO_CONTENIDO, izquierda, derecha);
            }
            y -= 4;
        }
        return y - 14;
    }

    private float dibujarEncabezadoFicha(PDDocument document, PDFont font, PDFont bold, float margenX, float y, FichaInspeccionResponseDTO ficha) throws IOException {
        float altura = 54;
        PDPage page = document.getPage(document.getNumberOfPages() - 1);
        PDPageContentStream content = new PDPageContentStream(document, page, AppendMode.APPEND, true);
        rellenarRectangulo(content, margenX, y, ANCHO_CONTENIDO, altura, COLOR_PANEL, COLOR_BORDER);
        dibujarTextoEnStream(content, bold, 11f, margenX + 10, y - 18, "FICHA N° " + ficha.getIdFichaInspeccion(), COLOR_DARK);
        dibujarTextoEnStream(content, font, 8.5f, margenX + 10, y - 35, "Vehículo: " + valorO(ficha.getVehiculoPlaca(), "Sin placa"), COLOR_MUTED);

        String resultado = valorO(ficha.getResultado(), "Sin resultado");
        Color colorResultado = colorResultado(resultado);
        rellenarRectangulo(content, margenX + ANCHO_CONTENIDO - 128, y - 39, 116, 24, colorResultado, colorResultado);
        dibujarTextoEnStream(content, bold, 9f, margenX + ANCHO_CONTENIDO - 118, y - 24, resultado, COLOR_WHITE);
        content.close();
        return y - altura - 12;
    }

    private float dibujarPanel(PDDocument document, PDFont font, PDFont bold, float margenX, float y, float ancho, String titulo) throws IOException {
        float altura = 28;
        PDPage page = document.getPage(document.getNumberOfPages() - 1);
        PDPageContentStream content = new PDPageContentStream(document, page, AppendMode.APPEND, true);
        rellenarRectangulo(content, margenX, y, ancho, altura, COLOR_PANEL, COLOR_BORDER);
        dibujarTextoEnStream(content, bold, 9.5f, margenX + 10, y - 17, titulo.toUpperCase(), COLOR_PRIMARY);
        content.close();
        return y - altura;
    }

    private float dibujarFila(PDDocument document, PDFont font, PDFont bold, float margenX, float y, float ancho, String etiqueta, String valor) throws IOException {
        float altura = 24;
        PDPage page = document.getPage(document.getNumberOfPages() - 1);
        PDPageContentStream content = new PDPageContentStream(document, page, AppendMode.APPEND, true);
        rellenarRectangulo(content, margenX, y, ancho, altura, COLOR_ROW, COLOR_BORDER);
        dibujarTextoEnStream(content, bold, 8.5f, margenX + 8, y - 15, etiqueta != null ? etiqueta.toUpperCase() : "", COLOR_MUTED);
        dibujarTextoEnStream(content, font, 8.5f, margenX + 150, y - 15, valorO(valor, "Sin registrar"), COLOR_TEXT);
        content.close();
        return y - altura - 2;
    }

    private float dibujarFilaDoble(PDDocument document, PDFont font, PDFont bold, float margenX, float y, float ancho, String etiqueta1, String valor1, String etiqueta2, String valor2) throws IOException {
        float altura = 24;
        float columna = ancho / 2f;
        PDPage page = document.getPage(document.getNumberOfPages() - 1);
        PDPageContentStream content = new PDPageContentStream(document, page, AppendMode.APPEND, true);
        rellenarRectangulo(content, margenX, y, ancho, altura, COLOR_ROW, COLOR_BORDER);
        dibujarTextoEnStream(content, bold, 8.5f, margenX + 8, y - 15, etiqueta1 != null ? etiqueta1.toUpperCase() : "", COLOR_MUTED);
        dibujarTextoEnStream(content, font, 8.5f, margenX + 150, y - 15, valorO(valor1, "Sin registrar"), COLOR_TEXT);
        dibujarTextoEnStream(content, bold, 8.5f, margenX + columna + 8, y - 15, etiqueta2 != null ? etiqueta2.toUpperCase() : "", COLOR_MUTED);
        dibujarTextoEnStream(content, font, 8.5f, margenX + columna + 150, y - 15, valorO(valor2, "Sin registrar"), COLOR_TEXT);
        content.close();
        return y - altura - 2;
    }

    private float dibujarFilaParametroDoble(PDDocument document, PDFont font, PDFont bold, float margenX, float y, float ancho, ParametroInspeccionResponseDTO izquierda, ParametroInspeccionResponseDTO derecha) throws IOException {
        float columna = ancho / 2f;
        float anchoColumna = columna - 16;
        float altura = alturaParametros(font, izquierda, derecha, anchoColumna);
        PDPage page = document.getPage(document.getNumberOfPages() - 1);
        PDPageContentStream content = new PDPageContentStream(document, page, AppendMode.APPEND, true);
        rellenarRectangulo(content, margenX, y, ancho, altura, COLOR_ROW, COLOR_BORDER);
        dibujarParametroEnStream(content, font, bold, margenX + 8, y, anchoColumna, izquierda, altura);
        if (derecha != null) {
            dibujarParametroEnStream(content, font, bold, margenX + columna + 8, y, anchoColumna, derecha, altura);
        }
        content.close();
        return y - altura - 2;
    }

    private float alturaParametros(PDFont font, ParametroInspeccionResponseDTO izquierda, ParametroInspeccionResponseDTO derecha, float anchoColumna) throws IOException {
        int lineas = Math.max(contarLineasParametro(font, izquierda, anchoColumna), contarLineasParametro(font, derecha, anchoColumna));
        return Math.min(72f, 24f + Math.max(0, lineas - 1) * 12f);
    }

    private int contarLineasParametro(PDFont font, ParametroInspeccionResponseDTO parametro, float anchoMaximo) throws IOException {
        if (parametro == null) {
            return 1;
        }
        String etiqueta = parametro.getParametro() != null ? parametro.getParametro().toUpperCase() : "";
        String valor = parametro.getObservacion() != null && !parametro.getObservacion().isBlank() ? parametro.getObservacion() : "(sin registrar)";
        int lineas = 1;
        if (font.getStringWidth(etiqueta) / 1000f * 8f > anchoMaximo * 0.45f) {
            lineas++;
        }
        return lineas + Math.max(1, dividirTexto(font, 8, valor, anchoMaximo).size());
    }

    private void dibujarParametroEnStream(PDPageContentStream content, PDFont font, PDFont bold, float x, float y, float anchoMaximo, ParametroInspeccionResponseDTO parametro, float altura) throws IOException {
        if (parametro == null) {
            return;
        }
        String etiqueta = parametro.getParametro() != null ? parametro.getParametro().toUpperCase() : "";
        String valor = parametro.getObservacion() != null && !parametro.getObservacion().isBlank() ? parametro.getObservacion() : "(sin registrar)";
        float etiquetaAncho = font.getStringWidth(etiqueta) / 1000f * 8f;
        float valorX = etiquetaAncho > anchoMaximo * 0.55f ? x : x + 70f;
        float valorAncho = etiquetaAncho > anchoMaximo * 0.55f ? anchoMaximo : Math.max(40f, anchoMaximo - 70f);
        dibujarTextoEnStream(content, bold, 8f, x, y - 15, etiqueta, COLOR_MUTED);
        float yy = y - 15;
        if (etiquetaAncho > anchoMaximo * 0.45f) {
            yy = y - 29;
        }
        if (font.getStringWidth(etiqueta) / 1000f * 8f > anchoMaximo * 0.55f) {
            yy = y - 29;
        }
        for (String linea : dividirTexto(font, 8, valor, valorAncho)) {
            dibujarTextoEnStream(content, font, 8f, valorX, yy, linea, COLOR_TEXT);
            yy -= 10f;
        }
    }

    private float dibujarObservaciones(PDDocument document, PDFont font, PDFont bold, float margenX, float y, float ancho, String texto, float altura) throws IOException {
        PDPage page = document.getPage(document.getNumberOfPages() - 1);
        PDPageContentStream content = new PDPageContentStream(document, page, AppendMode.APPEND, true);
        rellenarRectangulo(content, margenX, y, ancho, altura, COLOR_ROW, COLOR_BORDER);
        dibujarTextoEnStream(content, bold, 8.5f, margenX + 8, y - 18, "OBSERVACIONES:", COLOR_MUTED);
        float yy = y - 54;
        for (String linea : dividirTexto(font, 9, texto, ancho - 40)) {
            dibujarTextoEnStream(content, font, 9f, margenX + 8, yy, linea, COLOR_TEXT);
            yy -= 14f;
        }
        content.close();
        return y - altura - 2;
    }

    private float dibujirTexto(PDDocument document, PDFont font, float margenX, float y, float anchoMaximo, int tamano, String texto, Inspeccion inspeccion, String estadoFiltro) throws IOException {
        PDPage page = document.getPage(document.getNumberOfPages() - 1);
        if (y < 130) {
            y = nuevaPagina(document, font, font, margenX, y, inspeccion, estadoFiltro);
            page = document.getPage(document.getNumberOfPages() - 1);
        }

        PDPageContentStream content = new PDPageContentStream(document, page, AppendMode.APPEND, true);
        for (String linea : dividirTexto(font, tamano, texto, anchoMaximo)) {
            content.beginText();
            content.setFont(font, tamano);
            content.newLineAtOffset(margenX, y);
            content.showText(linea);
            content.endText();
            y -= tamano + 3;
        }
        content.close();
        return y;
    }

    private List<String> dividirTexto(PDFont font, int tamano, String texto, float anchoMaximo) throws IOException {
        String safe = texto == null ? "" : texto;
        if (safe.isBlank() || font.getStringWidth(safe) / 1000f * tamano <= anchoMaximo) {
            return List.of(safe);
        }

        List<String> lineas = new ArrayList<>();
        StringBuilder linea = new StringBuilder();
        for (int i = 0; i < safe.length(); i++) {
            char c = safe.charAt(i);
            StringBuilder candidata = new StringBuilder(linea).append(c);
            if (font.getStringWidth(candidata.toString()) / 1000f * tamano > anchoMaximo && linea.length() > 0) {
                lineas.add(linea.toString().trim());
                linea = new StringBuilder().append(c);
            } else {
                linea = candidata;
            }
        }
        if (!linea.isEmpty()) {
            lineas.add(linea.toString().trim());
        }
        return lineas;
    }

    private void rellenarRectangulo(PDPageContentStream content, float x, float ySuperior, float ancho, float alto, Color relleno, Color borde) throws IOException {
        content.setNonStrokingColor(relleno);
        content.addRect(x, ySuperior - alto, ancho, alto);
        content.fill();
        if (borde != null) {
            content.setStrokingColor(borde);
            content.addRect(x, ySuperior - alto, ancho, alto);
            content.stroke();
        }
    }

    private void dibujarTextoEnStream(PDPageContentStream content, PDFont font, float tamano, float x, float y, String texto, Color color) throws IOException {
        content.setNonStrokingColor(color);
        content.beginText();
        content.setFont(font, tamano);
        content.newLineAtOffset(x, y);
        content.showText(texto != null ? texto : "");
        content.endText();
    }

    private Color colorResultado(String resultado) {
        String normalizado = normalizarResultado(resultado);
        if ("APROBADO".equals(normalizado)) {
            return COLOR_SUCCESS;
        }
        if ("OBSERVADO".equals(normalizado)) {
            return COLOR_WARNING;
        }
        if ("DESAPROBADO".equals(normalizado)) {
            return COLOR_DANGER;
        }
        return COLOR_MUTED;
    }

    private String valorO(String valor, String fallback) {
        return valor != null && !valor.isBlank() ? valor : fallback;
    }

    private String codigoInspeccion(Inspeccion inspeccion) {
        return inspeccion != null && inspeccion.getCodigo() != null ? inspeccion.getCodigo() : "Sin código";
    }

    private String empresaInspeccion(Inspeccion inspeccion) {
        return inspeccion != null && inspeccion.getEmpresaNombre() != null ? inspeccion.getEmpresaNombre() : "Sin empresa";
    }

    private String fechaInspeccion(Inspeccion inspeccion) {
        if (inspeccion == null || inspeccion.getFechaProgramada() == null) {
            return "Sin fecha";
        }
        return inspeccion.getFechaProgramada().toString();
    }

    private String fechaFicha(FichaInspeccionResponseDTO ficha) {
        return ficha.getFechaInspeccion() != null ? ficha.getFechaInspeccion().format(FORMATO_FECHA) : "Sin fecha";
    }

    private String normalizarResultado(String resultado) {
        return resultado == null || resultado.isBlank() ? "" : resultado.trim().toUpperCase();
    }

    /**
      * Crea una nueva ficha de inspección (para un vehículo).
      * Obtiene el formato de la inspección (o crea uno por defecto si no existe)
      * y genera los ValorCampo vacíos para todos sus campos.
      */
    @Transactional
    public FichaInspeccionResponseDTO guardar(FichaInspeccionCreateRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("La solicitud de ficha es requerida");
        }

        Long inspeccionId = request.getInspeccionId();
        if (inspeccionId == null) {
            throw new IllegalArgumentException("InspeccionId es requerido");
        }

        Inspeccion inspeccion = inspeccionRepository.findByIdWithInstancias(inspeccionId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Inspección no encontrada con id " + inspeccionId
                ));

        Long instanciaTramiteId = request.getInstanciaTramiteId();
        if (instanciaTramiteId == null) {
            instanciaTramiteId = inspeccion.getInstancias() != null ? inspeccion.getInstancias().stream()
                    .map(ii -> ii.getInstanciaTramite() != null ? ii.getInstanciaTramite().getIdInstancia() : null)
                    .filter(id -> id != null)
                    .findFirst()
                    .orElse(null) : null;
        }

        Optional<FichaInspeccion> fichaExistente = fichaRepository.findByInstanciaTramiteIdAndInspeccion(inspeccionId, instanciaTramiteId);

        Long instanciaTramiteIdFinal = instanciaTramiteId;
        Long vehiculoId = request.getVehiculoId();
        if (vehiculoId == null) {
            if (fichaExistente.isPresent() && fichaExistente.get().getVehiculo() != null) {
                vehiculoId = fichaExistente.get().getVehiculo();
            } else if (inspeccion.getInstancias() != null) {
                vehiculoId = inspeccion.getInstancias().stream()
                        .filter(ii -> ii.getInstanciaTramite() != null
                                && ii.getInstanciaTramite().getIdInstancia().equals(instanciaTramiteIdFinal))
                        .findFirst()
                        .flatMap(ii -> {
                            try {
                                return Optional.ofNullable(ii.getInstanciaTramite().getIdentificador());
                            } catch (Exception e) {
                                return Optional.empty();
                            }
                        })
                        .flatMap(placa -> vehiculoRepository.findByPlaca(placa))
                        .map(Vehiculo::getIdVehiculo)
                        .orElse(null);
            }
        }

        FormatoInspeccion formato = obtenerOCrearFormatoActivo(inspeccion);

        FichaInspeccion ficha = fichaExistente.orElseGet(FichaInspeccion::new);
        boolean fichaNueva = ficha.getIdFichaInspeccion() == null;
        if (fichaNueva) {
            ficha.setInspeccion(inspeccionId);
            ficha.setInstanciaTramiteId(instanciaTramiteId);
            ficha.setFechaCreacion(LocalDateTime.now());
        }
        if (ficha.getInspeccion() == null) {
            ficha.setInspeccion(inspeccionId);
        }
        if (ficha.getInstanciaTramiteId() == null) {
            ficha.setInstanciaTramiteId(instanciaTramiteId);
        }

        if (request.getEstado() != null) {
            if (Boolean.TRUE.equals(request.getEstado())) {
                throw new IllegalArgumentException("No se puede finalizar una ficha sin firma y fecha de firma");
            }
            ficha.setEstado(request.getEstado());
        } else if (fichaNueva) {
            ficha.setEstado(false);
        }
        if (request.getResultado() != null) {
            ficha.setResultado(request.getResultado());
        } else if (fichaNueva) {
            ficha.setResultado(null);
        }
        if (fichaNueva) {
            ficha.setFechaInspeccion(null);
            ficha.setFirmaResponsable(null);
            ficha.setFechaFirma(null);
        }

        ficha.setVehiculo(vehiculoId);
        if (request.getUsuarioInspectorId() != null) {
            ficha.setUsuarioInspector(request.getUsuarioInspectorId());
        }
        if (request.getObservaciones() != null) {
            ficha.setObservaciones(request.getObservaciones());
        }
        ficha.setFormatoInspeccion(formato);

        FichaInspeccion guardada = fichaRepository.save(ficha);
        return convertirAResponseDTO(guardada);
    }

    @Transactional
    public FichaInspeccionResponseDTO actualizarResultado(Long id, String resultado, Boolean estado) {
        FichaInspeccion ficha = fichaRepository.findByIdWithAssociations(id)
                .orElseThrow(() -> new IllegalArgumentException("Ficha no encontrada"));

        if (resultado == null || resultado.isBlank()) {
            throw new IllegalArgumentException("El resultado de la ficha es requerido");
        }

        validarFichaEditableParaResultado(ficha);

        String resultadoNormalizado = resultado.trim().toUpperCase();
        if (!"APROBADO".equals(resultadoNormalizado) &&
            !"OBSERVADO".equals(resultadoNormalizado) &&
            !"DESAPROBADO".equals(resultadoNormalizado)) {
            throw new IllegalArgumentException("Resultado inválido. Use APROBADO, OBSERVADO o DESAPROBADO");
        }

        ficha.setResultado(resultadoNormalizado);
        if (Boolean.TRUE.equals(estado)) {
            throw new IllegalArgumentException("No se puede finalizar una ficha solo con resultado. Envíe firma y fecha.");
        }
        if (estado != null && !Boolean.TRUE.equals(estado)) {
            ficha.setEstado(false);
        }
        FichaInspeccion guardada = fichaRepository.save(ficha);
        return convertirAResponseDTO(guardada);
    }

    private void validarFichaEditableParaResultado(FichaInspeccion ficha) {
        if (Boolean.TRUE.equals(ficha.getEstado())) {
            throw new IllegalArgumentException("No se puede modificar el resultado de una ficha finalizada");
        }

        if (ficha.getInspeccion() != null) {
            Inspeccion inspeccion = inspeccionRepository.findById(ficha.getInspeccion())
                    .orElseThrow(() -> new IllegalArgumentException("Inspección no encontrada"));
            if ("FINALIZADA".equals(inspeccion.getEstado()) || "CANCELADA".equals(inspeccion.getEstado())) {
                throw new IllegalArgumentException("No se puede modificar el resultado de una ficha de una inspección finalizada o cancelada");
            }
        }
    }

    /**
      * Busca ficha por ID con asociaciones
     */
    public FichaInspeccionResponseDTO buscarPorId(Long id) {
        FichaInspeccion ficha = fichaRepository.findByIdWithAssociations(id)
                .orElseThrow(() -> new IllegalArgumentException("Ficha no encontrada"));
        return convertToDetailDTO(ficha);
    }

    /**
     * Replica el formato de una ficha origen a todas las demás fichas de la misma inspección.
     * Copia título, títulos de sección y crea valores vacíos con la misma estructura de campos.
     */
    @Transactional
    public void replicarFormatoEnInspeccion(Long inspeccionId, Long fichaOrigenId) {
        FichaInspeccion fichaOrigen = fichaRepository.findByIdWithAssociations(fichaOrigenId)
                .orElseThrow(() -> new IllegalArgumentException("Ficha origen no encontrada: " + fichaOrigenId));

        FormatoInspeccion formatoOrigen = fichaOrigen.getFormatoInspeccion();
        if (formatoOrigen == null) {
            throw new IllegalArgumentException("La ficha origen no tiene formato asociado");
        }

        Long formatoId = formatoOrigen.getIdFormatoInspeccion();

        // Asignar el mismo formato a todas las fichas de la inspección que no lo tengan
        List<FichaInspeccion> fichasDestino = fichaRepository.findByInspeccion(inspeccionId);

        for (FichaInspeccion fichaDestino : fichasDestino) {
            if (fichaDestino.getIdFichaInspeccion().equals(fichaOrigenId)) {
                continue; // saltar la ficha origen
            }

            FormatoInspeccion formatoDest = fichaDestino.getFormatoInspeccion();

            if (formatoDest == null || !formatoDest.getIdFormatoInspeccion().equals(formatoId)) {
                // Asignar el formato origen
                fichaDestino.setFormatoInspeccion(formatoOrigen);
                fichaDestino = fichaRepository.save(fichaDestino);
                formatoDest = formatoOrigen;
            }

            // Limpiar valores viejos (si la ficha ya tenía valores)
            List<ValorCampo> valoresViejos = valorRepository.findByFichaInspeccion_IdFichaInspeccion(
                    fichaDestino.getIdFichaInspeccion());
            if (!valoresViejos.isEmpty()) {
                valorRepository.deleteAll(valoresViejos);
            }

            // Recrear valores desde el formato origen
            List<CampoFormato> campos = campoRepository
                    .findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(formatoDest.getIdFormatoInspeccion());
            for (CampoFormato campo : campos) {
                ValorCampo valor = new ValorCampo();
                valor.setFichaInspeccion(fichaDestino);
                valor.setCampoFormato(campo);
                valor.setValor("");
                valor.setObservacion("");
                valorRepository.save(valor);
            }
        }
    }


    /**
     * Elimina una ficha
     */
    public void eliminar(Long id) {
        fichaRepository.deleteById(id);
    }

    /**
     * Actualiza una ficha (datos + valores de campos). Si se envían títulos,
     * se actualizan en el FormatoInspeccion asociado.
     */
    @Transactional
    public FichaInspeccionResponseDTO actualizar(Long id, FichaInspeccionUpdateRequestDTO request) {
        FichaInspeccion ficha = fichaRepository.findByIdWithAssociations(id)
                .orElseThrow(() -> new IllegalArgumentException("Ficha no encontrada"));

        boolean solicitudFinalizaFicha = Boolean.TRUE.equals(request.getEstado()) && !fichaFinalizadaRealmente(ficha);
        boolean inspeccionFinalizada = esInspeccionFinalizada(ficha);
        boolean inspeccionEditable = esInspeccionEditable(ficha);

        if (inspeccionFinalizada) {
            throw new IllegalStateException("No se puede editar una ficha de una inspección finalizada o cancelada.");
        }
        if (!inspeccionEditable) {
            throw new IllegalStateException("La inspección debe estar en curso para editar o finalizar fichas.");
        }
        if (fichaFinalizadaRealmente(ficha) && !solicitudFinalizaFicha) {
            throw new IllegalStateException("No se puede editar una ficha finalizada.");
        }
        if (solicitudFinalizaFicha && !esFinalizacionValida(ficha, request)) {
            throw new IllegalArgumentException("Para finalizar la ficha son obligatorios resultado, firma del responsable y fecha de firma.");
        }

        // Actualizar datos de la ficha
        if (request.getUsuarioInspectorId() != null) {
            ficha.setUsuarioInspector(request.getUsuarioInspectorId());
        }
        if (request.getEstado() != null && Boolean.TRUE.equals(request.getEstado()) && !esFinalizacionValida(ficha, request)) {
            throw new IllegalArgumentException("Para finalizar la ficha son obligatorios resultado, firma del responsable y fecha de firma.");
        }
        if (request.getResultado() != null) {
            ficha.setResultado(request.getResultado().isBlank() ? null : normalizarResultadoFicha(request.getResultado()));
        }
        ficha.setEstado(determinarEstadoFicha(ficha, request));
        if (request.getObservaciones() != null) {
            ficha.setObservaciones(request.getObservaciones());
        }
        if (request.getFirmaResponsable() != null) {
            ficha.setFirmaResponsable(request.getFirmaResponsable());
        }
        if (request.getFechaFirma() != null) {
            ficha.setFechaFirma(request.getFechaFirma());
        }

        // Si vienen títulos, actualizar el FormatoInspeccion asociado
        FormatoInspeccion formato = ficha.getFormatoInspeccion();
        if (formato != null) {
            boolean formatoModificado = false;
            if (request.getTituloPrincipal() != null) {
                formato.setTituloPrincipal(request.getTituloPrincipal());
                formatoModificado = true;
            }
            if (request.getSubtituloPrincipal() != null) {
                formato.setSubtituloPrincipal(request.getSubtituloPrincipal());
                formatoModificado = true;
            }
            if (request.getSubtitulo2() != null) {
                formato.setSubtitulo2(request.getSubtitulo2());
                formatoModificado = true;
            }
            if (request.getSubtitulo3() != null) {
                formato.setSubtitulo3(request.getSubtitulo3());
                formatoModificado = true;
            }
            if (request.getSubtitulo4() != null) {
                formato.setSubtitulo4(request.getSubtitulo4());
                formatoModificado = true;
            }
            if (request.getTituloSeccionDatosGenerales() != null) {
                formato.setTituloSeccionDatosGenerales(request.getTituloSeccionDatosGenerales());
                formatoModificado = true;
            }
            if (request.getTituloSeccionPlaca() != null) {
                formato.setTituloSeccionPlaca(request.getTituloSeccionPlaca());
                formatoModificado = true;
            }
            if (request.getTituloSeccionUnidadVehicular() != null) {
                formato.setTituloSeccionUnidadVehicular(request.getTituloSeccionUnidadVehicular());
                formatoModificado = true;
            }
            if (request.getTituloSeccionPlanLunca() != null) {
                formato.setTituloSeccionPlanLunca(request.getTituloSeccionPlanLunca());
                formatoModificado = true;
            }
            if (request.getTituloSeccionLaboratorio() != null) {
                formato.setTituloSeccionLaboratorio(request.getTituloSeccionLaboratorio());
                formatoModificado = true;
            }
            if (formatoModificado) {
                formatoRepository.save(formato);
            }
        }

        // Sincronizar InspeccionEntity.formatoInspeccion con el formato de la ficha
        // para que /api/formatos-inspeccion/inspeccion/{id} y /api/fichas-inspeccion/inspeccion/{id}
        // devuelvan el MISMO formato y los títulos coincidan en DISEÑO y EJECUCIÓN.
        if (formato != null && ficha.getInspeccion() != null) {
            inspeccionRepository.findById(ficha.getInspeccion()).ifPresent(inspeccion -> {
                if (inspeccion.getFormatoInspeccion() == null ||
                    !inspeccion.getFormatoInspeccion().getIdFormatoInspeccion().equals(formato.getIdFormatoInspeccion())) {
                    inspeccion.setFormatoInspeccion(formato);
                    inspeccionRepository.save(inspeccion);
                }
            });
        }

        // Actualizar parámetros (valores de campos)
        if (request.getParametros() != null) {
            actualizarParametros(ficha, request.getParametros());
        }
        sincronizarValoresConFormato(ficha, formato);

        FichaInspeccion guardada = fichaRepository.save(ficha);
        actualizarEstadoInstanciaDesdeFicha(guardada);
        return convertirADetailDTO(guardada);
    }

    /**
     * Una ficha solo está realmente cerrada si tiene estado true, resultado válido y datos mínimos de cierre.
     * Esto evita que una ficha marcada como finalizada por error quede bloqueada con resultado PENDIENTE
     * o sin firma/fecha.
     */
    private boolean fichaFinalizadaRealmente(FichaInspeccion ficha) {
        if (!Boolean.TRUE.equals(ficha.getEstado())) {
            return false;
        }
        if (!esResultadoFinalizable(ficha.getResultado())) {
            return false;
        }
        return !isBlank(ficha.getFirmaResponsable()) && !isBlank(ficha.getFechaFirma());
    }

    private boolean esFinalizacionValida(FichaInspeccion ficha, FichaInspeccionUpdateRequestDTO request) {
        String resultado = request.getResultado() != null ? request.getResultado() : ficha.getResultado();
        String firma = request.getFirmaResponsable() != null ? request.getFirmaResponsable() : ficha.getFirmaResponsable();
        String fecha = request.getFechaFirma() != null ? request.getFechaFirma() : ficha.getFechaFirma();
        return esResultadoFinalizable(resultado) && !isBlank(firma) && !isBlank(fecha);
    }

    private boolean determinarEstadoFicha(FichaInspeccion ficha, FichaInspeccionUpdateRequestDTO request) {
        if (Boolean.TRUE.equals(request.getEstado())) {
            return true;
        }
        return fichaFinalizadaRealmente(ficha) || esFinalizacionValida(ficha, request);
    }

    private boolean esResultadoFinalizable(String resultado) {
        if (resultado == null) {
            return false;
        }
        String normalizado = resultado.trim().toUpperCase();
        return "APROBADO".equals(normalizado)
                || "OBSERVADO".equals(normalizado)
                || "DESAPROBADO".equals(normalizado);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private void actualizarEstadoInstanciaDesdeFicha(FichaInspeccion ficha) {
        if (!Boolean.TRUE.equals(ficha.getEstado()) || ficha.getInspeccion() == null || ficha.getInstanciaTramiteId() == null) {
            return;
        }
        inspeccionInstanciaRepository.findByInspeccion_IdInspeccionAndInstanciaTramite_IdInstancia(
                ficha.getInspeccion(),
                ficha.getInstanciaTramiteId()
        ).ifPresent(ii -> {
            ii.setEstadoInstancia("INSPECCIONADO");
            ii.setFechaInspeccion(ii.getFechaInspeccion() != null ? ii.getFechaInspeccion() : LocalDateTime.now());
            if (ii.getObservaciones() == null || ii.getObservaciones().isBlank()) {
                ii.setObservaciones(ficha.getObservaciones());
            }
            inspeccionInstanciaRepository.save(ii);
        });
    }

    /**
     * Valida si la inspección asociada a la ficha ya está cerrada.
     */
    private boolean esInspeccionFinalizada(FichaInspeccion ficha) {
        Long inspeccionId = ficha.getInspeccion();
        if (inspeccionId == null) {
            return false;
        }
        return inspeccionRepository.findById(inspeccionId)
                .map(inspeccion -> {
                    String estado = inspeccion.getEstado();
                    return "FINALIZADA".equalsIgnoreCase(estado) || "CANCELADA".equalsIgnoreCase(estado);
                })
                .orElse(false);
    }

    /**
     * Valida si la inspección asociada a la ficha está en curso.
     */
    private boolean esInspeccionEditable(FichaInspeccion ficha) {
        Long inspeccionId = ficha.getInspeccion();
        if (inspeccionId == null) {
            return true;
        }
        return inspeccionRepository.findById(inspeccionId)
                .map(inspeccion -> {
                    String estado = inspeccion.getEstado();
                    return "EN_CURSO".equalsIgnoreCase(estado)
                            || "INICIADA".equalsIgnoreCase(estado)
                            || "EN_PROCESO".equalsIgnoreCase(estado);
                })
                .orElse(true);
    }

    private String normalizarResultadoFicha(String resultado) {
        String normalizado = resultado.trim().toUpperCase();
        if (!"APROBADO".equals(normalizado) &&
            !"OBSERVADO".equals(normalizado) &&
            !"DESAPROBADO".equals(normalizado)) {
            throw new IllegalArgumentException("Resultado inválido. Use APROBADO, OBSERVADO o DESAPROBADO");
        }
        return normalizado;
    }

    /**
     * Actualiza los valores de los campos de la ficha
     */
    @Transactional
    private void actualizarParametros(FichaInspeccion ficha, List<ParametroInspeccionDTO> parametros) {
        // Mapa de campoFormatoId -> ValorCampo existente
        Map<Long, ValorCampo> valoresExistentes = ficha.getValores().stream()
                .filter(v -> v.getCampoFormato() != null)
                .collect(Collectors.toMap(
                        v -> v.getCampoFormato().getIdCampoFormato(),
                        v -> v
                ));

        for (ParametroInspeccionDTO paramDTO : parametros) {
            // Buscar el CampoFormato por nombre (o por id si viene)
            CampoFormato campo = null;
            if (paramDTO.getId() != null) {
                campo = campoRepository.findById(paramDTO.getId())
                        .orElse(null);
            }
            if (campo == null && paramDTO.getParametro() != null) {
                // Buscar por nombre en el formato de la ficha
                FormatoInspeccion formato = ficha.getFormatoInspeccion();
                if (formato != null) {
                    campo = formato.getCampos().stream()
                            .filter(c -> c.getNombre().equals(paramDTO.getParametro()))
                            .findFirst()
                            .orElse(null);
                }
            }

            if (campo == null) {
                // No se encontró el campo, ignorar
                continue;
            }

            ValorCampo valor = valoresExistentes.remove(campo.getIdCampoFormato());
            if (valor == null) {
                // Crear nuevo valor
                valor = new ValorCampo();
                valor.setFichaInspeccion(ficha);
                valor.setCampoFormato(campo);
                valor.setValor(paramDTO.getObservacion() != null ? paramDTO.getObservacion() : "");
                valor.setObservacion(""); // ¿observación adicional?
                valorRepository.save(valor);
            } else {
                // Actualizar existente
                valor.setValor(paramDTO.getObservacion() != null ? paramDTO.getObservacion() : "");
                valorRepository.save(valor);
            }
        }
        // Los valores no enviados se mantienen, no se eliminan
    }

    /**
     * Lista aprobadas por empresa
     */
    public List<FichaInspeccionResponseDTO> listarAprobadasPorEmpresa(Long empresaId) {
        return fichaRepository.findApprovedByEmpresa(empresaId).stream()
                .map(this::convertToDetailDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene la ficha aprobada más reciente para un vehículo
     */
    public FichaInspeccionResponseDTO obtenerAprobadaPorVehiculo(Long vehiculoId) {
        List<FichaInspeccion> fichas = fichaRepository.findApprovedByVehiculoOrderByFechaCreacionDesc(vehiculoId);
        if (fichas.isEmpty()) {
            return null;
        }
        return convertToDetailDTO(fichas.get(0));
    }

    // ========== MÉTODOS AUXILIARES COMPARTIDOS ==========

    /**
     * Obtiene el {@link FormatoInspeccion} activo de la inspección.
     * <p>
     * Flujo de selección:
     * <ol>
     *   <li>Si la inspección ya tiene un {@code FormatoInspeccion} asignado, lo devuelve tal cual.</li>
     *   <li>Si no lo tiene, busca cualquier formato activo en la BD y lo reutiliza.</li>
     *   <li>Si definitivamente no existe ningún formato activo, crea uno nuevo con campos
     *       genéricos preconfigurados (27 campos en 4 secciones) y lo asigna a la inspección.</li>
     * </ol>
     * Esto evita duplicar formatos cuando ya hay uno configurado y lista para reutilizar.
     *
     * @param inspeccion la inspección para la que se necesita formato
     * @return un {@link FormatoInspeccion} siempre no-nulo
     */
    public FormatoInspeccion obtenerOCrearFormatoActivo(Inspeccion inspeccion) {
        if (inspeccion == null || inspeccion.getIdInspeccion() == null) {
            throw new IllegalArgumentException("La inspección es requerida para obtener/crear el formato activo");
        }

        FormatoInspeccion formato = formatoRepository.findByNombreAndActivoTrue(FORMATO_GLOBAL_NOMBRE).orElse(null);
        if (formato != null) {
            inspeccion.setFormatoInspeccion(formato);
            inspeccionRepository.save(inspeccion);
            return formato;
        }

        return crearFormatoPorDefectoParaInspeccion(inspeccion);
    }

    /**
     * Crea un {@link FormatoInspeccion} por defecto con 27 campos preconfigurados
     * en 4 secciones. Solo se ejecuta cuando definitivamente no hay ningún formato activo.
     */
    private FormatoInspeccion crearFormatoPorDefectoParaInspeccion(Inspeccion inspeccion) {
        FormatoInspeccion formato = new FormatoInspeccion();
        formato.setNombre(FORMATO_GLOBAL_NOMBRE);
        formato.setDescripcion("Formato reutilizable global para inspecciones");
        formato.setActivo(true);
        formato.setTituloPrincipal("CERTIFICADO DE INSTRUCCIONES EQUIVALIDO COMPLEMENTARIA");
        formato.setTituloFontSize(24);
        formato.setSubtituloPrincipal("CÁTEDRA DE LA EMPRESA");
        formato.setSubtituloFontSize(18);
        formato.setTituloSeccionDatosGenerales("DATOS GENERALES");
        formato.setTituloSeccionPlaca("PLACA");
        formato.setTituloSeccionUnidadVehicular("UNIDAD VEHICULAR");
        formato.setTituloSeccionPlanLunca("PLAN LUNCA DE RODALE");
        formato.setTituloSeccionLaboratorio("OBSERVACIONES");
        FormatoInspeccion guardado = formatoRepository.save(formato);

        List<CampoFormato> campos = List.of(
                new CampoFormato("Empresa:", "DATOS GENERALES", 0),
                new CampoFormato("RUC:", "DATOS GENERALES", 1),
                new CampoFormato("Lugar:", "DATOS GENERALES", 2),
                new CampoFormato("Fecha:", "DATOS GENERALES", 3),
                new CampoFormato("Representante:", "DATOS GENERALES", 4),
                new CampoFormato("DNI:", "DATOS GENERALES", 5),
                new CampoFormato("Unidad vehicular:", "UNIDAD VEHICULAR", 6),
                new CampoFormato("Placa:", "UNIDAD VEHICULAR", 7),
                new CampoFormato("Propietario:", "UNIDAD VEHICULAR", 8),
                new CampoFormato("Nombre del Conductor:", "UNIDAD VEHICULAR", 9),
                new CampoFormato("Licencia:", "UNIDAD VEHICULAR",  10),
                new CampoFormato("Categoria:", "UNIDAD VEHICULAR",  11),
                campoEvaluacion(12, "botiquin"),
                campoEvaluacion(13, "luces"),
                campoEvaluacion(14, "espejos"),
                campoEvaluacion(15, "repuestos"),
                campoEvaluacion(16, "test"),
                new CampoFormato("Observaciones generales:", "OBSERVACIONES", 17)
        );
        for (CampoFormato c : campos) {
            c.setFormatoInspeccion(guardado);
            campoRepository.save(c);
        }

        inspeccion.setFormatoInspeccion(guardado);
        inspeccionRepository.save(inspeccion);

        return guardado;
    }

    private static CampoFormato campoEvaluacion(int orden, String nombre) {
        CampoFormato c = new CampoFormato(nombre, "PLAN LUNCA DE RODALE", orden);
        c.setTipoEvaluacion("EVALUACION");
        c.setObligatorio(true);
        return c;
    }

    /**
     * Sincroniza la estructura de una ficha con el formato actual sin borrar valores existentes.
     * Usa cada vez que se crea o reutiliza una {@link FichaInspeccion}.
     *
     * @param ficha   la ficha a sincronizar
     * @param formato el formato del que se toman los campos
     */
    public void crearValoresCamposParaFicha(FichaInspeccion ficha, FormatoInspeccion formato) {
        sincronizarValoresConFormato(ficha, formato);
    }

    public void sincronizarValoresConFormato(FichaInspeccion ficha, FormatoInspeccion formato) {
        if (ficha == null || ficha.getIdFichaInspeccion() == null || formato == null || formato.getIdFormatoInspeccion() == null) {
            return;
        }

        List<CampoFormato> camposFormato = campoRepository.findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(
                formato.getIdFormatoInspeccion());
        java.util.Set<Long> idsFormato = camposFormato.stream()
                .map(CampoFormato::getIdCampoFormato)
                .collect(Collectors.toSet());

        List<ValorCampo> valoresExistentes = valorRepository.findByFichaInspeccion_IdFichaInspeccion(ficha.getIdFichaInspeccion());
        Map<Long, List<ValorCampo>> valoresPorCampo = valoresExistentes.stream()
                .filter(v -> v.getCampoFormato() != null && idsFormato.contains(v.getCampoFormato().getIdCampoFormato()))
                .collect(Collectors.groupingBy(v -> v.getCampoFormato().getIdCampoFormato()));

        valoresExistentes.stream()
                .filter(v -> v.getCampoFormato() == null || !idsFormato.contains(v.getCampoFormato().getIdCampoFormato()))
                .forEach(valorRepository::delete);

        valoresPorCampo.values().stream()
                .filter(valores -> valores.size() > 1)
                .forEach(valores -> valorRepository.deleteAll(valores.subList(1, valores.size())));

        for (CampoFormato campo : camposFormato) {
            List<ValorCampo> valores = valoresPorCampo.get(campo.getIdCampoFormato());
            ValorCampo valor;
            if (valores == null || valores.isEmpty()) {
                valor = new ValorCampo();
                valor.setFichaInspeccion(ficha);
                valor.setCampoFormato(campo);
                valor.setValor("");
                valor.setObservacion("");
            } else {
                valor = valores.get(0);
                valor.setFichaInspeccion(ficha);
                valor.setCampoFormato(campo);
                if (valor.getValor() == null) {
                    valor.setValor("");
                }
                if (valor.getObservacion() == null) {
                    valor.setObservacion("");
                }
            }
            valorRepository.save(valor);
        }
    }

    // Conversión a DTO de respuesta simple (sin profundidad)
    private FichaInspeccionResponseDTO convertToResponseDTO(FichaInspeccion ficha) {
        FichaInspeccionResponseDTO dto = new FichaInspeccionResponseDTO();
        dto.setIdFichaInspeccion(ficha.getIdFichaInspeccion());
        dto.setInspeccionId(ficha.getInspeccion());
        dto.setInstanciaTramiteId(ficha.getInstanciaTramiteId());
        dto.setVehiculoId(ficha.getVehiculo());
        dto.setEstado(ficha.getEstado());
        dto.setResultado(ficha.getResultado());
        dto.setObservaciones(ficha.getObservaciones());
        dto.setFechaInspeccion(ficha.getFechaInspeccion());

        // Títulos desde FormatoInspeccion
        FormatoInspeccion formato = ficha.getFormatoInspeccion();
        if (formato != null) {
            dto.setTituloPrincipal(formato.getTituloPrincipal());
            dto.setSubtituloPrincipal(formato.getSubtituloPrincipal());
            dto.setSubtitulo2(formato.getSubtitulo2());
            dto.setTituloSeccionDatosGenerales(formato.getTituloSeccionDatosGenerales());
            dto.setTituloSeccionPlaca(formato.getTituloSeccionPlaca());
            dto.setTituloSeccionUnidadVehicular(formato.getTituloSeccionUnidadVehicular());
            dto.setTituloSeccionPlanLunca(formato.getTituloSeccionPlanLunca());
            dto.setTituloSeccionLaboratorio(formato.getTituloSeccionLaboratorio());
        } else {
            // Valores por defecto
            dto.setTituloPrincipal("CERTIFICADO DE INSTRUCCIONES EQUIVALIDO COMPLEMENTARIA");
            dto.setSubtituloPrincipal("CÁTEDRA DE LA EMPRESA");
            dto.setSubtitulo2("");
            dto.setTituloSeccionDatosGenerales("DATOS GENERALES");
            dto.setTituloSeccionPlaca("PLACA");
            dto.setTituloSeccionUnidadVehicular("UNIDAD VEHICULAR");
            dto.setTituloSeccionPlanLunca("PLAN LUNCA DE RODALE");
            dto.setTituloSeccionLaboratorio("LABORATORIO");
        }

        // Parámetros (vacíos porque no cargamos en listarTodas)
        dto.setParametros(new ArrayList<>());

        return dto;
    }

    // Conversión a DTO detallado (con parámetros)
    private FichaInspeccionResponseDTO convertToDetailDTO(FichaInspeccion ficha) {
        FichaInspeccionResponseDTO dto = new FichaInspeccionResponseDTO();
        dto.setIdFichaInspeccion(ficha.getIdFichaInspeccion());
        dto.setInspeccionId(ficha.getInspeccion());
        dto.setInstanciaTramiteId(ficha.getInstanciaTramiteId());
        dto.setVehiculoId(ficha.getVehiculo());
        dto.setEstado(ficha.getEstado());
        dto.setResultado(ficha.getResultado());
        dto.setObservaciones(ficha.getObservaciones());
        dto.setFechaInspeccion(ficha.getFechaInspeccion());
        dto.setFirmaResponsable(ficha.getFirmaResponsable());
        dto.setFechaFirma(ficha.getFechaFirma());

        // Títulos desde FormatoInspeccion
        FormatoInspeccion formato = ficha.getFormatoInspeccion();
        if (formato == null && ficha.getInspeccion() != null) {
            formato = inspeccionRepository.findById(ficha.getInspeccion())
                    .map(Inspeccion::getFormatoInspeccion)
                    .orElse(null);
        }
        if (formato != null) {
            dto.setTituloPrincipal(formato.getTituloPrincipal());
            dto.setSubtituloPrincipal(formato.getSubtituloPrincipal());
            dto.setSubtitulo2(formato.getSubtitulo2());
            dto.setTituloSeccionDatosGenerales(formato.getTituloSeccionDatosGenerales());
            dto.setTituloSeccionPlaca(formato.getTituloSeccionPlaca());
            dto.setTituloSeccionUnidadVehicular(formato.getTituloSeccionUnidadVehicular());
            dto.setTituloSeccionPlanLunca(formato.getTituloSeccionPlanLunca());
            dto.setTituloSeccionLaboratorio(formato.getTituloSeccionLaboratorio());
        } else {
            dto.setTituloPrincipal("CERTIFICADO DE INSTRUCCIONES EQUIVALIDO COMPLEMENTARIA");
            dto.setSubtituloPrincipal("CÁTEDRA DE LA EMPRESA");
            dto.setSubtitulo2("");
            dto.setTituloSeccionDatosGenerales("DATOS GENERALES");
            dto.setTituloSeccionPlaca("PLACA");
            dto.setTituloSeccionUnidadVehicular("UNIDAD VEHICULAR");
            dto.setTituloSeccionPlanLunca("PLAN LUNCA DE RODALE");
            dto.setTituloSeccionLaboratorio("LABORATORIO");
        }

        // Parámetros (campos con valores) — cargar valores explícitamente (LAZY)
        List<ParametroInspeccionResponseDTO> parametrosDTO = new ArrayList<>();
        if (formato != null) {
            List<ValorCampo> valores = valorRepository.findByFichaInspeccion_IdFichaInspeccion(ficha.getIdFichaInspeccion());
            Map<Long, ValorCampo> valorPorCampo = valores.stream()
                    .filter(v -> v.getCampoFormato() != null)
                    .collect(Collectors.toMap(
                            v -> v.getCampoFormato().getIdCampoFormato(),
                            v -> v
                    ));

            List<CampoFormato> campos = campoRepository.findByFormatoInspeccion_IdFormatoInspeccionOrderByOrdenAsc(
                    formato.getIdFormatoInspeccion());
            for (CampoFormato campo : campos) {
                ParametroInspeccionResponseDTO paramDTO = new ParametroInspeccionResponseDTO();
                paramDTO.setIdParametros(campo.getIdCampoFormato());
                paramDTO.setParametro(campo.getNombre());
                ValorCampo val = valorPorCampo.get(campo.getIdCampoFormato());
                paramDTO.setObservacion(val != null ? val.getValor() : "");
                paramDTO.setSeccion(campo.getSeccion());
                parametrosDTO.add(paramDTO);
            }
        }
        dto.setParametros(parametrosDTO);

        // Datos del vehículo
        Vehiculo vehiculo = ficha.getVehiculoEntity();
        if (vehiculo != null) {
            dto.setVehiculoPlaca(vehiculo.getPlaca());
            dto.setVehiculoMarca(vehiculo.getMarca());
            dto.setVehiculoModelo(vehiculo.getModelo());
        } else {
            Long vehiculoId = ficha.getVehiculo();
            if (vehiculoId != null) {
                vehiculo = vehiculoRepository.findById(vehiculoId).orElse(null);
                if (vehiculo != null) {
                    dto.setVehiculoPlaca(vehiculo.getPlaca());
                    dto.setVehiculoMarca(vehiculo.getMarca());
                    dto.setVehiculoModelo(vehiculo.getModelo());
                }
            }
        }

        // VehiculoApto info
        if (ficha.getVehiculoApto() != null) {
            VehiculoApto va = ficha.getVehiculoApto();
            dto.setVehiculoAptoId(va.getIdVehiculoApto());
            dto.setEstadoDocumental(va.getEstadoDocumental());
        }

        return dto;
    }

    /**
     * Sincroniza todas las fichas de todas las inspecciones que usen este formato.
     * Garantiza que formato y fichas sean idénticos en estructura.
     */
    @Transactional
    public void sincronizarTodasLasFichasDeFormato(FormatoInspeccion formato) {
        if (formato == null) return;

        List<Long> inspeccionIds = inspeccionRepository.findByFormatoInspeccion_IdFormatoInspeccion(formato.getIdFormatoInspeccion()).stream()
                .map(Inspeccion::getIdInspeccion)
                .collect(java.util.stream.Collectors.toList());

        for (Long inspeccionId : inspeccionIds) {
            sincronizarFichasConFormato(inspeccionId, formato);
        }
    }

    /**
     * Sincroniza todas las fichas de una inspección para que usen el mismo formato.
     * Garantiza que formato (cabecera) y fichas (hojas) siempre sean iguales.
     */
    @Transactional
    public void sincronizarFichasConFormato(Long inspeccionId, FormatoInspeccion formato) {
        if (inspeccionId == null || formato == null) return;

        List<FichaInspeccion> fichas = fichaRepository.findByInspeccion(inspeccionId);
        for (FichaInspeccion ficha : fichas) {
            ficha.setFormatoInspeccion(formato);
            fichaRepository.save(ficha);
            sincronizarValoresConFormato(ficha, formato);
        }
    }

    private FichaInspeccionResponseDTO convertirAResponseDTO(FichaInspeccion ficha) {
        return convertToResponseDTO(ficha);
    }

    private FichaInspeccionResponseDTO convertirADetailDTO(FichaInspeccion ficha) {
        return convertToDetailDTO(ficha);
    }
}
