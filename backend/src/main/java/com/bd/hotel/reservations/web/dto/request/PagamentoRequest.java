package com.bd.hotel.reservations.web.dto.request;

import com.bd.hotel.reservations.persistence.enums.MetodoPagamento;
import com.bd.hotel.reservations.persistence.enums.StatusPagamento;
import java.math.BigDecimal;
import java.time.Instant;

public record PagamentoRequest(
    MetodoPagamento metodoPagamento,
    StatusPagamento status, 
    BigDecimal valorTotal,
    Instant dataPagamento
) {}