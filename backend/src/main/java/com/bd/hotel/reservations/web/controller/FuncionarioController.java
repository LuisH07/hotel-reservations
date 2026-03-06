package com.bd.hotel.reservations.web.controller;

import com.bd.hotel.reservations.application.service.FuncionarioService;
import com.bd.hotel.reservations.security.AuthUserDetails;
import com.bd.hotel.reservations.web.dto.request.FuncionarioUpdateRequest;
import com.bd.hotel.reservations.web.dto.response.FuncionarioResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/funcionarios")
@RequiredArgsConstructor
public class FuncionarioController {

    private final FuncionarioService funcionarioService;

    @GetMapping("/me")
    public ResponseEntity<FuncionarioResponse> getMyProfile(
            @AuthenticationPrincipal AuthUserDetails userDetails
    ) {
        return ResponseEntity.ok(funcionarioService.buscarPorUserId(userDetails.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<FuncionarioResponse> updateMyProfile(
            @AuthenticationPrincipal AuthUserDetails userDetails,
            @Valid @RequestBody FuncionarioUpdateRequest request
    ) {
        return ResponseEntity.ok(funcionarioService.atualizarPerfil(userDetails.getId(), request));
    }
}