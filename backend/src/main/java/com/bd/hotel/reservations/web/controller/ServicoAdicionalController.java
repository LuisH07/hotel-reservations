package com.bd.hotel.reservations.web.controller;

import com.bd.hotel.reservations.application.service.ServicoAdicionalService;
import com.bd.hotel.reservations.web.dto.request.ServicoAdicionalRequest;
import com.bd.hotel.reservations.web.dto.response.ServicoAdicionalResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/servicos-adicionais")
@RequiredArgsConstructor
public class ServicoAdicionalController {

    private final ServicoAdicionalService servicoAdicionalService;

    @PostMapping
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<ServicoAdicionalResponse> criar(
            @RequestBody @Valid ServicoAdicionalRequest request
    ) {
        ServicoAdicionalResponse response = servicoAdicionalService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ServicoAdicionalResponse>> listarTodos() {
        return ResponseEntity.ok(servicoAdicionalService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicoAdicionalResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicoAdicionalService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<ServicoAdicionalResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid ServicoAdicionalRequest request
    ) {
        return ResponseEntity.ok(servicoAdicionalService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        servicoAdicionalService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}