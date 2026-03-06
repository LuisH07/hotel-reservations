package com.bd.hotel.reservations.web.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record HospedagemResponse(
    Long id,
    Long reservaId,
    String nomeCliente,
    String cpfCliente,
    Instant dataCheckinReal,
    List<PagamentoResponse> pagamentos
) {
    public record PagamentoResponse(
        Long id,
        String metodoPagamento,
        String statusPagamento,
        BigDecimal valorTotal
    ) {}
}