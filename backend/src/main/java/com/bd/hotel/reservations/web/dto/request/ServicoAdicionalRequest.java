package com.bd.hotel.reservations.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ServicoAdicionalRequest(
    @NotBlank(message = "O nome do serviço é obrigatório")
    String nomeServico,

    String descricao,

    @NotNull(message = "O preço é obrigatório")
    @PositiveOrZero(message = "O preço deve ser maior ou igual a zero")
    BigDecimal preco
) {}