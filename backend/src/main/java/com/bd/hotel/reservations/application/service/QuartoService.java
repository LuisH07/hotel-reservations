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
import com.bd.hotel.reservations.web.dto.request.QuartoRequest;
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
        Hotel hotel = hotelRepository.findById(request.hotelId())
                .orElseThrow(() -> new HotelNotFoundException(request.hotelId()));

        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new CategoriaNotFoundException(request.categoriaId()));

        Set<Comodidade> comodidades = new HashSet<>();
        if (request.comodidadeIds() != null && !request.comodidadeIds().isEmpty()) {
            comodidades.addAll(comodidadeRepository.findAllById(request.comodidadeIds()));
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
        Quarto quarto = buscarEntidadePorId(id);

        // evita LazyInitializationException no quartoDisponivelMapper
        Hibernate.initialize(quarto.getCategoria());
        Hibernate.initialize(quarto.getHotel());
        Hibernate.initialize(quarto.getComodidades());

        return quartoMapper.toResponse(quarto);
    }

    public Quarto buscarEntidadePorId(Long id) {
        return quartoRepository.findById(id)
                .orElseThrow(() -> new QuartoNotFoundException(id));
    }

    public List<Quarto> findAllById(Set<Long> ids) {
        return quartoRepository.findAllById(ids);
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

    @Transactional
    public QuartoResponse atualizar(Long id, QuartoRequest request) {
        Quarto quarto = buscarEntidadePorId(id);

        Hotel hotel = hotelRepository.findById(request.hotelId())
                .orElseThrow(() -> new HotelNotFoundException(request.hotelId()));

        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new CategoriaNotFoundException(request.categoriaId()));

        Set<Comodidade> comodidades = new HashSet<>();
        if (request.comodidadeIds() != null && !request.comodidadeIds().isEmpty()) {
            comodidades.addAll(comodidadeRepository.findAllById(request.comodidadeIds()));
        }

        quarto.atualizar(hotel, categoria, request.numero(), request.status(), request.area(), comodidades);

        Quarto salvo = quartoRepository.save(quarto);
        return quartoMapper.toResponse(salvo);
    }

    @Transactional
    public void deletar(Long id) {
        Quarto quarto = buscarEntidadePorId(id);
        quartoRepository.delete(quarto);
    }
}