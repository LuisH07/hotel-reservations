package com.bd.hotel.reservations.web.mapper;

import com.bd.hotel.reservations.persistence.entity.Categoria;
import com.bd.hotel.reservations.persistence.entity.Comodidade;
import com.bd.hotel.reservations.persistence.entity.Quarto;
import com.bd.hotel.reservations.web.dto.response.CategoriaResponse;
import com.bd.hotel.reservations.web.dto.response.ComodidadeResponse;
import com.bd.hotel.reservations.web.dto.response.QuartoResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuartoMapper {

    public QuartoResponse toResponse(Quarto quarto) {

        String descricao = null;
        List<ComodidadeResponse> comodidadesList = new ArrayList<>();

        if (quarto.getComodidades() != null && !quarto.getComodidades().isEmpty()) {
            descricao = quarto.getComodidades().stream()
                    .map(Comodidade::getNome)
                    .filter(n -> n != null && !n.isBlank())
                    .sorted(Comparator.naturalOrder())
                    .collect(Collectors.joining(", "));

            comodidadesList = quarto.getComodidades().stream()
                    .map(com -> ComodidadeResponse.builder()
                            .id(com.getId())
                            .nome(com.getNome())
                            .build())
                    .collect(Collectors.toList());
        }

        Categoria cat = quarto.getCategoria();

        CategoriaResponse categoriaResponse = CategoriaResponse.builder()
                .id(cat.getId())
                .nome(cat.getNome())
                .precoDiaria(cat.getPrecoDiaria()) // ajuste o getter conforme sua entity
                .capacidade(cat.getCapacidade())
                .descricao(descricao)
                .build();

        return QuartoResponse.builder()
                .id(quarto.getId())
                .numero(quarto.getNumero())
                .status(quarto.getStatus())
                .area(quarto.getArea())
                .hotelId(quarto.getHotel().getId()) // ou quarto.getHotelId() se você mapeia só a coluna
                .categoria(categoriaResponse)
                .comodidades(comodidadesList)
                .build();
    }
}