package com.example.demo.dto;

public class DepartamentoCreateRequest {
    private String nombre;
    private String descripcion;

    public DepartamentoCreateRequest() {}

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
