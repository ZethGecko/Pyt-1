package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "valor_campo")
public class ValorCampo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_valor_campo")
    private Long idValorCampo;

    @Column(name = "valor", columnDefinition = "TEXT")
    private String valor;

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;

    // Relación con FichaInspeccion (a qué ficha pertenece este valor)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ficha_inspeccion", nullable = false)
    private FichaInspeccion fichaInspeccion;

    // Relación con CampoFormato (qué campo es este)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_campo_formato", nullable = false)
    private CampoFormato campoFormato;

    // Constructores
    public ValorCampo() {}

    public ValorCampo(String valor, String observacion) {
        this.valor = valor;
        this.observacion = observacion;
    }

    // Getters y setters
    public Long getIdValorCampo() {
        return idValorCampo;
    }

    public void setIdValorCampo(Long idValorCampo) {
        this.idValorCampo = idValorCampo;
    }

    public String getValor() {
        return valor;
    }

    public void setValor(String valor) {
        this.valor = valor;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public FichaInspeccion getFichaInspeccion() {
        return fichaInspeccion;
    }

    public void setFichaInspeccion(FichaInspeccion fichaInspeccion) {
        this.fichaInspeccion = fichaInspeccion;
    }

    public CampoFormato getCampoFormato() {
        return campoFormato;
    }

    public void setCampoFormato(CampoFormato campoFormato) {
        this.campoFormato = campoFormato;
    }
}
