package com.example.demo.dto;

/**
 * DTO que define la configuración de columnas para la tabla de Tareas de Inspección.
 * Cada entrada describe una columna: su encabezado visible, la propiedad del objeto de fila
 * desde la que extraer el valor, y si es una columna útil (true) o estructural/metadata (false).
 */
public class TareaInspeccionColumnaDTO {
    private String header;
    private String field;
    private boolean esUtil;

    public TareaInspeccionColumnaDTO() {}

    public TareaInspeccionColumnaDTO(String header, String field, boolean esUtil) {
        this.header = header;
        this.field = field;
        this.esUtil = esUtil;
    }

    public String getHeader() {
        return header;
    }

    public void setHeader(String header) {
        this.header = header;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public boolean isEsUtil() {
        return esUtil;
    }

    public void setEsUtil(boolean esUtil) {
        this.esUtil = esUtil;
    }
}
