package com.bd.hotel.reservations.web.controller;

import com.bd.hotel.reservations.application.service.ClienteService;
import com.bd.hotel.reservations.security.AuthUserDetails;
import com.bd.hotel.reservations.web.dto.response.ClienteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.bd.hotel.reservations.web.dto.request.ClienteUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping("/me")
    public ResponseEntity<ClienteResponse> getMyProfile(@AuthenticationPrincipal AuthUserDetails userDetails) {
        return ResponseEntity.ok(clienteService.buscarPorIdUsuario(userDetails.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<ClienteResponse> updateMyProfile(
            @AuthenticationPrincipal AuthUserDetails userDetails,
            @Valid @RequestBody ClienteUpdateRequest request
    ) {
        return ResponseEntity.ok(clienteService.atualizarPerfil(userDetails.getId(), request));
    }
}
