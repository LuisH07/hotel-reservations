package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.persistence.repository.RelatorioRepository;
import com.bd.hotel.reservations.web.dto.request.RelatorioRowDto;
import com.bd.hotel.reservations.web.dto.response.RelatorioResponse;
import com.bd.hotel.reservations.web.mapper.RelatorioMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final RelatorioRepository repo;
    private final RelatorioMapper mapper;

    @Transactional(readOnly = true)
    public RelatorioResponse obterRelatorio(Long hotelId) {
        RelatorioRowDto row = repo.obterRelatorio(hotelId);
        return mapper.toResponse(row);
    }
}