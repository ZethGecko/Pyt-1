package com.example.demo.dto;

public class SubtipoTransporteResponseDTO {
    private Long id;
    private String nombre;
    private TipoTransporteRef tipoTransporte;

    public SubtipoTransporteResponseDTO(Long id, String nombre, Long tipoId, String tipoNombre) {
        this.id = id;
        this.nombre = nombre;
        this.tipoTransporte = new TipoTransporteRef(tipoId, tipoNombre);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public TipoTransporteRef getTipoTransporte() { return tipoTransporte; }
    public void setTipoTransporte(TipoTransporteRef tipoTransporte) { this.tipoTransporte = tipoTransporte; }

    public static class TipoTransporteRef {
        private Long id;
        private String nombre;

        public TipoTransporteRef() {}

        public TipoTransporteRef(Long id, String nombre) {
            this.id = id;
            this.nombre = nombre;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
    }
}
