package com.example.demo.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import com.example.demo.dto.BusquedaRutaRequestDTO;
import com.example.demo.dto.RutaBusquedaResultadoDTO;
import com.example.demo.model.PuntoRuta;
import com.example.demo.model.Ruta;
import com.example.demo.repository.RutaRepository;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RutaServiceTest {

    @Mock
    private RutaRepository rutaRepository;

    @InjectMocks
    private RutaService rutaService;

    @Test
    void testBuscarMejorRuta_TramoContinuoYDistanciaTotal() {
        // Preparar datos: ruta con 3 puntos en línea aproximadamente
        Ruta ruta = new Ruta();
        ruta.setIdRuta(1L);
        ruta.setCodigo("RUTA-001");
        ruta.setNombre("Ruta de Prueba");
        ruta.setEstado("ACTIVO");
        ruta.setTipo("URBANO");

        PuntoRuta p1 = new PuntoRuta();
        p1.setLatitud(-12.0450);  // cerca del origen
        p1.setLongitud(-77.0300);
        p1.setOrden(1);

        PuntoRuta p2 = new PuntoRuta();
        p2.setLatitud(-12.0500);  // punto intermedio
        p2.setLongitud(-77.0350);
        p2.setOrden(2);

        PuntoRuta p3 = new PuntoRuta();
        p3.setLatitud(-12.0550);  // cerca del destino
        p3.setLongitud(-77.0400);
        p3.setOrden(3);

        ruta.setPuntosRuta(Arrays.asList(p1, p2, p3));

        when(rutaRepository.findAllActivosConPuntosRuta())
                .thenReturn(Collections.singletonList(ruta));

        BusquedaRutaRequestDTO request = new BusquedaRutaRequestDTO(
                -12.0460, -77.0310,   // origen (cerca de p1)
                -12.0540, -77.0390    // destino (cerca de p3)
        );

        List<RutaBusquedaResultadoDTO> resultados = rutaService.buscarMejorRuta(request);

        assertFalse(resultados.isEmpty(), "Debe devolver al menos una ruta");

        RutaBusquedaResultadoDTO resultado = resultados.get(0);
        assertEquals(1L, resultado.getIdRuta());

        // Verificar que el tramo incluye los 3 puntos de la ruta en orden
        assertNotNull(resultado.getPuntosTramo());
        assertEquals(3, resultado.getPuntosTramo().size());

        // La distancia total debe ser: origen→p1 + p1→p3 + p3→destino
        double distOrigenP1 = rutaService.haversine(-12.0460, -77.0310, -12.0450, -77.0300);
        double distP1P3 = rutaService.haversine(-12.0450, -77.0300, -12.0550, -77.0400); // suma de segmentos p1-p2 y p2-p3
        double distP3Destino = rutaService.haversine(-12.0550, -77.0400, -12.0540, -77.0390);
        double esperado = distOrigenP1 + distP1P3 + distP3Destino;

        assertEquals(esperado, resultado.getDistanciaCalculada(), 0.001);
    }
}
