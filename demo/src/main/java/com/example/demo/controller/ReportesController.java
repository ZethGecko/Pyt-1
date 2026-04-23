package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
public class ReportesController {

    @GetMapping("/estadisticas-generales")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasGenerales() {
        Map<String, Object> estadisticas = new HashMap<>();

        // Aquí irían las consultas reales a los servicios
        // Por ahora, devolver datos de ejemplo
        estadisticas.put("totalTramites", 150);
        estadisticas.put("tramitesActivos", 45);
        estadisticas.put("tramitesCompletados", 105);
        estadisticas.put("totalEmpresas", 25);
        estadisticas.put("totalVehiculos", 180);
        estadisticas.put("totalInspecciones", 320);
        estadisticas.put("totalExamenes", 450);

        return ResponseEntity.ok(estadisticas);
    }

    @GetMapping("/tramites-por-estado")
    public ResponseEntity<Map<String, Object>> tramitesPorEstado(
            @RequestParam(required = false) LocalDate fechaInicio,
            @RequestParam(required = false) LocalDate fechaFin) {

        Map<String, Object> resultado = new HashMap<>();

        // Datos de ejemplo
        Map<String, Integer> tramitesPorEstado = new HashMap<>();
        tramitesPorEstado.put("REGISTRADO", 25);
        tramitesPorEstado.put("EN_REVISION", 15);
        tramitesPorEstado.put("APROBADO", 35);
        tramitesPorEstado.put("RECHAZADO", 8);
        tramitesPorEstado.put("FINALIZADO", 67);

        resultado.put("data", tramitesPorEstado);
        resultado.put("fechaInicio", fechaInicio);
        resultado.put("fechaFin", fechaFin);

        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/tramites-por-departamento")
    public ResponseEntity<Map<String, Object>> tramitesPorDepartamento(
            @RequestParam(required = false) LocalDate fechaInicio,
            @RequestParam(required = false) LocalDate fechaFin) {

        Map<String, Object> resultado = new HashMap<>();

        // Datos de ejemplo
        Map<String, Integer> tramitesPorDepartamento = new HashMap<>();
        tramitesPorDepartamento.put("Departamento Administrativo", 45);
        tramitesPorDepartamento.put("Departamento Técnico", 62);
        tramitesPorDepartamento.put("Departamento Legal", 23);
        tramitesPorDepartamento.put("Departamento de Control", 20);

        resultado.put("data", tramitesPorDepartamento);
        resultado.put("fechaInicio", fechaInicio);
        resultado.put("fechaFin", fechaFin);

        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/tramites-por-tipo")
    public ResponseEntity<Map<String, Object>> tramitesPorTipo(
            @RequestParam(required = false) LocalDate fechaInicio,
            @RequestParam(required = false) LocalDate fechaFin) {

        Map<String, Object> resultado = new HashMap<>();

        // Datos de ejemplo
        Map<String, Integer> tramitesPorTipo = new HashMap<>();
        tramitesPorTipo.put("Licencia de Conducir", 85);
        tramitesPorTipo.put("Inspección Vehicular", 45);
        tramitesPorTipo.put("Duplicado de Licencia", 12);
        tramitesPorTipo.put("Revalidación", 8);

        resultado.put("data", tramitesPorTipo);
        resultado.put("fechaInicio", fechaInicio);
        resultado.put("fechaFin", fechaFin);

        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/empresas-mas-activas")
    public ResponseEntity<Map<String, Object>> empresasMasActivas(
            @RequestParam(defaultValue = "10") int limite) {

        Map<String, Object> resultado = new HashMap<>();

        // Datos de ejemplo
        Map<String, Integer> empresasActivas = new HashMap<>();
        empresasActivas.put("Transportes XYZ S.A.", 25);
        empresasActivas.put("AutoBuses del Sur", 18);
        empresasActivas.put("Taxi Seguro Ltda.", 15);
        empresasActivas.put("Carga Express", 12);

        resultado.put("data", empresasActivas);
        resultado.put("limite", limite);

        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/inspecciones-por-mes")
    public ResponseEntity<Map<String, Object>> inspeccionesPorMes(
            @RequestParam(required = false) Integer anio) {

        Map<String, Object> resultado = new HashMap<>();

        // Datos de ejemplo
        Map<String, Integer> inspeccionesPorMes = new HashMap<>();
        inspeccionesPorMes.put("Enero", 45);
        inspeccionesPorMes.put("Febrero", 38);
        inspeccionesPorMes.put("Marzo", 52);
        inspeccionesPorMes.put("Abril", 41);
        inspeccionesPorMes.put("Mayo", 48);
        inspeccionesPorMes.put("Junio", 55);

        resultado.put("data", inspeccionesPorMes);
        resultado.put("anio", anio != null ? anio : LocalDate.now().getYear());

        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/examenes-por-tipo")
    public ResponseEntity<Map<String, Object>> examenesPorTipo(
            @RequestParam(required = false) LocalDate fechaInicio,
            @RequestParam(required = false) LocalDate fechaFin) {

        Map<String, Object> resultado = new HashMap<>();

        // Datos de ejemplo
        Map<String, Integer> examenesPorTipo = new HashMap<>();
        examenesPorTipo.put("Teórico BIIB", 120);
        examenesPorTipo.put("Práctico BIIB", 95);
        examenesPorTipo.put("Teórico BIIC", 85);
        examenesPorTipo.put("Práctico BIIC", 70);
        examenesPorTipo.put("Revalidación", 45);

        resultado.put("data", examenesPorTipo);
        resultado.put("fechaInicio", fechaInicio);
        resultado.put("fechaFin", fechaFin);

        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/dashboard-principal")
    public ResponseEntity<Map<String, Object>> dashboardPrincipal() {
        Map<String, Object> dashboard = new HashMap<>();

        // Estadísticas principales
        dashboard.put("totalTramites", 150);
        dashboard.put("tramitesPendientes", 45);
        dashboard.put("tramitesAprobadosMes", 28);
        dashboard.put("tramitesRechazadosMes", 5);

        // Gráficos
        Map<String, Integer> tramitesPorEstado = new HashMap<>();
        tramitesPorEstado.put("Registrado", 25);
        tramitesPorEstado.put("En Revisión", 15);
        tramitesPorEstado.put("Aprobado", 35);
        tramitesPorEstado.put("Finalizado", 67);
        tramitesPorEstado.put("Rechazado", 8);

        dashboard.put("tramitesPorEstado", tramitesPorEstado);

        // Alertas
        dashboard.put("alertas", new String[]{
            "5 trámites próximos a vencer",
            "3 inspecciones programadas para hoy",
            "12 exámenes pendientes de revisión"
        });

        return ResponseEntity.ok(dashboard);
    }
}