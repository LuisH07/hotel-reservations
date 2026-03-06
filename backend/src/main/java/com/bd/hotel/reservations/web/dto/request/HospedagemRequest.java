package com.bd.hotel.reservations.web.dto.request;

import java.time.LocalDate;
import java.util.List;

public record HospedagemRequest(
    Long reservaId,
    String cpfCliente,
    LocalDate dataCheckinPrevista,
    LocalDate dataCheckoutPrevista,
    PagamentoRequest pagamento,
    List<Long> servicosAdicionaisIds
) {}