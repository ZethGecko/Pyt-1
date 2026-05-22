package com.example.demo.dto;

/**
 * DTO for the count endpoint: /api/auth/notificaciones/count
 */
public class NotificacionCountDTO {
    private long count;

    public NotificacionCountDTO() {}

    public NotificacionCountDTO(long count) {
        this.count = count;
    }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
