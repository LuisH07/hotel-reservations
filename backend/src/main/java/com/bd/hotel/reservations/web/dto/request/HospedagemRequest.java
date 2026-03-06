package com.bd.hotel.reservations.web.dto.request;

import java.time.LocalDate;
import java.util.List;

public record HospedagemRequest(
    Long reservaId,
    Long quartoId,
    String clienteCpf,
    LocalDate dataEntrada,
    LocalDate dataSaida,
    PagamentoRequest pagamento,
    List<Long> servicosAdicionaisIds
) {}