package com.bd.hotel.reservations.web.controller;

import com.bd.hotel.reservations.application.service.ReservaService;
import com.bd.hotel.reservations.web.dto.request.ReservaRequest;
import com.bd.hotel.reservations.web.dto.response.ReservaResponse;
import com.bd.hotel.reservations.web.dto.response.ReservasDetalhadasResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping("/detalhadas")
    public ResponseEntity<List<ReservasDetalhadasResponse>> listar(
            @RequestParam(required = false) String email
    ) {
        List<ReservasDetalhadasResponse> response =
                (email != null && !email.isBlank())
                        ? reservaService.buscarPorEmail(email)
                        : reservaService.listarReservasDetalhadas();

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ReservaResponse> criar(
            @Valid @RequestBody ReservaRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservaService.salvar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservaResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ReservaRequest request
    ) {
        return ResponseEntity.ok(reservaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        reservaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        reservaService.cancelar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/concluir")
    public ResponseEntity<Void> concluir(@PathVariable Long id) {
        reservaService.concluir(id);
        return ResponseEntity.noContent().build();
    }
}