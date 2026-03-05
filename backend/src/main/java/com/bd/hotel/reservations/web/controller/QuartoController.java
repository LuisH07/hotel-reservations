package com.bd.hotel.reservations.web.controller;

import com.bd.hotel.reservations.application.service.QuartoService;
import com.bd.hotel.reservations.web.dto.response.QuartoDisponivelResponse;
import com.bd.hotel.reservations.web.dto.response.QuartoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/quartos")
@RequiredArgsConstructor
public class QuartoController {

    private final QuartoService quartoService;

    @GetMapping("/disponiveis")
    public List<QuartoDisponivelResponse> listarDisponiveis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(name = "end")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endExclusive,
            @RequestParam(required = false) Long hotelId
    ) {
        return quartoService.listarDisponiveis(start, endExclusive, hotelId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuartoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(quartoService.buscarPorId(id));
    }

    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<List<QuartoResponse>> listarTodosPorHotel(@PathVariable Long hotelId) {
        return ResponseEntity.ok(quartoService.listarTodosPorHotel(hotelId));
    }
}