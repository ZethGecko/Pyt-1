package com.example.demo.controller;

import com.example.demo.dto.AuditLogFilterRequest;
import com.example.demo.dto.AuditLogResponseDTO;
import com.example.demo.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<Page<AuditLogResponseDTO>> getAllAuditLogs(
            AuditLogFilterRequest filter,
            @PageableDefault(size = 20, sort = "fechaAccion") Pageable pageable) {
        Page<AuditLogResponseDTO> logs = auditLogService.getAuditLogs(filter, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{tabla}/{id}")
    public ResponseEntity<Page<AuditLogResponseDTO>> getAuditLogsByRecord(
            @PathVariable String tabla,
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "fechaAccion") Pageable pageable) {
        Page<AuditLogResponseDTO> logs = auditLogService.getAuditLogsByTableAndId(tabla, id, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{tabla}/{id}/{revision}")
    public ResponseEntity<AuditLogResponseDTO> getAuditLogRevision(
            @PathVariable String tabla,
            @PathVariable Long id,
            @PathVariable Long revision) {
        AuditLogResponseDTO log = auditLogService.getAuditLogRevision(tabla, id, revision);
        return ResponseEntity.ok(log);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AuditLogResponseDTO>> searchAuditLogs(
            AuditLogFilterRequest filter,
            @PageableDefault(size = 20, sort = "fechaAccion") Pageable pageable) {
        Page<AuditLogResponseDTO> logs = auditLogService.getAuditLogs(filter, pageable);
        return ResponseEntity.ok(logs);
    }
}