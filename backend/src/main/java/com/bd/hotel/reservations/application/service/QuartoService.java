package com.bd.hotel.reservations.application.service;

import com.bd.hotel.reservations.exception.notfound.CategoriaNotFoundException;
import com.bd.hotel.reservations.exception.notfound.HotelNotFoundException;
import com.bd.hotel.reservations.exception.notfound.QuartoNotFoundException;
import com.bd.hotel.reservations.persistence.entity.Categoria;
import com.bd.hotel.reservations.persistence.entity.Comodidade;
import com.bd.hotel.reservations.persistence.entity.Hotel;
import com.bd.hotel.reservations.persistence.entity.Quarto;
import com.bd.hotel.reservations.persistence.repository.CategoriaRepository;
import com.bd.hotel.reservations.persistence.repository.ComodidadeRepository;
import com.bd.hotel.reservations.persistence.repository.HotelRepository;
import com.bd.hotel.reservations.persistence.repository.QuartoRepository;
import com.bd.hotel.reservations.persistence.repository.QuartosDisponiveisViewRepository;
import com.bd.hotel.reservations.web.dto.request.QuartosDisponiveisViewRowDto;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class QuartoService {

    private final QuartosDisponiveisViewRepository viewRepo;
    private final QuartoDisponivelMapper quartoDisponivelMapper;

    private final QuartoRepository quartoRepository;
    private final QuartoMapper quartoMapper;
    
    private final HotelRepository hotelRepository;
    private final CategoriaRepository categoriaRepository;
    private final ComodidadeRepository comodidadeRepository;

    @Transactional
    public QuartoResponse criar(QuartoRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new HotelNotFoundException(request.getHotelId()));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new CategoriaNotFoundException(request.getCategoriaId()));

        Set<Comodidade> comodidades = new HashSet<>();
        if (request.getComodidadeIds() != null && !request.getComodidadeIds().isEmpty()) {
            comodidades.addAll(comodidadeRepository.findAllById(request.getComodidadeIds()));
        }

        Quarto quarto = quartoMapper.toEntity(request, hotel, categoria, comodidades);

        Quarto salvo = quartoRepository.save(quarto);
        return quartoMapper.toResponse(salvo);
    }

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
            out.add(quartoDisponivelMapper.toResponse(r, dataExibicaoMock));
        }

        return out;
    }

    @Transactional(readOnly = true)
    public QuartoResponse buscarPorId(Long id) {
        Quarto quarto = quartoRepository.findById(id)
                .orElseThrow(() -> new QuartoNotFoundException(id));

        // evita LazyInitializationException no quartoDisponivelMapper
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