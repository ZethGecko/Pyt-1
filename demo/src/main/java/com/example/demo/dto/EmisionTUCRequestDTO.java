package com.example.demo.dto;

public class EmisionTUCRequestDTO {
    private Long fichaId;
    private String tipo; // "12_MESES" o "HASTA_FIN_ANIO"

    public EmisionTUCRequestDTO() {}

    public Long getFichaId() { return fichaId; }
    public void setFichaId(Long fichaId) { this.fichaId = fichaId; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
}
