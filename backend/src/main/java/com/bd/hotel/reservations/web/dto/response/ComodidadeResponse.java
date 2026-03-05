package com.bd.hotel.reservations.web.dto.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ComodidadeResponse {
    private Long id;
    private String nome;
}