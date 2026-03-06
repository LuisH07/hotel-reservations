package com.bd.hotel.reservations.web.dto.request;

import com.bd.hotel.reservations.persistence.enums.MetodoPagamento;
import com.bd.hotel.reservations.persistence.enums.StatusPagamento;
import java.math.BigDecimal;

public record PagamentoRequest(
    BigDecimal valorTotal,
    MetodoPagamento metodoPagamento,
    StatusPagamento statusPagamento
) {}