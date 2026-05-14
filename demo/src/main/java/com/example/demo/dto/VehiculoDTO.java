package com.example.demo.dto;

public class VehiculoDTO {
    private String identificador;
    private String placa;

    public VehiculoDTO() {}

    public VehiculoDTO(String identificador, String placa) {
        this.identificador = identificador;
        this.placa = placa;
    }

    public String getIdentificador() {
        return identificador;
    }

    public void setIdentificador(String identificador) {
        this.identificador = identificador;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }
}
