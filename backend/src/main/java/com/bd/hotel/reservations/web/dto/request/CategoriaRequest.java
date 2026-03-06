package com.bd.hotel.reservations.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoriaRequest {

    @NotNull(message = "O preço da diária é obrigatório")
    @Positive(message = "O preço da diária deve ser maior que zero")
    private BigDecimal precoDiaria;

    @NotBlank(message = "O nome da categoria é obrigatório")
    private String nome;

    @NotNull(message = "A capacidade é obrigatória")
    @Positive(message = "A capacidade deve ser maior que zero")
    private Integer capacidade;
}