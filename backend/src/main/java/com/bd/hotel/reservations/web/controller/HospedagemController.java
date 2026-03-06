package com.bd.hotel.reservations.web.controller;

import com.bd.hotel.reservations.application.service.HospedagemService;
import com.bd.hotel.reservations.persistence.entity.Hospedagem;
import com.bd.hotel.reservations.web.dto.request.HospedagemRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hospedagens")
@RequiredArgsConstructor
public class HospedagemController {

    private final HospedagemService hospedagemService;

    @PostMapping
    public ResponseEntity<Hospedagem> criar(@RequestBody HospedagemRequest dto) {
        return ResponseEntity.ok(hospedagemService.salvarHospedagem(dto));
    }
}