package com.example.demo.dto;

import java.util.List;

/**
 * Respuesta del endpoint /api/inspecciones/tareas-inspeccion/{inspeccionId}
 *
 * <p>Contiene:
 * <ul>
 *   <li>{@code columnas}: definiciones de las columnas de la tabla de tareas</li>
 *   <li>{@code filas}: registros de inspección (cada uno mapeado a un objeto {campo → valor})</li>
 *   <li>{@code cantidad}: número total de filas</li>
 * </ul>
 */
public class TareasInspeccionResponse {

    /**
     * Definiciones de columnas: cada entrada expone el encabezado, el nombre de la propiedad
     * sobre el objeto de fila, y si la columna es de contenido útil (esUtil = true) o estructural.
     */
    private List<TareaInspeccionColumnaDTO> columnas;

    /**
     * Filas de la tabla. Cada fila es un mapa de {nombre_de_campo → valor_crudo}.
     * Los valores pueden ser String, Number, Boolean o null.
     */
    private List<java.util.Map<String, Object>> filas;

    /**
     * Cantidad total de filas devueltas.
     */
    private int cantidad;

    public TareasInspeccionResponse() {}

    public TareasInspeccionResponse(List<TareaInspeccionColumnaDTO> columnas,
                                     List<java.util.Map<String, Object>> filas,
                                     int cantidad) {
        this.columnas = columnas;
        this.filas = filas;
        this.cantidad = cantidad;
    }

    public List<TareaInspeccionColumnaDTO> getColumnas() {
        return columnas;
    }

    public void setColumnas(List<TareaInspeccionColumnaDTO> columnas) {
        this.columnas = columnas;
    }

    public List<java.util.Map<String, Object>> getFilas() {
        return filas;
    }

    public void setFilas(List<java.util.Map<String, Object>> filas) {
        this.filas = filas;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }
}
