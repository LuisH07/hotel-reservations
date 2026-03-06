package com.bd.hotel.reservations.web.controller;

import com.bd.hotel.reservations.application.service.ReservaService;
import com.bd.hotel.reservations.persistence.entity.Reserva;
import com.bd.hotel.reservations.web.dto.request.ReservaRequest;
import com.bd.hotel.reservations.web.dto.response.ReservasDetalhadasResponse;
import com.bd.hotel.reservations.web.dto.response.ReservaResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    // READ
    @GetMapping("/detalhadas")
    public List<ReservasDetalhadasResponse> listar(@RequestParam(required = false) String email) {
        if (email != null && !email.isBlank()) {
            return reservaService.buscarPorEmail(email);
        }
        return reservaService.listarReservasDetalhadas();
    }

    // CREATE
    @PostMapping
    public ResponseEntity<ReservaResponse> criar(@Valid @RequestBody ReservaRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.salvar(dto));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ReservaResponse> atualizar(@PathVariable Long id, @Valid @RequestBody ReservaRequest dto) {
        Reserva reserva = reservaService.atualizar(id, dto);

        ReservaResponse response = new ReservaResponse(
                reserva.getId(),
                reserva.getCliente().getId(),
                reserva.getDataCheckinPrevisto(),
                reserva.getDataCheckoutPrevisto(),
                reserva.getQuartos().stream().map(q -> q.getId()).collect(Collectors.toSet()),
                Set.of()
        );

        return ResponseEntity.ok(response);
    }

    // DELETE
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