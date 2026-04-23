package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "constancia")
public class Constancia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_constancia")
    private Long idConstancia;

    @Column(name = "placa", length = 50, nullable = false)
    private String placa;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    // Relación con TUC
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tuc_id")
    private TUC tuc;

    // Relación con Vehiculo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    // Getters y setters
    public Long getIdConstancia() { return idConstancia; }
    public void setIdConstancia(Long idConstancia) { this.idConstancia = idConstancia; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }

    public TUC getTuc() { return tuc; }
    public void setTuc(TUC tuc) { this.tuc = tuc; }

    public Vehiculo getVehiculo() { return vehiculo; }
    public void setVehiculo(Vehiculo vehiculo) { this.vehiculo = vehiculo; }
}
