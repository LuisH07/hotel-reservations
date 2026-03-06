package com.bd.hotel.reservations.web.mapper;

import com.bd.hotel.reservations.persistence.entity.Categoria;
import com.bd.hotel.reservations.web.dto.request.CategoriaRequest;
import com.bd.hotel.reservations.web.dto.response.CategoriaResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CategoriaMapper {

    public Categoria toEntity(CategoriaRequest request) {
        return Categoria.builder()
                .precoDiaria(request.getPrecoDiaria())
                .nome(request.getNome())
                .capacidade(request.getCapacidade())
                .build();
    }

    public CategoriaResponse toResponse(Categoria entity) {
        return CategoriaResponse.builder()
                .id(entity.getId())
                .precoDiaria(entity.getPrecoDiaria())
                .nome(entity.getNome())
                .capacidade(entity.getCapacidade())
                .build();
    }

    public List<CategoriaResponse> toResponseList(List<Categoria> entities) {
        return entities.stream()
                .map(this::toResponse)
                .toList();
    }
}