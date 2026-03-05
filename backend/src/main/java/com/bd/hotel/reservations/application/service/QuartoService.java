package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.exception.notfound.QuartoNotFoundException;
import com.bd.hotel.reservations.persistence.entity.Quarto;
import com.bd.hotel.reservations.persistence.repository.QuartoRepository;
import com.bd.hotel.reservations.persistence.repository.QuartosDisponiveisViewRepository;
import com.bd.hotel.reservations.persistence.repository.QuartosDisponiveisViewRowDto;
import com.bd.hotel.reservations.web.dto.response.QuartoDisponivelResponse;
import com.bd.hotel.reservations.web.dto.response.QuartoResponse;
import com.bd.hotel.reservations.web.mapper.QuartoDisponivelMapper;
import com.bd.hotel.reservations.web.mapper.QuartoMapper;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuartoService {

    private final QuartosDisponiveisViewRepository viewRepo;
    private final QuartoDisponivelMapper mapper;

    @Transactional(readOnly = true)
    public List<QuartoDisponivelResponse> listarDisponiveis(
            LocalDate start,
            LocalDate endExclusive,
            Long hotelId
    ) {

        List<QuartosDisponiveisViewRowDto> rows =
                viewRepo.listarDisponiveis(start, endExclusive, hotelId);

        if (rows.isEmpty()) return List.of();

        String dataExibicaoMock =
                start == null || endExclusive == null
                        ? null
                        : start + " - " + endExclusive;

        List<QuartoDisponivelResponse> out = new ArrayList<>(rows.size());
        for (QuartosDisponiveisViewRowDto r : rows) {
            out.add(mapper.toResponse(r, dataExibicaoMock));
        }

        return out;
    }

    private final QuartoRepository quartoRepository;
    private final QuartoMapper quartoMapper;

    @Transactional(readOnly = true)
    public QuartoResponse buscarPorId(Long id) {
        Quarto quarto = quartoRepository.findById(id)
                .orElseThrow(() -> new QuartoNotFoundException(id));

        // evita LazyInitializationException no mapper
        Hibernate.initialize(quarto.getCategoria());
        Hibernate.initialize(quarto.getHotel());
        Hibernate.initialize(quarto.getComodidades());

        return quartoMapper.toResponse(quarto);
    }

    @Transactional(readOnly = true)
    public List<QuartoResponse> listarTodosPorHotel(Long hotelId) {
        List<Quarto> quartos = quartoRepository.findByHotelId(hotelId);
        
        if (quartos.isEmpty()) return List.of();

        quartos.forEach(quarto -> {
            Hibernate.initialize(quarto.getCategoria());
            Hibernate.initialize(quarto.getHotel());
            Hibernate.initialize(quarto.getComodidades());
        });

        return quartos.stream()
                .map(quartoMapper::toResponse)
                .toList();
    }
}