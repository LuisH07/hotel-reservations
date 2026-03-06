package com.bd.hotel.reservations.web.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CategoriaResponse {

    Long id;
    String nome;
    BigDecimal precoDiaria;
    Integer capacidade;
    
}